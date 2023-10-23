import type { ComponentProps, ComponentType, ErrorInfo, FunctionComponent, PropsWithChildren, ReactNode } from 'react'
import {
  Component,
  createContext,
  createElement,
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ErrorBoundaryGroupContext } from './ErrorBoundaryGroup'
import type { PropsWithoutChildren } from './types'
import { assert, hasResetKeysChanged } from './utils'

export type ErrorBoundaryFallbackProps<TError extends Error = Error> = {
  /**
   * when ErrorBoundary catch error, you can use this error
   */
  error: TError
  /**
   * when you want to reset caught error, you can use this reset
   */
  reset: () => void
}

export type ErrorBoundaryProps = PropsWithChildren<{
  /**
   * an array of elements for the ErrorBoundary to check each render. If any of those elements change between renders, then the ErrorBoundary will reset the state which will re-render the children
   */
  resetKeys?: unknown[]
  /**
   * when ErrorBoundary is reset by resetKeys or fallback's props.reset, onReset will be triggered
   */
  onReset?(): void
  /**
   * when ErrorBoundary catch error, onError will be triggered
   */
  onError?(error: Error, info: ErrorInfo): void
  /**
   * when ErrorBoundary catch error, fallback will be render instead of children
   */
  fallback: NonNullable<ReactNode> | FunctionComponent<ErrorBoundaryFallbackProps>
}>

type ErrorBoundaryState<TError extends Error = Error> =
  | {
      isError: true
      error: TError
    }
  | {
      isError: false
      error: null
    }

const initialErrorBoundaryState: ErrorBoundaryState = {
  isError: false,
  error: null,
}
class BaseErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { isError: true, error }
  }

  state = initialErrorBoundaryState

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    const { isError } = this.state
    const { resetKeys } = this.props
    if (isError && prevState.isError && hasResetKeysChanged(prevProps.resetKeys, resetKeys)) {
      this.reset()
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.props.onReset?.()
    this.setState(initialErrorBoundaryState)
  }

  render() {
    const { children, fallback } = this.props

    return (
      <ErrorBoundaryContext.Provider
        value={{
          ...this.state,
          reset: this.reset,
        }}
      >
        {this.state.isError
          ? typeof fallback === 'function'
            ? createElement(fallback, {
                error: this.state.error,
                reset: this.reset,
              })
            : fallback
          : children}
      </ErrorBoundaryContext.Provider>
    )
  }
}

/**
 * This component provide a simple and reusable wrapper that you can use to wrap around your components. Any rendering errors in your components hierarchy can then be gracefully handled.
 * @see {@link https://suspensive.org/docs/react/ErrorBoundary}
 */
export const ErrorBoundary = forwardRef<{ reset(): void }, ErrorBoundaryProps>((props, ref) => {
  const group = useContext(ErrorBoundaryGroupContext) ?? { resetKey: 0 }
  const resetKeys = [group.resetKey, ...(props.resetKeys || [])]

  const baseErrorBoundaryRef = useRef<BaseErrorBoundary>(null)
  useImperativeHandle(ref, () => ({
    reset: () => baseErrorBoundaryRef.current?.reset(),
  }))

  return <BaseErrorBoundary {...props} resetKeys={resetKeys} ref={baseErrorBoundaryRef} />
})
if (process.env.NODE_ENV !== 'production') {
  ErrorBoundary.displayName = 'ErrorBoundary'
}

export const withErrorBoundary = <TProps extends ComponentProps<ComponentType> = Record<string, never>>(
  Component: ComponentType<TProps>,
  errorBoundaryProps: PropsWithoutChildren<ErrorBoundaryProps>
) => {
  const Wrapped = (props: TProps) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  if (process.env.NODE_ENV !== 'production') {
    const name = Component.displayName || Component.name || 'Component'
    Wrapped.displayName = `withErrorBoundary(${name})`
  }

  return Wrapped
}

const ErrorBoundaryContext = createContext<({ reset: () => void } & ErrorBoundaryState) | null>(null)

export const useErrorBoundary = <TError extends Error = Error>() => {
  const [state, setState] = useState<ErrorBoundaryState<TError>>({
    isError: false,
    error: null,
  })
  if (state.isError) {
    throw state.error
  }

  const errorBoundary = useContext(ErrorBoundaryContext)
  assert(errorBoundary != null && !errorBoundary.isError, assert.message.useErrorBoundary.onlyInChildrenOfErrorBoundary)

  return useMemo(
    () => ({
      setError: (error: TError) => setState({ isError: true, error }),
    }),
    []
  )
}

export const useErrorBoundaryFallbackProps = <TError extends Error = Error>(): ErrorBoundaryFallbackProps<TError> => {
  const errorBoundary = useContext(ErrorBoundaryContext)
  assert(
    errorBoundary != null && errorBoundary.isError,
    assert.message.useErrorBoundaryFallbackProps.onlyInFallbackOfErrorBoundary
  )

  return useMemo(
    () => ({
      error: errorBoundary.error as TError,
      reset: errorBoundary.reset,
    }),
    [errorBoundary.error, errorBoundary.reset]
  )
}
