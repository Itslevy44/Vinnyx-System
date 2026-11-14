<?php

namespace App\Core\Exceptions;

class UnauthorizedException extends AppException
{
    public function __construct(string $message = 'Unauthorized.')
    {
        parent::__construct($message, 'UNAUTHORIZED', 401);
    }
}
