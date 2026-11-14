<?php

namespace App\Modules\Sales\Http\Controllers;

use App\Core\Http\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Sales\Services\SaleService;
use App\Modules\Sales\Models\ServiceSale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    public function __construct(private readonly SaleService $saleService) {}

    /** GET /sales */
    public function index(Request $request): JsonResponse
    {
        $query = ServiceSale::with('teller')
            ->orderByDesc('created_at');

        // Tellers only see their own sales
        if ($request->user()->role === 'teller') {
            $query->where('teller_id', $request->user()->id);
        }

        $sales = $query->paginate(25);

        return ApiResponse::paginated($sales, fn ($sale) => $this->format($sale));
    }

    /** POST /sales */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_id'   => ['required', 'string', 'max:100'],
            'service_name' => ['required', 'string', 'max:255'],
            'unit_price'   => ['required', 'numeric', 'min:0.01'],
            'quantity'     => ['sometimes', 'integer', 'min:1'],
            'customer_id'  => ['sometimes', 'nullable', 'exists:users,id'],
        ]);

        $sale = $this->saleService->record(
            teller:        $request->user(),
            serviceId:     $validated['service_id'],
            serviceName:   $validated['service_name'],
            unitPriceCents:(int) round($validated['unit_price'] * 100),
            quantity:      $validated['quantity'] ?? 1,
            customerId:    $validated['customer_id'] ?? null,
        );

        return ApiResponse::created($this->format($sale));
    }

    /** GET /sales/{id} */
    public function show(ServiceSale $sale): JsonResponse
    {
        return ApiResponse::ok($this->format($sale->load(['teller', 'payments'])));
    }

    /** POST /sales/{id}/void */
    public function void(Request $request, ServiceSale $sale): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $voided = $this->saleService->void($sale, $request->user(), $validated['reason']);

        return ApiResponse::ok($this->format($voided));
    }

    private function format(ServiceSale $sale): array
    {
        return [
            'id'                => $sale->id,
            'reference'         => $sale->reference,
            'teller'            => $sale->teller ? ['id' => $sale->teller->id, 'name' => $sale->teller->name] : null,
            'service_id'        => $sale->service_id,
            'service_name'      => $sale->service_name,
            'unit_price'        => $sale->unit_price,
            'quantity'          => $sale->quantity,
            'total_amount'      => $sale->total_amount,
            'commission_amount' => $sale->commission_amount,
            'commission_rate'   => $sale->commission_rate,
            'status'            => $sale->status,
            'void_reason'       => $sale->void_reason,
            'created_at'        => $sale->created_at,
        ];
    }
}
