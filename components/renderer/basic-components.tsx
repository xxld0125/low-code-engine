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

    // Separate text styles (color, font properties) from container styles (background, padding, margin)
    const textStyle: CSSProperties = {}
    const containerStyle: CSSProperties = {}

    if (style) {
      const { color, fontSize, fontWeight, fontStyle, textAlign, ...rest } = style
      if (color) textStyle.color = color
      if (fontSize) textStyle.fontSize = fontSize
      if (fontWeight) textStyle.fontWeight = fontWeight
      if (fontStyle) textStyle.fontStyle = fontStyle
      if (textAlign) textStyle.textAlign = textAlign
      Object.assign(containerStyle, rest)
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className="relative"
        style={containerStyle}
        {...props}
      >
        {children}
        <Component className={cn(defaultClass, className)} style={textStyle}>
          {content || 'Text Block'}
        </Component>
      </div>
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
      <div ref={ref as React.Ref<HTMLDivElement>} className="relative inline-block" style={style}>
        {children}
        <UiButton className={cn(className)} {...props}>
          {label || 'Button'}
        </UiButton>
      </div>
    )
  }
)
Button.displayName = 'Button'
