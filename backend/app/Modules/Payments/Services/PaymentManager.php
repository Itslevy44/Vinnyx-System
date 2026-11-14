<?php

namespace App\Modules\Payments\Services;

use App\Core\Exceptions\AppException;
use App\Core\Exceptions\NotFoundException;
use App\Modules\Payments\Contracts\PaymentGateway;
use App\Modules\Payments\DataObjects\PaymentRequest;
use App\Modules\Payments\Events\PaymentFailed;
use App\Modules\Payments\Events\PaymentSucceeded;
use App\Modules\Payments\Events\PaymentRefunded;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\PaymentAttempt;
use App\Modules\Payments\Models\Refund;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentManager
{
    /** @param  array<PaymentGateway>  $gateways */
    public function __construct(private readonly array $gateways) {}

    /**
     * Initiate a payment. Returns the Payment model.
     * Idempotent: same idempotency_key returns the existing payment.
     */
    public function initiate(PaymentRequest $req): Payment
    {
        // Idempotency check
        $existing = Payment::where('idempotency_key', $req->idempotencyKey)->first();
        if ($existing) {
            return $existing;
        }

        $gateway = $this->resolveGateway($req->methodCode);

        if (! $gateway->supports($req->amountCents, $req->currency, $req->channel)) {
            throw new AppException(
                "Gateway [{$req->methodCode}] does not support this payment.",
                'GATEWAY_UNSUPPORTED', 422
            );
        }

        return DB::transaction(function () use ($req, $gateway) {
            $payment = Payment::create([
                'uuid'             => Str::uuid(),
                'payable_type'     => $req->payableType,
                'payable_id'       => $req->payableId,
                'method_code'      => $req->methodCode,
                'amount'           => $req->amountCents / 100,
                'currency'         => $req->currency,
                'status'           => 'initiated',
                'idempotency_key'  => $req->idempotencyKey,
                'payer_phone'      => $req->payerPhone,
                'initiated_by'     => $req->initiatedBy,
                'initiated_at'     => now(),
            ]);

            $attempt = PaymentAttempt::create([
                'payment_id'      => $payment->id,
                'request_summary' => ['method' => $req->methodCode, 'amount' => $req->amountCents],
                'status'          => 'started',
                'started_at'      => now(),
            ]);

            try {
                $result = $gateway->initiate($req);

                $this->applyResult($payment, $result);

                $attempt->update([
                    'status'           => $result->status,
                    'response_summary' => ['status' => $result->status, 'ref' => $result->providerReference],
                    'completed_at'     => now(),
                ]);

                $this->fireEvent($payment);

            } catch (\Throwable $e) {
                $payment->update(['status' => 'failed', 'failure_reason' => $e->getMessage(), 'completed_at' => now()]);
                $attempt->update(['status' => 'failed', 'completed_at' => now()]);
                event(new PaymentFailed($payment));
                throw $e;
            }

            return $payment->fresh();
        });
    }

    public function refund(string $paymentUuid, int $amountCents, string $reason, int $approvedBy): Refund
    {
        $payment = Payment::where('uuid', $paymentUuid)->firstOrFail();

        if (! $payment->isSucceeded()) {
            throw new AppException('Only succeeded payments can be refunded.', 'REFUND_INVALID_STATUS', 422);
        }

        $gateway = $this->resolveGateway($payment->method_code);

        return DB::transaction(function () use ($payment, $amountCents, $reason, $approvedBy, $gateway) {
            $result = $gateway->refund($payment, $amountCents, $reason);

            $refund = Refund::create([
                'payment_id'         => $payment->id,
                'amount'             => $amountCents / 100,
                'reason'             => $reason,
                'status'             => $result->status,
                'approved_by'        => $approvedBy,
                'provider_reference' => $result->providerReference,
            ]);

            // Update payment status
            $totalRefunded = $payment->refunds()->where('status', 'succeeded')->sum('amount');
            $payment->update([
                'status' => bccomp((string)$totalRefunded, (string)$payment->amount, 2) >= 0
                    ? 'refunded'
                    : 'partially_refunded',
            ]);

            event(new PaymentRefunded($payment, $refund));

            return $refund;
        });
    }

    public function getByUuid(string $uuid): Payment
    {
        $payment = Payment::where('uuid', $uuid)->first();
        if (! $payment) {
            throw new NotFoundException('Payment', $uuid);
        }

        return $payment;
    }

    private function applyResult(Payment $payment, \App\Modules\Payments\DataObjects\PaymentResult $result): void
    {
        $update = ['status' => $result->status];

        if ($result->providerReference) {
            $update['provider_reference'] = $result->providerReference;
        }
        if ($result->failureReason) {
            $update['failure_reason'] = $result->failureReason;
        }
        if (in_array($result->status, ['succeeded', 'failed', 'cancelled', 'expired'], true)) {
            $update['completed_at'] = now();
        }

        $payment->update($update);
    }

    private function fireEvent(Payment $payment): void
    {
        match ($payment->status) {
            'succeeded' => event(new PaymentSucceeded($payment)),
            'failed'    => event(new PaymentFailed($payment)),
            default     => null,
        };
    }

    private function resolveGateway(string $code): PaymentGateway
    {
        foreach ($this->gateways as $gateway) {
            if ($gateway->code() === $code) {
                return $gateway;
            }
        }
        throw new NotFoundException('Payment gateway', $code);
    }
}
