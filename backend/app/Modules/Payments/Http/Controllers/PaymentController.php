<?php

namespace App\Modules\Payments\Http\Controllers;

use App\Core\Http\ApiResponse;
use App\Http\Controllers\Controller;
use App\Modules\Payments\DataObjects\PaymentRequest;
use App\Modules\Payments\Models\PaymentMethod;
use App\Modules\Payments\Services\PaymentManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentManager $manager) {}

    /** GET /payment-methods?channel=in_shop */
    public function methods(Request $request): JsonResponse
    {
        $channel = $request->query('channel', 'in_shop');

        $methods = PaymentMethod::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->filter(fn ($m) => in_array($channel, json_decode($m->channels, true) ?? [], true))
            ->map(fn ($m) => [
                'code'         => $m->code,
                'display_name' => $m->display_name,
                'channels'     => json_decode($m->channels, true),
            ])
            ->values();

        return ApiResponse::ok($methods);
    }

    /** POST /payments — staff creating a payment */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payable_type'    => ['required', 'string'],
            'payable_id'      => ['required', 'integer'],
            'method_code'     => ['required', 'string'],
            'amount'          => ['required', 'numeric', 'min:1'],
            'channel'         => ['required', 'in:in_shop,online'],
            'payer_phone'     => ['nullable', 'string', 'max:20'],
            'meta'            => ['sometimes', 'array'],
            'idempotency_key' => ['sometimes', 'string', 'max:100'],
        ]);

        $req = new PaymentRequest(
            payableType:    $validated['payable_type'],
            payableId:      $validated['payable_id'],
            methodCode:     $validated['method_code'],
            amountCents:    (int) round($validated['amount'] * 100),
            currency:       'KES',
            channel:        $validated['channel'],
            idempotencyKey: $validated['idempotency_key'] ?? Str::uuid(),
            payerPhone:     $validated['payer_phone'] ?? null,
            initiatedBy:    $request->user()?->id,
            meta:           $validated['meta'] ?? [],
        );

        $payment = $this->manager->initiate($req);

        return ApiResponse::created($this->format($payment));
    }

    /** GET /payments/{uuid} */
    public function show(string $uuid): JsonResponse
    {
        $payment = $this->manager->getByUuid($uuid);

        return ApiResponse::ok($this->format($payment));
    }

    /** POST /payments/{uuid}/refund */
    public function refund(Request $request, string $uuid): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $refund = $this->manager->refund(
            $uuid,
            (int) round($validated['amount'] * 100),
            $validated['reason'],
            $request->user()->id,
        );

        return ApiResponse::created([
            'id'     => $refund->id,
            'amount' => $refund->amount,
            'status' => $refund->status,
        ]);
    }

    private function format(\App\Modules\Payments\Models\Payment $payment): array
    {
        return [
            'uuid'               => $payment->uuid,
            'method_code'        => $payment->method_code,
            'amount'             => $payment->amount,
            'currency'           => $payment->currency,
            'status'             => $payment->status,
            'provider_reference' => $payment->provider_reference,
            'initiated_at'       => $payment->initiated_at,
            'completed_at'       => $payment->completed_at,
        ];
    }
}
