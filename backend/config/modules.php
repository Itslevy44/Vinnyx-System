<?php

/*
|--------------------------------------------------------------------------
| Module & Provider Registry
|--------------------------------------------------------------------------
| Each module lists its enabled providers. Switching a provider is a
| config change here plus a service-provider binding update — nothing else.
|
| Phase 1: password auth, cash + mpesa_manual payments.
| Phase 3: add phone_otp, google, apple, mpesa_stk.
| Phase 4: add card, airtel_money.
*/

return [

    'auth' => [
        'enabled'   => true,
        'providers' => [
            'password'  => ['enabled' => true, 'allowed_for' => ['staff', 'customer']],
            'phone_otp' => ['enabled' => false],
            'google'    => ['enabled' => false],
            'apple'     => ['enabled' => false],
        ],
    ],

    'payments' => [
        'enabled'   => true,
        'providers' => [
            'cash'          => ['enabled' => true,  'channels' => ['in_shop']],
            'mpesa_manual'  => ['enabled' => true,  'channels' => ['in_shop']],
            'mpesa_stk'     => ['enabled' => false],
            'card'          => ['enabled' => false],
            'airtel_money'  => ['enabled' => false],
            'bank_transfer' => ['enabled' => false],
            'account_credit'=> ['enabled' => false],
        ],
    ],

    'notifications' => [
        'enabled'   => false,  // Phase 2
        'providers' => [
            'africas_talking' => ['enabled' => false],
            'email'           => ['enabled' => false],
        ],
    ],

    'storage' => [
        'enabled'   => false,  // Phase 2
        'providers' => [
            'local' => ['enabled' => true],
            'r2'    => ['enabled' => false],
        ],
    ],

];
