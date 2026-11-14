<?php

namespace App\Modules\Commission\Contracts;

use App\Core\ValueObjects\Money;
use App\Models\User;
use Carbon\Carbon;

/**
 * Every commission calculation strategy implements this contract.
 * The result is snapshotted on the sale line — the strategy is never
 * re-run after a sale is recorded.
 */
interface CommissionStrategy
{
    public function key(): string;

    /**
     * Resolve the commission amount for one sale line.
     *
     * @param  User    $teller     The staff member who made the sale
     * @param  string  $serviceId  The service being sold
     * @param  Money   $amount     The sale line amount (before commission)
     * @param  Carbon  $date       The sale date
     */
    public function resolve(User $teller, string $serviceId, Money $amount, Carbon $date): Money;
}
