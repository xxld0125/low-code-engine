import { get } from 'lodash'

/**
 * Resolves expressions in the format {{ path.to.value }} using the provided context.
 * If the expression is the entire string, it returns the value with its original type.
 * Otherwise, it performs string interpolation.
 */
export function resolveExpression(value: unknown, context: Record<string, unknown>): unknown {
  if (typeof value !== 'string') return value

  const regex = /\{\{\s*([^}]+)\s*\}\}/g

  // Check if the whole string is just one expression like "{{ user.name }}"
  const trimmed = value.trim()
  // Simple check: starts with {{, ends with }}, and the regex matches the whole string equivalent
  if (trimmed.startsWith('{{') && trimmed.endsWith('}}')) {
    const matches = [...trimmed.matchAll(regex)]
    if (matches.length === 1 && matches[0][0] === trimmed) {
      const path = matches[0][1].trim()
      return get(context, path)
    }
  }

  // Otherwise, replace all occurrences in the string (returns string)
  // Only do this if there is a match
  if (!regex.test(value)) return value

  // Reset regex lastIndex because we just tested it (though test doesn't advance global regex if not stuck, better safe or create new regex)
  const replaceRegex = /\{\{\s*([^}]+)\s*\}\}/g
  return value.replace(replaceRegex, (match, path) => {
    const resolved = get(context, path.trim())
    return resolved !== undefined && resolved !== null ? String(resolved) : ''
  })
}

/**
 * Deeply resolves expressions in an object or array.
 */
export function resolveProps(
  props: Record<string, unknown>,
  context: Record<string, unknown>
): Record<string, unknown> {
  if (!props) return {}

  const resolvedProps: Record<string, unknown> = {}

  for (const key in props) {
    const value = props[key]
    if (typeof value === 'string') {
      resolvedProps[key] = resolveExpression(value, context)
    } else if (Array.isArray(value)) {
      resolvedProps[key] = value.map((item) => {
        if (typeof item === 'string') return resolveExpression(item, context)
        if (typeof item === 'object' && item !== null)
          return resolveProps(item as Record<string, unknown>, context)
        return item
      })
    } else if (typeof value === 'object' && value !== null) {
      resolvedProps[key] = resolveProps(value as Record<string, unknown>, context)
    } else {
      resolvedProps[key] = value
    }
  }

  return resolvedProps
}
