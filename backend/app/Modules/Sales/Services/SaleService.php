<?php

namespace App\Modules\Sales\Services;

use App\Core\Exceptions\AppException;
use App\Core\Exceptions\NotFoundException;
use App\Core\ValueObjects\Money;
use App\Models\User;
use App\Modules\Commission\Services\CommissionResolver;
use App\Modules\Sales\Events\ServiceSaleRecorded;
use App\Modules\Sales\Events\ServiceSaleVoided;
use App\Modules\Sales\Models\ServiceSale;
use Illuminate\Support\Facades\DB;

class SaleService
{
    public function __construct(
        private readonly CommissionResolver $commission,
    ) {}

    public function record(
        User    $teller,
        string  $serviceId,
        string  $serviceName,
        int     $unitPriceCents,
        int     $quantity = 1,
        ?int    $customerId = null,
    ): ServiceSale {
        $unitPrice   = Money::of($unitPriceCents);
        $total       = Money::of($unitPriceCents * $quantity);
        $commission  = $this->commission->resolve($teller, $serviceId, $total);

        $sale = DB::transaction(function () use (
            $teller, $serviceId, $serviceName, $unitPrice, $total, $commission, $quantity, $customerId
        ) {
            $sale = ServiceSale::create([
                'reference'         => $this->generateReference(),
                'teller_id'         => $teller->id,
                'customer_id'       => $customerId,
                'service_id'        => $serviceId,
                'service_name'      => $serviceName,
                'unit_price'        => $unitPrice->decimal(),
                'quantity'          => $quantity,
                'total_amount'      => $total->decimal(),
                'commission_amount' => $commission->decimal(),
                'commission_rate'   => $this->resolveRate($commission, $total),
                'status'            => 'completed',
            ]);

            event(new ServiceSaleRecorded($sale));

            return $sale;
        });

        return $sale;
    }

    public function void(ServiceSale $sale, User $voidedBy, string $reason): ServiceSale
    {
        if ($sale->isVoided()) {
            throw new AppException('Sale is already voided.', 'SALE_ALREADY_VOIDED', 422);
        }

        DB::transaction(function () use ($sale, $voidedBy, $reason) {
            $sale->update([
                'status'      => 'voided',
                'void_reason' => $reason,
                'voided_by'   => $voidedBy->id,
                'voided_at'   => now(),
            ]);

            event(new ServiceSaleVoided($sale->fresh(), $reason));
        });

        return $sale->fresh();
    }

    private function generateReference(): string
    {
        $year  = now()->year;
        $count = ServiceSale::whereYear('created_at', $year)->count() + 1;

        return sprintf('SV-%d-%05d', $year, $count);
    }

    private function resolveRate(Money $commission, Money $total): float
    {
        if ($total->isZero()) return 0.0;

        return round($commission->cents() / $total->cents() * 100, 4);
    }
}
