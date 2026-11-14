<?php

namespace App\Modules\Commission\Strategies;

use App\Core\ValueObjects\Money;
use App\Models\User;
use App\Modules\Commission\Contracts\CommissionStrategy;
use App\Modules\Commission\Models\CommissionRate;
use App\Modules\Settings\Services\SettingsService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PercentageStrategy implements CommissionStrategy
{
    public function __construct(private readonly SettingsService $settings) {}

    public function key(): string
    {
        return 'percentage';
    }

    public function resolve(User $teller, string $serviceId, Money $amount, Carbon $date): Money
    {
        $rate = $this->resolveRate($teller->id, $serviceId, $date);

        $commissionCents = (int) round($amount->cents() * $rate / 100);

        return Money::of($commissionCents, $amount->currency());
    }

    /**
     * Four-level fallback:
     *   1. teller + service
     *   2. teller only
     *   3. service only
     *   4. global default
     */
    private function resolveRate(int $tellerId, string $serviceId, Carbon $date): float
    {
        $dateStr = $date->toDateString();

        $row = CommissionRate::where('is_active', true)
            ->where(fn ($q) => $q->whereNull('effective_from')->orWhere('effective_from', '<=', $dateStr))
            ->where(fn ($q) => $q->whereNull('effective_to')->orWhere('effective_to', '>=', $dateStr))
            ->orderByRaw(
                // Highest specificity first: both set = 2, one set = 1, neither = 0
                'CASE
                    WHEN teller_id IS NOT NULL AND service_id IS NOT NULL THEN 2
                    WHEN teller_id IS NOT NULL OR  service_id IS NOT NULL THEN 1
                    ELSE 0
                END DESC'
            )
            ->where(function ($q) use ($tellerId, $serviceId) {
                $q->where(fn ($q2) => $q2->where('teller_id', $tellerId)->where('service_id', $serviceId))
                  ->orWhere(fn ($q2) => $q2->where('teller_id', $tellerId)->whereNull('service_id'))
                  ->orWhere(fn ($q2) => $q2->whereNull('teller_id')->where('service_id', $serviceId))
                  ->orWhere(fn ($q2) => $q2->whereNull('teller_id')->whereNull('service_id'));
            })
            ->first();

        if ($row) {
            return (float) $row->rate;
        }

        // Ultimate fallback: global setting
        return (float) $this->settings->get('default_commission_rate', 10);
    }
}
