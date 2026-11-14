<?php

namespace App\Modules\Payments\Events;

use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Models\Refund;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentRefunded
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Payment $payment,
        public readonly Refund  $refund,
    ) {}
}
