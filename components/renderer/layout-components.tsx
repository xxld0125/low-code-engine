import { cn } from '@/lib/utils'
import { CSSProperties, ReactNode, forwardRef, HTMLAttributes } from 'react'

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

// Modal in editor is rendered as a visible container with special styling
// In runtime, it will be a real dialog
export const Modal = forwardRef<HTMLDivElement, BaseProps>(
  ({ style, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
          // In editor, we might want to control visibility, but for now let's assume
          // if it's rendered, it's visible.
          // However, blocking the whole canvas is annoying.
          // Maybe we render it as a relative container with a header in Editor?
          // For MVP editor: render as a box with "MODAL" label
          'relative w-full border-2 border-double border-purple-400 bg-purple-50/50 p-4',
          className
        )}
        style={{
          ...style,
        }}
        {...props}
      >
        <div className="absolute -top-3 left-2 bg-purple-400 px-2 text-xs font-bold text-white">
          MODAL
        </div>
        {children}
      </div>
    )
  }
)
Modal.displayName = 'Modal'
