<?php

namespace App\Modules\DayClose\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DayClose extends Model
{
    protected $fillable = [
        'business_date', 'total_cash', 'total_mpesa', 'total_sales',
        'total_commission', 'total_expenses', 'cash_variance', 'cash_counted',
        'breakdown', 'closed_by', 'notes', 'branch_id', 'closed_at',
    ];

    protected $casts = [
        'business_date'    => 'date',
        'total_cash'       => 'decimal:2',
        'total_mpesa'      => 'decimal:2',
        'total_sales'      => 'decimal:2',
        'total_commission' => 'decimal:2',
        'total_expenses'   => 'decimal:2',
        'cash_variance'    => 'decimal:2',
        'cash_counted'     => 'decimal:2',
        'breakdown'        => 'array',
        'closed_at'        => 'datetime',
    ];

    public function closedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'closed_by');
    }
}
