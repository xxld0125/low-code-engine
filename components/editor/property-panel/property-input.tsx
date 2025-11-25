'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PropertyInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string | number | undefined
  onValueChange: (value: string) => void
}

export function PropertyInput({ value, onValueChange, className, ...props }: PropertyInputProps) {
  const [localValue, setLocalValue] = useState<string | number>('')

  // Sync local state when external value changes
  useEffect(() => {
    setLocalValue(value ?? '')
  }, [value])

  const handleBlur = () => {
    if (localValue !== (value ?? '')) {
      onValueChange(localValue.toString())
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur() // Trigger blur to save
    }
  }

  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn('h-8 text-xs', className)}
      {...props}
    />
  )
}
