<?php

namespace App\Modules\Payments;

use App\Modules\Payments\Gateways\CashGateway;
use App\Modules\Payments\Gateways\MpesaManualGateway;
use App\Modules\Payments\Services\PaymentManager;
use Illuminate\Support\ServiceProvider;

class PaymentsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CashGateway::class);
        $this->app->singleton(MpesaManualGateway::class);

        $this->app->singleton(PaymentManager::class, function ($app) {
            return new PaymentManager([
                $app->make(CashGateway::class),
                $app->make(MpesaManualGateway::class),
            ]);
        });
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__ . '/Database/Migrations');
    }
}
