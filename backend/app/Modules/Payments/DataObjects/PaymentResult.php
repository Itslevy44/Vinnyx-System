<?php

namespace App\Modules\Payments\DataObjects;

final class PaymentResult
{
    public function __construct(
        public readonly string  $status,            // pending | succeeded | failed | cancelled
        public readonly ?string $providerReference = null,
        public readonly ?string $failureReason     = null,
        public readonly array   $meta              = [],
    ) {}

    public function succeeded(): bool { return $this->status === 'succeeded'; }
    public function failed(): bool    { return $this->status === 'failed';    }
    public function pending(): bool   { return $this->status === 'pending';   }
}
