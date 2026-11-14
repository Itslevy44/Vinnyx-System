<?php

namespace App\Modules\Sales\Models;

use App\Models\User;
use App\Modules\Payments\Models\Payment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class ServiceSale extends Model
{
    protected $fillable = [
        'reference',
        'teller_id',
        'customer_id',
        'service_id',
        'service_name',
        'unit_price',
        'quantity',
        'total_amount',
        'commission_amount',
        'commission_rate',
        'status',
        'void_reason',
        'voided_by',
        'voided_at',
        'branch_id',
    ];

    protected $casts = [
        'unit_price'        => 'decimal:2',
        'total_amount'      => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'commission_rate'   => 'decimal:4',
        'voided_at'         => 'datetime',
    ];

    public function teller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teller_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    /** Polymorphic payments — a sale can have many payments (split payment) */
    public function payments(): MorphMany
    {
        return $this->morphMany(Payment::class, 'payable');
    }

    public function isVoided(): bool
    {
        return $this->status === 'voided';
    }
}
