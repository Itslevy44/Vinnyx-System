<?php

namespace App\Modules\Commission\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionRate extends Model
{
    protected $fillable = [
        'teller_id',
        'service_id',
        'strategy',
        'rate',
        'effective_from',
        'effective_to',
        'is_active',
    ];

    protected $casts = [
        'rate'           => 'decimal:4',
        'effective_from' => 'date',
        'effective_to'   => 'date',
        'is_active'      => 'boolean',
    ];

    public function teller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teller_id');
    }
}
