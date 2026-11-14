<?php

namespace App\Modules\Expenses\Http\Controllers;

use App\Core\Http\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Expenses\Models\Expense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /** GET /expenses */
    public function index(Request $request): JsonResponse
    {
        $expenses = Expense::with('recordedBy')
            ->when($request->query('date'), fn ($q, $d) => $q->whereDate('expense_date', $d))
            ->orderByDesc('expense_date')
            ->paginate(25);

        return ApiResponse::paginated($expenses, fn ($e) => $this->format($e));
    }

    /** POST /expenses */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category'     => ['required', 'string', 'max:100'],
            'description'  => ['required', 'string', 'max:255'],
            'amount'       => ['required', 'numeric', 'min:0.01'],
            'expense_date' => ['required', 'date'],
        ]);

        $expense = Expense::create([
            ...$validated,
            'currency'    => 'KES',
            'reference'   => $this->generateRef(),
            'recorded_by' => $request->user()->id,
            'status'      => 'pending',
        ]);

        return ApiResponse::created($this->format($expense));
    }

    /** PATCH /expenses/{expense}/approve */
    public function approve(Request $request, Expense $expense): JsonResponse
    {
        $expense->update([
            'status'      => 'approved',
            'approved_by' => $request->user()->id,
        ]);

        return ApiResponse::ok($this->format($expense->fresh()));
    }

    private function generateRef(): string
    {
        $count = Expense::count() + 1;
        return sprintf('EX-%d-%05d', now()->year, $count);
    }

    private function format(Expense $e): array
    {
        return [
            'id'           => $e->id,
            'reference'    => $e->reference,
            'category'     => $e->category,
            'description'  => $e->description,
            'amount'       => $e->amount,
            'expense_date' => $e->expense_date,
            'status'       => $e->status,
            'recorded_by'  => $e->recordedBy ? ['id' => $e->recordedBy->id, 'name' => $e->recordedBy->name] : null,
        ];
    }
}
