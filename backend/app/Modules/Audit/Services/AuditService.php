<?php

namespace App\Modules\Audit\Services;

use App\Models\User;
use App\Modules\Audit\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Write an audit entry.
     *
     * @param  array<string, mixed>  $payload  Sanitised data — no secrets.
     */
    public function log(
        string  $event,
        string  $module,
        ?User   $user    = null,
        ?Model  $subject = null,
        array   $payload = [],
    ): AuditLog {
        return AuditLog::create([
            'event'        => $event,
            'module'       => $module,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id'   => $subject?->getKey(),
            'user_id'      => $user?->id,
            'ip_address'   => Request::ip(),
            'payload'      => $payload ?: null,
            'created_at'   => now(),
        ]);
    }

    /** Convenience: log from an authenticated request. */
    public function logRequest(
        string  $event,
        string  $module,
        ?Model  $subject = null,
        array   $payload = [],
    ): AuditLog {
        /** @var User|null $user */
        $user = auth()->user();

        return $this->log($event, $module, $user, $subject, $payload);
    }
}
