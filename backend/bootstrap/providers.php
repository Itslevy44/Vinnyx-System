<?php

use App\Providers\AppServiceProvider;
use App\Modules\Auth\AuthServiceProvider;
use App\Modules\Settings\SettingsServiceProvider;
use App\Modules\Audit\AuditServiceProvider;
use App\Modules\Commission\CommissionServiceProvider;
use App\Modules\Payments\PaymentsServiceProvider;
use App\Modules\Sales\SalesServiceProvider;
use App\Modules\Expenses\ExpensesServiceProvider;
use App\Modules\DayClose\DayCloseServiceProvider;

return [
    AppServiceProvider::class,

    // Phase 1 modules (order matters: Settings before others that depend on it)
    SettingsServiceProvider::class,
    AuthServiceProvider::class,
    AuditServiceProvider::class,
    CommissionServiceProvider::class,
    PaymentsServiceProvider::class,
    SalesServiceProvider::class,
    ExpensesServiceProvider::class,
    DayCloseServiceProvider::class,
];
