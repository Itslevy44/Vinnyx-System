<?php

namespace App\Core\ValueObjects;

use InvalidArgumentException;

/**
 * Immutable money value object.
 * Always stored and compared in integer cents to avoid float drift.
 * All amounts in the system are KES unless currency is specified.
 */
final class Money
{
    private function __construct(
        private readonly int    $cents,
        private readonly string $currency,
    ) {
        if ($cents < 0) {
            throw new InvalidArgumentException("Money amount cannot be negative ({$cents} cents).");
        }
    }

    public static function of(int $cents, string $currency = 'KES'): self
    {
        return new self($cents, strtoupper($currency));
    }

    /** Create from a decimal string or float, e.g. "1500.50" */
    public static function fromDecimal(string|float $amount, string $currency = 'KES'): self
    {
        $cents = (int) round((float) $amount * 100);

        return new self($cents, strtoupper($currency));
    }

    public function cents(): int
    {
        return $this->cents;
    }

    /** Returns a DECIMAL(12,2)-safe string, e.g. "1500.50" */
    public function decimal(): string
    {
        return number_format($this->cents / 100, 2, '.', '');
    }

    public function currency(): string
    {
        return $this->currency;
    }

    public function add(Money $other): self
    {
        $this->assertSameCurrency($other);

        return new self($this->cents + $other->cents, $this->currency);
    }

    public function subtract(Money $other): self
    {
        $this->assertSameCurrency($other);
        $result = $this->cents - $other->cents;
        if ($result < 0) {
            throw new InvalidArgumentException('Subtraction would produce negative money.');
        }

        return new self($result, $this->currency);
    }

    public function equals(Money $other): bool
    {
        return $this->cents === $other->cents && $this->currency === $other->currency;
    }

    public function isGreaterThan(Money $other): bool
    {
        $this->assertSameCurrency($other);

        return $this->cents > $other->cents;
    }

    public function isZero(): bool
    {
        return $this->cents === 0;
    }

    public function __toString(): string
    {
        return "{$this->currency} {$this->decimal()}";
    }

    private function assertSameCurrency(Money $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                "Currency mismatch: {$this->currency} vs {$other->currency}."
            );
        }
    }
}
