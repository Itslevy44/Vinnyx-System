<?php

namespace App\Core\Exceptions;

class ValidationException extends AppException
{
    public function __construct(string $message, string $errorCode = 'VALIDATION_ERROR')
    {
        parent::__construct($message, $errorCode, 422);
    }
}
