<?php

namespace App\Modules\Sales\Events;

use App\Modules\Sales\Models\ServiceSale;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ServiceSaleVoided
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly ServiceSale $sale,
        public readonly string      $reason,
    ) {}
}
