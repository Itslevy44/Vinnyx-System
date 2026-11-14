<?php

namespace App\Modules\Commission\Services;

use App\Core\ValueObjects\Money;
use App\Models\User;
use App\Modules\Commission\Contracts\CommissionStrategy;
use Carbon\Carbon;

class CommissionResolver
{
    /** @param  array<CommissionStrategy>  $strategies */
    public function __construct(private readonly array $strategies) {}

    /**
     * Resolve the commission for a sale line.
     * Uses the percentage strategy today; swappable via config later.
     */
    public function resolve(User $teller, string $serviceId, Money $amount, ?Carbon $date = null): Money
    {
        $date     = $date ?? Carbon::today();
        $strategy = $this->activeStrategy();

        return $strategy->resolve($teller, $serviceId, $amount, $date);
    }

    private function activeStrategy(): CommissionStrategy
    {
        // For now, always percentage. Phase 4: read from settings.
        foreach ($this->strategies as $strategy) {
            if ($strategy->key() === 'percentage') {
                return $strategy;
            }
        }

        return $this->strategies[0];
    }
}
