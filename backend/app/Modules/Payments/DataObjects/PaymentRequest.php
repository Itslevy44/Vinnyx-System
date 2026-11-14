<?php

namespace App\Modules\Payments\DataObjects;

final class PaymentRequest
{
    public function __construct(
        public readonly string  $payableType,
        public readonly int     $payableId,
        public readonly string  $methodCode,
        public readonly int     $amountCents,
        public readonly string  $currency,
        public readonly string  $channel,         // in_shop | online
        public readonly string  $idempotencyKey,
        public readonly ?string $payerPhone      = null,
        public readonly ?int    $initiatedBy     = null, // user_id
        public readonly array   $meta            = [],   // e.g. ['mpesa_code' => 'QBV123']
    ) {}
}
