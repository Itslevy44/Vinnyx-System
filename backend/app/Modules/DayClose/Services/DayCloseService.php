<?php

namespace App\Modules\DayClose\Services;

use App\Core\Exceptions\AppException;
use App\Models\User;
use App\Modules\DayClose\Events\DayClosed;
use App\Modules\DayClose\Models\DayClose;
use App\Modules\Expenses\Models\Expense;
use App\Modules\Payments\Models\Payment;
use App\Modules\Sales\Models\ServiceSale;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DayCloseService
{
    public function close(User $closedBy, ?string $date = null, ?float $cashCounted = null, ?string $notes = null): DayClose
    {
        $businessDate = $date ? Carbon::parse($date)->toDateString() : Carbon::today()->toDateString();

        // Cannot close the same day twice
        if (DayClose::where('business_date', $businessDate)->exists()) {
            throw new AppException(
                "Day [{$businessDate}] has already been closed.",
                'DAY_ALREADY_CLOSED',
                422
            );
        }

        return DB::transaction(function () use ($closedBy, $businessDate, $cashCounted, $notes) {
            // Totals from succeeded payments on this date
            $paymentTotals = Payment::where('status', 'succeeded')
                ->whereDate('completed_at', $businessDate)
                ->selectRaw('method_code, SUM(amount) as total')
                ->groupBy('method_code')
                ->pluck('total', 'method_code')
                ->all();

            $totalCash   = (float) ($paymentTotals['cash'] ?? 0);
            $totalMpesa  = (float) ($paymentTotals['mpesa_manual'] ?? 0);
            $totalSales  = array_sum($paymentTotals);

            // Commission from completed sales on this date
            $totalCommission = (float) ServiceSale::where('status', 'completed')
                ->whereDate('created_at', $businessDate)
                ->sum('commission_amount');

            // Approved expenses on this date
            $totalExpenses = (float) Expense::where('status', 'approved')
                ->whereDate('expense_date', $businessDate)
                ->sum('amount');

            $cashVariance = $cashCounted !== null ? $cashCounted - $totalCash : 0;

            $dayClose = DayClose::create([
                'business_date'    => $businessDate,
                'total_cash'       => $totalCash,
                'total_mpesa'      => $totalMpesa,
                'total_sales'      => $totalSales,
                'total_commission' => $totalCommission,
                'total_expenses'   => $totalExpenses,
                'cash_variance'    => $cashVariance,
                'cash_counted'     => $cashCounted,
                'breakdown'        => $paymentTotals,
                'closed_by'        => $closedBy->id,
                'notes'            => $notes,
                'closed_at'        => now(),
            ]);

            event(new DayClosed($dayClose));

            return $dayClose;
        });
    }

    public function preview(string $date): array
    {
        $paymentTotals = Payment::where('status', 'succeeded')
            ->whereDate('completed_at', $date)
            ->selectRaw('method_code, SUM(amount) as total')
            ->groupBy('method_code')
            ->pluck('total', 'method_code')
            ->all();

        $totalCommission = (float) ServiceSale::where('status', 'completed')
            ->whereDate('created_at', $date)
            ->sum('commission_amount');

        $totalExpenses = (float) Expense::where('status', 'approved')
            ->whereDate('expense_date', $date)
            ->sum('amount');

        return [
            'business_date'    => $date,
            'breakdown'        => $paymentTotals,
            'total_sales'      => array_sum($paymentTotals),
            'total_commission' => $totalCommission,
            'total_expenses'   => $totalExpenses,
            'already_closed'   => DayClose::where('business_date', $date)->exists(),
        ];
    }
}
