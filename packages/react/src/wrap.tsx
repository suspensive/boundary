import type { OmitKeyof } from '@suspensive/utils'
import type { ComponentProps, ComponentType } from 'react'
import { Delay } from './Delay'
import { ErrorBoundary } from './ErrorBoundary'
import { ErrorBoundaryGroup } from './ErrorBoundaryGroup'
import { Suspense } from './Suspense'

type WrapperItem<
  TWrapperComponent extends typeof Suspense | typeof ErrorBoundary | typeof ErrorBoundaryGroup | typeof Delay,
> = [TWrapperComponent, OmitKeyof<ComponentProps<TWrapperComponent>, 'children'>]

class Wrap {
  constructor(
    private wrappers: (
      | WrapperItem<typeof Suspense>
      | WrapperItem<typeof ErrorBoundary>
      | WrapperItem<typeof ErrorBoundaryGroup>
      | WrapperItem<typeof Delay>
    )[]
  ) {}

  Suspense = (props: OmitKeyof<ComponentProps<typeof Suspense>, 'children'> = {}) => {
    this.wrappers.unshift([Suspense, props])
    return this
  }
  ErrorBoundary = (props: OmitKeyof<ComponentProps<typeof ErrorBoundary>, 'children'>) => {
    this.wrappers.unshift([ErrorBoundary, props])
    return this
  }
  ErrorBoundaryGroup = (props: OmitKeyof<ComponentProps<typeof ErrorBoundaryGroup>, 'children'> = {}) => {
    this.wrappers.unshift([ErrorBoundaryGroup, props])
    return this
  }
  Delay = (props: OmitKeyof<ComponentProps<typeof Delay>, 'children'> = {}) => {
    this.wrappers.unshift([Delay, props])
    return this
  }

  on = <TProps extends ComponentProps<ComponentType>>(Component: ComponentType<TProps>) => {
    const WrappedComponent = (props: TProps) =>
      this.wrappers.reduce(
        (acc, [WrapperComponent, wrapperProps]) => (
          <WrapperComponent {...(wrapperProps as any)}>{acc}</WrapperComponent>
        ),
        <Component {...props} />
      )

    if (process.env.NODE_ENV === 'development') {
      WrappedComponent.displayName = `wrap.${[...this.wrappers]
        .reverse()
        .map(([WrapperComponent]) => WrapperComponent.displayName)
        .join('.')}.on(${Component.displayName || Component.name || 'Component'})`
    }

    return WrappedComponent
  }
}

export const wrap = {
  Suspense: (props: OmitKeyof<ComponentProps<typeof Suspense>, 'children'> = {}) => new Wrap([[Suspense, props]]),
  ErrorBoundary: (props: OmitKeyof<ComponentProps<typeof ErrorBoundary>, 'children'>) =>
    new Wrap([[ErrorBoundary, props]]),
  ErrorBoundaryGroup: (props: OmitKeyof<ComponentProps<typeof ErrorBoundaryGroup>, 'children'>) =>
    new Wrap([[ErrorBoundaryGroup, props]]),
  Delay: (props: OmitKeyof<ComponentProps<typeof Delay>, 'children'> = {}) => new Wrap([[Delay, props]]),
}
