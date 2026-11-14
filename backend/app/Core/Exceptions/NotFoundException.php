<?php

namespace App\Core\Exceptions;

class NotFoundException extends AppException
{
    public function __construct(string $resource, string|int $id = '')
    {
        $message = $id ? "{$resource} [{$id}] not found." : "{$resource} not found.";
        parent::__construct($message, 'NOT_FOUND', 404);
    }
}
