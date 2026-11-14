<?php

namespace App\Modules\Audit\Listeners;

use App\Modules\Audit\Services\AuditService;
use App\Modules\Auth\Events\UserLoggedIn;
use App\Modules\Auth\Events\UserRegistered;
use App\Modules\Payments\Events\PaymentSucceeded;
use App\Modules\Payments\Events\PaymentFailed;
use App\Modules\Payments\Events\PaymentRefunded;
use App\Modules\Sales\Events\ServiceSaleRecorded;
use App\Modules\Sales\Events\ServiceSaleVoided;
use App\Modules\DayClose\Events\DayClosed;

/**
 * Subscribes to all auditable events from every module.
 * Modules never call AuditService directly — they fire events.
 */
class AuditEventListener
{
    public function __construct(private readonly AuditService $audit) {}

    public function handleUserLoggedIn(UserLoggedIn $event): void
    {
        $this->audit->log('UserLoggedIn', 'Auth', $event->user, $event->user, [
            'role'      => $event->user->role,
            'user_type' => $event->user->user_type,
        ]);
    }

    public function handleUserRegistered(UserRegistered $event): void
    {
        $this->audit->log('UserRegistered', 'Auth', $event->user, $event->user, [
            'user_type' => $event->user->user_type,
        ]);
    }

    public function handlePaymentSucceeded(PaymentSucceeded $event): void
    {
        $this->audit->log('PaymentSucceeded', 'Payments', null, $event->payment, [
            'amount' => $event->payment->amount,
            'method' => $event->payment->method_code,
        ]);
    }

    public function handlePaymentFailed(PaymentFailed $event): void
    {
        $this->audit->log('PaymentFailed', 'Payments', null, $event->payment, [
            'reason' => $event->payment->failure_reason,
        ]);
    }

    public function handlePaymentRefunded(PaymentRefunded $event): void
    {
        $this->audit->log('PaymentRefunded', 'Payments', null, $event->payment, [
            'amount' => $event->refund->amount,
        ]);
    }

    public function handleServiceSaleRecorded(ServiceSaleRecorded $event): void
    {
        $this->audit->log('ServiceSaleRecorded', 'Sales', null, $event->sale, [
            'total'  => $event->sale->total_amount,
            'teller' => $event->sale->teller_id,
        ]);
    }

    public function handleServiceSaleVoided(ServiceSaleVoided $event): void
    {
        $this->audit->log('ServiceSaleVoided', 'Sales', null, $event->sale, [
            'reason' => $event->reason,
        ]);
    }

    public function handleDayClosed(DayClosed $event): void
    {
        $this->audit->log('DayClosed', 'DayClose', null, $event->dayClose, [
            'date'         => $event->dayClose->business_date,
            'closed_by'    => $event->dayClose->closed_by,
            'total_cash'   => $event->dayClose->total_cash,
            'total_mpesa'  => $event->dayClose->total_mpesa,
        ]);
    }

    /** Register all event→method mappings. */
    public function subscribe(\Illuminate\Events\Dispatcher $events): array
    {
        return [
            UserLoggedIn::class       => 'handleUserLoggedIn',
            UserRegistered::class     => 'handleUserRegistered',
            PaymentSucceeded::class   => 'handlePaymentSucceeded',
            PaymentFailed::class      => 'handlePaymentFailed',
            PaymentRefunded::class    => 'handlePaymentRefunded',
            ServiceSaleRecorded::class => 'handleServiceSaleRecorded',
            ServiceSaleVoided::class  => 'handleServiceSaleVoided',
            DayClosed::class          => 'handleDayClosed',
        ];
    }
}
