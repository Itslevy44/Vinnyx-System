<?php

namespace App\Modules\Payments\Contracts;

use App\Modules\Payments\DataObjects\PaymentRequest;
use App\Modules\Payments\DataObjects\PaymentResult;
use App\Modules\Payments\Models\Payment;
use Illuminate\Http\Request;

/**
 * Every payment gateway driver implements this contract.
 * The PaymentManager owns the status machine, idempotency and storage.
 * Gateways only translate between the provider and this contract.
 */
interface PaymentGateway
{
    /** Short code stored in payment_methods: cash, mpesa_manual, mpesa_stk, card, … */
    public function code(): string;

    /** Whether this gateway can handle the given amount/currency/channel right now. */
    public function supports(int $amountCents, string $currency, string $channel): bool;

    /** Start a payment. Returns a result with status pending|succeeded|failed. */
    public function initiate(PaymentRequest $request): PaymentResult;

    /** Poll the provider for the real status (used for missed callbacks). */
    public function query(Payment $payment): PaymentResult;

    /** Verify and parse an inbound provider callback. */
    public function handleCallback(Request $request): PaymentResult;

    /** Refund a succeeded payment (where the provider supports it). */
    public function refund(Payment $payment, int $amountCents, string $reason): PaymentResult;
}
