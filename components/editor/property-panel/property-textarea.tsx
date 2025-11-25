'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface PropertyTextareaProps
  extends Omit<React.ComponentProps<typeof Textarea>, 'onChange' | 'value'> {
  value: string | undefined
  onValueChange: (value: string) => void
}

export function PropertyTextarea({
  value,
  onValueChange,
  className,
  ...props
}: PropertyTextareaProps) {
  const [localValue, setLocalValue] = useState<string>('')

  // Sync local state when external value changes
  useEffect(() => {
    setLocalValue(value ?? '')
  }, [value])

  const handleBlur = () => {
    if (localValue !== (value ?? '')) {
      onValueChange(localValue)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.currentTarget.blur() // Trigger blur to save on Cmd+Enter
    }
  }

  return (
    <Textarea
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn('text-xs', className)}
      {...props}
    />
  )
}
