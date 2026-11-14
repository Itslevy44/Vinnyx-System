<?php

namespace App\Modules\DayClose\Http\Controllers;

use App\Core\Http\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\DayClose\Models\DayClose;
use App\Modules\DayClose\Services\DayCloseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DayCloseController extends Controller
{
    public function __construct(private readonly DayCloseService $service) {}

    /** GET /day-close/preview?date=2026-11-07 */
    public function preview(Request $request): JsonResponse
    {
        $date = $request->query('date', now()->toDateString());

        return ApiResponse::ok($this->service->preview($date));
    }

    /** POST /day-close */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date'         => ['sometimes', 'date'],
            'cash_counted' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'notes'        => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $dayClose = $this->service->close(
            $request->user(),
            $validated['date']         ?? null,
            isset($validated['cash_counted']) ? (float) $validated['cash_counted'] : null,
            $validated['notes']        ?? null,
        );

        return ApiResponse::created($this->format($dayClose));
    }

    /** GET /day-close */
    public function index(): JsonResponse
    {
        $closes = DayClose::with('closedBy')
            ->orderByDesc('business_date')
            ->paginate(30);

        return ApiResponse::paginated($closes, fn ($d) => $this->format($d));
    }

    /** GET /day-close/{id} */
    public function show(DayClose $dayClose): JsonResponse
    {
        return ApiResponse::ok($this->format($dayClose->load('closedBy')));
    }

    private function format(DayClose $d): array
    {
        return [
            'id'               => $d->id,
            'business_date'    => $d->business_date,
            'total_cash'       => $d->total_cash,
            'total_mpesa'      => $d->total_mpesa,
            'total_sales'      => $d->total_sales,
            'total_commission' => $d->total_commission,
            'total_expenses'   => $d->total_expenses,
            'cash_variance'    => $d->cash_variance,
            'cash_counted'     => $d->cash_counted,
            'breakdown'        => $d->breakdown,
            'notes'            => $d->notes,
            'closed_by'        => $d->closedBy ? ['id' => $d->closedBy->id, 'name' => $d->closedBy->name] : null,
            'closed_at'        => $d->closed_at,
        ];
    }
}
