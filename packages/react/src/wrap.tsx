import type { ComponentProps, ComponentType } from 'react'
import type { DelayProps } from './Delay'
import { Delay } from './Delay'
import type { ErrorBoundaryProps } from './ErrorBoundary'
import { ErrorBoundary } from './ErrorBoundary'
import type { ErrorBoundaryGroupProps } from './ErrorBoundaryGroup'
import { ErrorBoundaryGroup } from './ErrorBoundaryGroup'
import { Suspense } from './Suspense'
import type { SuspenseProps } from './Suspense'
import type { PropsWithoutChildren } from './utility-types'

type WrapperItem<
  TWrapperComponent extends
    | typeof Suspense
    | typeof Suspense.CSROnly
    | typeof ErrorBoundary
    | typeof ErrorBoundaryGroup
    | typeof Delay,
> = [TWrapperComponent, PropsWithoutChildren<ComponentProps<TWrapperComponent>>]

type Wrapper =
  | WrapperItem<typeof Suspense>
  | WrapperItem<typeof Suspense.CSROnly>
  | WrapperItem<typeof ErrorBoundary>
  | WrapperItem<typeof ErrorBoundaryGroup>
  | WrapperItem<typeof Delay>

class WrapWithoutCSROnly {
  constructor(private wrappers: Wrapper[]) {}
  Suspense = (props: PropsWithoutChildren<ComponentProps<typeof Suspense>> = {}) => {
    this.wrappers.unshift([Suspense, props])
    return this
  }
  ErrorBoundary = (props: PropsWithoutChildren<ComponentProps<typeof ErrorBoundary>>) => {
    this.wrappers.unshift([ErrorBoundary, props])
    return this
  }
  ErrorBoundaryGroup = (props: PropsWithoutChildren<ComponentProps<typeof ErrorBoundaryGroup>> = {}) => {
    this.wrappers.unshift([ErrorBoundaryGroup, props])
    return this
  }
  Delay = (props: PropsWithoutChildren<ComponentProps<typeof Delay>> = {}) => {
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

    if (process.env.NODE_ENV !== 'production') {
      WrappedComponent.displayName = this.wrappers.reduce(
        (acc, [WrapperComponent]) => `with${WrapperComponent.displayName}(${acc})`,
        Component.displayName || Component.name || 'Component'
      )
    }

    return WrappedComponent
  }
}

type Wrap = WrapWithoutCSROnly & {
  Suspense: WrapWithoutCSROnly['Suspense'] & {
    CSROnly: (props?: PropsWithoutChildren<ComponentProps<typeof Suspense.CSROnly>>) => Wrap
  }
}

const createWrap = () => {
  const wrappers: Wrapper[] = []
  const wrap = new WrapWithoutCSROnly(wrappers) as Wrap
  wrap.Suspense.CSROnly = (props: PropsWithoutChildren<ComponentProps<typeof Suspense.CSROnly>> = {}) => {
    wrappers.unshift([Suspense.CSROnly, props])
    return wrap
  }
  return wrap
}

const wrapSuspense = (props: PropsWithoutChildren<ComponentProps<typeof Suspense>> = {}) => createWrap().Suspense(props)
wrapSuspense.CSROnly = (props: PropsWithoutChildren<ComponentProps<typeof Suspense.CSROnly>> = {}) =>
  createWrap().Suspense.CSROnly(props)
const wrapErrorBoundary = (props: PropsWithoutChildren<ComponentProps<typeof ErrorBoundary>>) =>
  createWrap().ErrorBoundary(props)
const wrapErrorBoundaryGroup = (props: PropsWithoutChildren<ComponentProps<typeof ErrorBoundaryGroup>>) =>
  createWrap().ErrorBoundaryGroup(props)
const wrapDelay = (props: PropsWithoutChildren<ComponentProps<typeof Delay>> = {}) => createWrap().Delay(props)

export const wrap = {
  Suspense: wrapSuspense,
  ErrorBoundary: wrapErrorBoundary,
  ErrorBoundaryGroup: wrapErrorBoundaryGroup,
  Delay: wrapDelay,
}

/**
 * @deprecated Use wrap.Suspense().on as alternatives
 */
export const withSuspense = Object.assign(
  <TProps extends ComponentProps<ComponentType> = Record<string, never>>(
    component: ComponentType<TProps>,
    suspenseProps: PropsWithoutChildren<SuspenseProps> = {}
  ) => wrap.Suspense(suspenseProps).on(component),
  {
    /**
     * @deprecated Use wrap.Suspense.CSROnly().on as alternatives
     */
    CSROnly: <TProps extends ComponentProps<ComponentType> = Record<string, never>>(
      component: ComponentType<TProps>,
      suspenseProps: PropsWithoutChildren<SuspenseProps> = {}
    ) => wrap.Suspense.CSROnly(suspenseProps).on(component),
  }
)

/**
 * @deprecated Use wrap.ErrorBoundary().on as alternatives
 */
export const withErrorBoundary = <TProps extends ComponentProps<ComponentType> = Record<string, never>>(
  component: ComponentType<TProps>,
  errorBoundaryProps: PropsWithoutChildren<ErrorBoundaryProps>
) => wrap.ErrorBoundary(errorBoundaryProps).on(component)

/**
 * @deprecated Use wrap.Delay().on as alternatives
 */
export const withDelay = <TProps extends ComponentProps<ComponentType> = Record<string, never>>(
  component: ComponentType<TProps>,
  delayProps: PropsWithoutChildren<DelayProps> = {}
) => wrap.Delay(delayProps).on(component)

/**
 * @deprecated Use wrap.ErrorBoundaryGroup().on as alternatives
 */
export const withErrorBoundaryGroup = <TProps extends ComponentProps<ComponentType> = Record<string, never>>(
  component: ComponentType<TProps>,
  errorBoundaryGroupProps: PropsWithoutChildren<ErrorBoundaryGroupProps> = {}
) => wrap.ErrorBoundaryGroup(errorBoundaryGroupProps).on(component)
