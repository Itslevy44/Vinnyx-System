<?php

namespace App\Modules\Payments\Gateways;

use App\Modules\Payments\Contracts\PaymentGateway;
use App\Modules\Payments\DataObjects\PaymentRequest;
use App\Modules\Payments\DataObjects\PaymentResult;
use App\Modules\Payments\Models\Payment;
use App\Core\Exceptions\AppException;
use Illuminate\Http\Request;

/**
 * Cash payments succeed immediately at the counter.
 * They are counted and reconciled at day close.
 */
class CashGateway implements PaymentGateway
{
    public function code(): string
    {
        return 'cash';
    }

    public function supports(int $amountCents, string $currency, string $channel): bool
    {
        return $channel === 'in_shop';
    }

    public function initiate(PaymentRequest $request): PaymentResult
    {
        // Cash always succeeds immediately — no async needed.
        return new PaymentResult(status: 'succeeded');
    }

    public function query(Payment $payment): PaymentResult
    {
        // Cash is always in its terminal state.
        return new PaymentResult(status: $payment->status);
    }

    public function handleCallback(Request $request): PaymentResult
    {
        // Cash has no callbacks.
        throw new AppException('Cash gateway does not receive callbacks.', 'CASH_NO_CALLBACK', 400);
    }

    public function refund(Payment $payment, int $amountCents, string $reason): PaymentResult
    {
        // Cash refunds are manual hand-backs; we just record the refund row.
        return new PaymentResult(status: 'succeeded', providerReference: 'CASH_REFUND');
    }
}
