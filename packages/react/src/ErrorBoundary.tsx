import {
  Component,
  type ErrorInfo,
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { PropsWithDevMode } from './DevMode'
import { ErrorBoundaryGroupContext } from './ErrorBoundaryGroup'
import {
  Message_useErrorBoundaryFallbackProps_this_hook_should_be_called_in_ErrorBoundary_props_fallback,
  Message_useErrorBoundary_this_hook_should_be_called_in_ErrorBoundary_props_children,
  SuspensiveError,
} from './models/SuspensiveError'
import type { ConstructorType } from './utility-types'
import { hasResetKeysChanged } from './utils'

export interface ErrorBoundaryFallbackProps<TError extends Error = Error> {
  /**
   * when ErrorBoundary catch error, you can use this error
   */
  error: TError
  /**
   * when you want to reset caught error, you can use this reset
   */
  reset: () => void
}

type ShouldCatchCallback = (error: Error) => boolean
type ShouldCatch = ConstructorType<Error> | ShouldCatchCallback | boolean
const checkErrorBoundary = (shouldCatch: ShouldCatch, error: Error) => {
  if (typeof shouldCatch === 'boolean') {
    return shouldCatch
  }
  if (shouldCatch.prototype instanceof Error) {
    return error instanceof shouldCatch
  }
  return (shouldCatch as ShouldCatchCallback)(error)
}

export type ErrorBoundaryProps = PropsWithDevMode<
  PropsWithChildren<{
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
    fallback: ReactNode | FunctionComponent<ErrorBoundaryFallbackProps>
    /**
     * determines whether the ErrorBoundary should catch errors based on conditions
     * @default true
     */
    shouldCatch?: ShouldCatch | [ShouldCatch, ...ShouldCatch[]]
  }>,
  {
    /**
     * @deprecated Use official react devtools instead
     * @see https://react.dev/learn/react-developer-tools
     */
    showFallback?:
      | boolean
      | {
          /**
           * @deprecated Use official react devtools instead
           * @see https://react.dev/learn/react-developer-tools
           */
          errorMessage?: string
          /**
           * @deprecated Use official react devtools instead
           * @see https://react.dev/learn/react-developer-tools
           */
          after?: number
        }
  }
>

type ErrorBoundaryState<TError extends Error = Error> =
  | { isError: true; error: TError }
  | { isError: false; error: null }

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
    if (error instanceof SuspensiveError) {
      throw error
    }
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.props.onReset?.()
    this.setState(initialErrorBoundaryState)
  }

  render() {
    const { children, fallback, shouldCatch = true } = this.props
    const { isError, error } = this.state

    let childrenOrFallback = children

    if (isError) {
      if (error instanceof ErrorInFallback) {
        throw error.originalError
      }
      const isCatch = Array.isArray(shouldCatch)
        ? shouldCatch.some((shouldCatch) => checkErrorBoundary(shouldCatch, error))
        : checkErrorBoundary(shouldCatch, error)
      if (!isCatch) {
        throw error
      }

      if (typeof fallback === 'undefined') {
        if (process.env.NODE_ENV === 'development') {
          console.error('ErrorBoundary of @suspensive/react requires a defined fallback')
        }
        throw error
      }

      const Fallback = fallback
      childrenOrFallback = (
        <FallbackBoundary>
          {typeof Fallback === 'function' ? <Fallback error={error} reset={this.reset} /> : Fallback}
        </FallbackBoundary>
      )
    }

    return (
      <ErrorBoundaryContext.Provider value={{ ...this.state, reset: this.reset }}>
        {childrenOrFallback}
      </ErrorBoundaryContext.Provider>
    )
  }
}

class ErrorInFallback extends Error {
  originalError: Error
  constructor(originalError: Error) {
    super()
    this.originalError = originalError
  }
}
class FallbackBoundary extends Component<{ children: ReactNode }> {
  componentDidCatch(originalError: Error) {
    throw originalError instanceof SuspensiveError ? originalError : new ErrorInFallback(originalError)
  }
  render() {
    return this.props.children
  }
}

/**
 * This component provides a simple and reusable wrapper that you can use to wrap around your components. Any rendering errors in your components hierarchy can then be gracefully handled.
 * @see {@link https://suspensive.org/docs/react/ErrorBoundary Suspensive Docs}
 */
export const ErrorBoundary = Object.assign(
  (() => {
    const ErrorBoundary = forwardRef<{ reset(): void }, ErrorBoundaryProps>(
      // TODO: remove this line
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ({ fallback, children, onError, onReset, resetKeys, shouldCatch }, ref) => {
        const group = useContext(ErrorBoundaryGroupContext) ?? { resetKey: 0 }
        const baseErrorBoundaryRef = useRef<BaseErrorBoundary>(null)
        useImperativeHandle(ref, () => ({
          reset: () => baseErrorBoundaryRef.current?.reset(),
        }))

        return (
          <BaseErrorBoundary
            shouldCatch={shouldCatch}
            fallback={fallback}
            onError={onError}
            onReset={onReset}
            resetKeys={[group.resetKey, ...(resetKeys || [])]}
            ref={baseErrorBoundaryRef}
          >
            {children}
          </BaseErrorBoundary>
        )
      }
    )

    if (process.env.NODE_ENV === 'development') {
      ErrorBoundary.displayName = 'ErrorBoundary'
    }

    return ErrorBoundary
  })(),
  {
    Consumer: ({ children }: { children: (errorBoundary: ReturnType<typeof useErrorBoundary>) => ReactNode }) => (
      <>{children(useErrorBoundary())}</>
    ),
  }
)

const ErrorBoundaryContext = createContext<({ reset: () => void } & ErrorBoundaryState) | null>(null)
if (process.env.NODE_ENV === 'development') {
  ErrorBoundaryContext.displayName = 'ErrorBoundaryContext'
}

/**
 * This hook provides a simple and reusable wrapper that you can use to wrap around your components. Any rendering errors in your components hierarchy can then be gracefully handled.
 * @see {@link https://suspensive.org/docs/react/ErrorBoundary#useerrorboundary Suspensive Docs}
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export const useErrorBoundary = <TError extends Error = Error>() => {
  const [state, setState] = useState<ErrorBoundaryState<TError>>({
    isError: false,
    error: null,
  })
  if (state.isError) {
    throw state.error
  }

  const errorBoundary = useContext(ErrorBoundaryContext)
  SuspensiveError.assert(
    errorBoundary != null && !errorBoundary.isError,
    Message_useErrorBoundary_this_hook_should_be_called_in_ErrorBoundary_props_children
  )

  return useMemo(
    () => ({
      setError: (error: TError) => setState({ isError: true, error }),
    }),
    []
  )
}

/**
 * This hook allows you to access the reset method and error objects without prop drilling.
 * @see {@link https://suspensive.org/docs/react/ErrorBoundary#useerrorboundaryfallbackprops Suspensive Docs}
 */
export const useErrorBoundaryFallbackProps = <TError extends Error = Error>(): ErrorBoundaryFallbackProps<TError> => {
  const errorBoundary = useContext(ErrorBoundaryContext)
  SuspensiveError.assert(
    errorBoundary != null && errorBoundary.isError,
    Message_useErrorBoundaryFallbackProps_this_hook_should_be_called_in_ErrorBoundary_props_fallback
  )

  return useMemo(
    () => ({
      error: errorBoundary.error as TError,
      reset: errorBoundary.reset,
    }),
    [errorBoundary.error, errorBoundary.reset]
  )
}
