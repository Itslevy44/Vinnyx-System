<?php

namespace App\Modules\Payments\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentCallback extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'provider',
        'raw_payload',
        'verification_result',
        'payment_id',
        'received_at',
        'processed_at',
    ];

    protected $casts = [
        'raw_payload'  => 'array',
        'received_at'  => 'datetime',
        'processed_at' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
