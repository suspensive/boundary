import type { ComponentProps, ComponentRef, ComponentType, SuspenseProps } from 'react'
import { forwardRef } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import type { ErrorBoundaryProps } from './ErrorBoundary'
import { Suspense } from './Suspense'
import type { PropsWithoutChildren } from './types'
import { wrap } from './wrap'

export type AsyncBoundaryProps = Omit<SuspenseProps, 'fallback'> &
  Omit<ErrorBoundaryProps, 'fallback'> & {
    pendingFallback?: SuspenseProps['fallback']
    rejectedFallback: ErrorBoundaryProps['fallback']
  }

const BaseAsyncBoundary = forwardRef<ComponentRef<typeof ErrorBoundary>, AsyncBoundaryProps>(
  ({ pendingFallback, rejectedFallback, children, ...errorBoundaryProps }, resetRef) => (
    <ErrorBoundary {...errorBoundaryProps} ref={resetRef} fallback={rejectedFallback}>
      <Suspense fallback={pendingFallback}>{children}</Suspense>
    </ErrorBoundary>
  )
)
if (process.env.NODE_ENV !== 'production') {
  BaseAsyncBoundary.displayName = 'AsyncBoundary'
}
const CSROnly = forwardRef<ComponentRef<typeof ErrorBoundary>, AsyncBoundaryProps>(
  ({ pendingFallback, rejectedFallback, children, ...errorBoundaryProps }, resetRef) => (
    <ErrorBoundary {...errorBoundaryProps} ref={resetRef} fallback={rejectedFallback}>
      <Suspense.CSROnly fallback={pendingFallback}>{children}</Suspense.CSROnly>
    </ErrorBoundary>
  )
)
if (process.env.NODE_ENV !== 'production') {
  CSROnly.displayName = 'AsyncBoundary.CSROnly'
}

/**
 * This component is just wrapping Suspense and ErrorBoundary in this library. to use Suspense with ErrorBoundary at once easily.
 * @see {@link https://suspensive.org/docs/react/AsyncBoundary}
 */
export const AsyncBoundary = Object.assign(BaseAsyncBoundary, {
  /**
   * CSROnly make AsyncBoundary can be used in SSR framework like Next.js with React 17 or under
   * @see {@link https://suspensive.org/docs/react/AsyncBoundary}
   */
  CSROnly,
})

export const withAsyncBoundary = Object.assign(
  <TProps extends ComponentProps<ComponentType> = Record<string, never>>(
    component: ComponentType<TProps>,
    asyncBoundaryProps: PropsWithoutChildren<AsyncBoundaryProps>
  ) => wrap.AsyncBoundary(asyncBoundaryProps).on(component),
  {
    CSROnly: <TProps extends ComponentProps<ComponentType> = Record<string, never>>(
      component: ComponentType<TProps>,
      asyncBoundaryProps: PropsWithoutChildren<AsyncBoundaryProps>
    ) => wrap.AsyncBoundary.CSROnly(asyncBoundaryProps).on(component),
  }
)
