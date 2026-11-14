<?php

namespace App\Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['nullable', 'email', 'max:255', 'unique:users,email'],
            'phone'      => ['nullable', 'string', 'max:20', 'unique:users,phone'],
            'password'   => ['required', 'string', 'min:8', 'confirmed'],
            'user_type'  => ['sometimes', 'in:customer'],  // staff only via Owner
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if (! $this->input('email') && ! $this->input('phone')) {
                $v->errors()->add('identifier', 'Email or phone is required.');
            }
        });
    }
}
