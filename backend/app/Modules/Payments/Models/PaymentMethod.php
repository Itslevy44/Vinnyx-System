<?php

namespace App\Modules\Payments\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = ['code', 'display_name', 'driver', 'channels', 'is_active', 'sort_order', 'config'];

    protected $casts = [
        'channels'  => 'array',
        'is_active' => 'boolean',
        'config'    => 'encrypted:array',
    ];
}
