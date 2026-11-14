<?php

namespace App\Modules\Payments\Gateways;

use App\Core\Exceptions\AppException;
use App\Core\Exceptions\ValidationException;
use App\Modules\Payments\Contracts\PaymentGateway;
use App\Modules\Payments\DataObjects\PaymentRequest;
use App\Modules\Payments\DataObjects\PaymentResult;
use App\Modules\Payments\Models\Payment;
use Illuminate\Http\Request;

/**
 * M-Pesa manual code entry.
 * Staff enter the M-Pesa receipt code (e.g. QBV1234567).
 * We check for duplicates and store the code as provider_reference.
 */
class MpesaManualGateway implements PaymentGateway
{
    public function code(): string
    {
        return 'mpesa_manual';
    }

    public function supports(int $amountCents, string $currency, string $channel): bool
    {
        return $channel === 'in_shop' && $currency === 'KES';
    }

    public function initiate(PaymentRequest $request): PaymentResult
    {
        $mpesaCode = strtoupper(trim($request->meta['mpesa_code'] ?? ''));

        if (empty($mpesaCode)) {
            throw new ValidationException('M-Pesa receipt code is required.', 'MPESA_CODE_MISSING');
        }

        // Block duplicate codes — same code cannot pay two different orders
        $duplicate = Payment::where('provider_reference', $mpesaCode)
            ->where('status', 'succeeded')
            ->exists();

        if ($duplicate) {
            throw new AppException(
                "M-Pesa code [{$mpesaCode}] has already been used.",
                'PAYMENT_DUPLICATE_CODE',
                422
            );
        }

        return new PaymentResult(
            status:            'succeeded',
            providerReference: $mpesaCode,
        );
    }

    public function query(Payment $payment): PaymentResult
    {
        return new PaymentResult(status: $payment->status, providerReference: $payment->provider_reference);
    }

    public function handleCallback(Request $request): PaymentResult
    {
        throw new AppException('M-Pesa manual gateway does not receive callbacks.', 'MPESA_MANUAL_NO_CALLBACK', 400);
    }

    public function refund(Payment $payment, int $amountCents, string $reason): PaymentResult
    {
        // Manual M-Pesa refunds are handled offline; record the refund only.
        return new PaymentResult(status: 'succeeded', providerReference: 'MPESA_MANUAL_REFUND');
    }
}
