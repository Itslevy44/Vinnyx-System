<?php

namespace App\Modules\DayClose\Events;

use App\Modules\DayClose\Models\DayClose;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DayClosed
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly DayClose $dayClose) {}
}
