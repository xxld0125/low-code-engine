'use client'

import { cn } from '@/lib/utils'
import { CSSProperties, ReactNode, forwardRef, HTMLAttributes, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface BaseProps extends HTMLAttributes<HTMLDivElement> {
  style?: CSSProperties
  className?: string
  children?: ReactNode
}

export const Container = forwardRef<HTMLDivElement, BaseProps>(
  ({ style, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('min-h-[50px] w-full', className)}
        style={{
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = 'Container'

// Modal interface extension
interface ModalProps extends BaseProps {
  isOverlay?: boolean // If true, renders as a full-screen overlay (Runtime mode)
}

// Modal Component
// In Editor: Renders as a visible container with a label
// In Runtime: Renders as a full-screen overlay with centered content
export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ style, className, children, isOverlay, ...props }, ref) => {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      setMounted(true)
    }, [])

    if (isOverlay) {
      // Runtime Layout: Full screen overlay + Centered Box
      if (!mounted) return null

      return createPortal(
        <div
          ref={ref}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm duration-200 animate-in fade-in"
          // The overlay itself doesn't take the style, the inner container does?
          // Actually, usually style is for the container. Let's apply style to the inner box.
          {...props}
        >
          <div
            className={cn(
              'relative w-full max-w-lg border-2 border-[#383838] bg-white p-8 shadow-[8px_8px_0_rgba(0,0,0,0.1)] duration-200 animate-in slide-in-from-bottom-2',
              className
            )}
            style={style}
          >
            {children}
          </div>
        </div>,
        document.body
      )
    }

    // Editor Layout: Visible box representation
    return (
      <div
        ref={ref}
        className={cn(
          'relative min-h-[100px] w-full border-2 border-dashed border-purple-400 bg-purple-50/50 p-4',
          className
        )}
        style={{
          ...style,
        }}
        {...props}
      >
        <div className="absolute -top-3 left-2 bg-purple-400 px-2 text-xs font-bold text-white">
          MODAL (PREVIEW)
        </div>
        {children}
      </div>
    )
  }
)
Modal.displayName = 'Modal'
