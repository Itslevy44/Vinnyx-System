<?php

namespace App\Modules\Payments\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'payable_type',
        'payable_id',
        'method_code',
        'amount',
        'currency',
        'status',
        'provider_reference',
        'idempotency_key',
        'payer_phone',
        'initiated_by',
        'branch_id',
        'failure_reason',
        'initiated_at',
        'completed_at',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'initiated_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /** The column used for UUID lookups */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function payable(): MorphTo
    {
        return $this->morphTo();
    }

    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(PaymentAttempt::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function callbacks(): HasMany
    {
        return $this->hasMany(PaymentCallback::class);
    }

    public function isSucceeded(): bool  { return $this->status === 'succeeded'; }
    public function isPending(): bool    { return $this->status === 'pending'; }
    public function isFinalised(): bool  { return in_array($this->status, ['succeeded','failed','cancelled','expired','refunded'], true); }
}
