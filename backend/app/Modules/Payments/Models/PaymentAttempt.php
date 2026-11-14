<?php

namespace App\Modules\Payments\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAttempt extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'payment_id',
        'request_summary',
        'response_summary',
        'status',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'request_summary'  => 'array',
        'response_summary' => 'array',
        'started_at'       => 'datetime',
        'completed_at'     => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }
}
