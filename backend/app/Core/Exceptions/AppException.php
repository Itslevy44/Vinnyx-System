<?php

namespace App\Core\Exceptions;

use RuntimeException;

/**
 * Base application exception.
 * All module exceptions extend this so the handler can catch them uniformly.
 */
class AppException extends RuntimeException
{
    public function __construct(
        string           $message,
        private readonly string $errorCode = 'INTERNAL_ERROR',
        int              $statusCode = 500,
        ?\Throwable      $previous = null,
    ) {
        parent::__construct($message, $statusCode, $previous);
    }

    public function errorCode(): string
    {
        return $this->errorCode;
    }

    public function statusCode(): int
    {
        return $this->getCode();
    }
}
