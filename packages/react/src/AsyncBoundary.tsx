import { type ComponentRef, forwardRef } from 'react'
import { ErrorBoundary, type ErrorBoundaryProps } from './ErrorBoundary'
import { Suspense, type SuspenseProps } from './Suspense'
import type { PropsWithoutDevMode } from './utility-types'

/**
 * @deprecated Use SuspenseProps and ErrorBoundaryProps instead
 */
export interface AsyncBoundaryProps
  extends Omit<PropsWithoutDevMode<SuspenseProps>, 'fallback'>,
    Omit<PropsWithoutDevMode<ErrorBoundaryProps>, 'fallback'> {
  pendingFallback?: SuspenseProps['fallback']
  rejectedFallback: ErrorBoundaryProps['fallback']
}

/**
 * @deprecated Use `<Suspense/>` and `<ErrorBoundary/>` instead
 */
export const AsyncBoundary = Object.assign(
  (() => {
    const BaseAsyncBoundary = forwardRef<ComponentRef<typeof ErrorBoundary>, AsyncBoundaryProps>(
      ({ clientOnly, pendingFallback, rejectedFallback, children, ...errorBoundaryProps }, resetRef) => (
        <ErrorBoundary {...errorBoundaryProps} ref={resetRef} fallback={rejectedFallback}>
          <Suspense clientOnly={clientOnly} fallback={pendingFallback}>
            {children}
          </Suspense>
        </ErrorBoundary>
      )
    )
    if (process.env.NODE_ENV !== 'production') {
      BaseAsyncBoundary.displayName = 'AsyncBoundary'
    }

    return BaseAsyncBoundary
  })(),
  {
    /**
     * @deprecated Use `<Suspense clientOnly />` and `<ErrorBoundary/>` instead
     */
    CSROnly: (() => {
      const CSROnly = forwardRef<
        ComponentRef<typeof ErrorBoundary>,
        Omit<AsyncBoundaryProps, keyof Pick<SuspenseProps, 'clientOnly'>>
      >(({ pendingFallback, rejectedFallback, children, ...errorBoundaryProps }, resetRef) => (
        <ErrorBoundary {...errorBoundaryProps} ref={resetRef} fallback={rejectedFallback}>
          <Suspense clientOnly fallback={pendingFallback}>
            {children}
          </Suspense>
        </ErrorBoundary>
      ))
      if (process.env.NODE_ENV !== 'production') {
        CSROnly.displayName = 'AsyncBoundary.CSROnly'
      }

      return CSROnly
    })(),
  }
)
