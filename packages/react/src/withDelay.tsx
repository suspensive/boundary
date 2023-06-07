import { ComponentType } from 'react'
import { Delay } from './Delay'
import { ComponentPropsWithoutChildren } from './types'

/**
 * @experimental This is experimental feature.
 */
export const withDelay = <Props extends Record<string, unknown> = Record<string, never>>(
  Component: ComponentType<Props>,
  delayProps?: ComponentPropsWithoutChildren<typeof Delay>
) => {
  const Wrapped = (props: Props) => (
    <Delay {...delayProps}>
      <Component {...props} />
    </Delay>
  )

  if (process.env.NODE_ENV !== 'production') {
    const name = Component.displayName || Component.name || 'Component'
    Wrapped.displayName = `withDelay(${name})`
  }

  return Wrapped
}
