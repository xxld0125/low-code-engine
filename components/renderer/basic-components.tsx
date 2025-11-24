import { forwardRef, CSSProperties, ElementType, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Button as UiButton, ButtonProps as UiButtonProps } from '@/components/ui/button'

interface BaseProps extends HTMLAttributes<HTMLElement> {
  style?: CSSProperties
  className?: string
}

export interface TextProps extends BaseProps {
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  content?: string
}

export const Text = forwardRef<HTMLElement, TextProps>(
  ({ tag = 'p', content, style, className, children, ...props }, ref) => {
    const Component = tag as ElementType
    // Admin Style Adaptation: Compact typography
    const defaultClass = {
      // H1: 24px, weight 600
      h1: 'text-2xl font-semibold tracking-tight text-[#383838]',
      // H2: 18px, weight 600
      h2: 'text-lg font-semibold tracking-tight text-[#383838]',
      // H3: 16px, weight 500
      h3: 'text-base font-medium tracking-tight text-[#383838]',
      // Body: 13px/14px
      p: 'text-[13px] leading-normal text-[#383838] [&:not(:first-child)]:mt-2',
      span: 'text-[#383838]',
    }[tag]

    return (
      <Component ref={ref} className={cn(defaultClass, className)} style={style} {...props}>
        {content || children || 'Text Block'}
      </Component>
    )
  }
)
Text.displayName = 'Text'

export interface ButtonComponentProps extends UiButtonProps {
  style?: CSSProperties
  label?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonComponentProps>(
  ({ label, style, className, children, ...props }, ref) => {
    return (
      <UiButton ref={ref} className={cn(className)} style={style} {...props}>
        {label || 'Button'}
        {children}
      </UiButton>
    )
  }
)
Button.displayName = 'Button'
