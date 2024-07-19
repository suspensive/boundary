import type { ConstructorType, Nullable } from '@suspensive/utils'
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
import { syncDevMode } from './contexts'
import { Delay } from './Delay'
import { ErrorBoundaryGroupContext } from './ErrorBoundaryGroup'
import {
  Message_useErrorBoundaryFallbackProps_this_hook_should_be_called_in_ErrorBoundary_props_fallback,
  Message_useErrorBoundary_this_hook_should_be_called_in_ErrorBoundary_props_children,
  SuspensiveError,
} from './models/SuspensiveError'
import type { PropsWithDevMode } from './utility-types'
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
  ErrorBoundaryDevModeProp
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
    const { shouldCatch = true } = this.props
    const isCatch = Array.isArray(shouldCatch)
      ? shouldCatch.some((shouldCatch) => checkErrorBoundary(shouldCatch, error))
      : checkErrorBoundary(shouldCatch, error)
    if (!isCatch) {
      throw error
    }
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.props.onReset?.()
    this.setState(initialErrorBoundaryState)
  }

  render() {
    const { children, fallback } = this.props
    const { isError, error } = this.state

    let childrenOrFallback = children

    if (isError) {
      if (typeof fallback === 'undefined') {
        if (process.env.NODE_ENV === 'development') {
          console.error('ErrorBoundary of @suspensive/react requires a defined fallback')
        }
        throw error
      }

      if (typeof fallback === 'function') {
        const FallbackComponent = fallback
        childrenOrFallback = <FallbackComponent error={error} reset={this.reset} />
      } else {
        childrenOrFallback = fallback
      }
    }

    return (
      <ErrorBoundaryContext.Provider value={{ ...this.state, reset: this.reset }}>
        {childrenOrFallback}
      </ErrorBoundaryContext.Provider>
    )
  }
}

/**
 * This component provide a simple and reusable wrapper that you can use to wrap around your components. Any rendering errors in your components hierarchy can then be gracefully handled.
 * @see {@link https://suspensive.org/docs/react/ErrorBoundary}
 */
export const ErrorBoundary = Object.assign(
  (() => {
    const ErrorBoundary = forwardRef<{ reset(): void }, ErrorBoundaryProps>(
      ({ devMode, fallback, children, onError, onReset, resetKeys, ...props }, ref) => {
        const group = useContext(ErrorBoundaryGroupContext) ?? { resetKey: 0 }
        const baseErrorBoundaryRef = useRef<BaseErrorBoundary>(null)
        useImperativeHandle(ref, () => ({
          reset: () => baseErrorBoundaryRef.current?.reset(),
        }))

        return (
          <BaseErrorBoundary
            {...props}
            fallback={fallback}
            onError={onError}
            onReset={onReset}
            resetKeys={[group.resetKey, ...(resetKeys || [])]}
            ref={baseErrorBoundaryRef}
          >
            {children}
            <ErrorBoundaryDevMode {...devMode} />
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

const ErrorBoundaryContext = createContext<Nullable<{ reset: () => void } & ErrorBoundaryState>>(null)
if (process.env.NODE_ENV === 'development') {
  ErrorBoundaryContext.displayName = 'ErrorBoundaryContext'
}

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

type ErrorBoundaryDevModeProp = {
  showFallback?: boolean | { errorMessage?: string; after?: number }
}
const ErrorBoundaryDevMode = syncDevMode<ErrorBoundaryDevModeProp>(({ devMode, showFallback = false }) => {
  if (devMode.is && showFallback) {
    if (showFallback === true) {
      showFallback = devModeDefaultErrorBoundaryShowFallback
    }
    return (
      <Delay ms={showFallback.after ?? devModeDefaultErrorBoundaryShowFallback.after}>
        <SetError errorMessage={showFallback.errorMessage ?? devModeDefaultErrorBoundaryShowFallback.errorMessage} />
      </Delay>
    )
  }
  return null
})
const devModeDefaultErrorBoundaryShowFallback = {
  errorMessage: `<DevMode.ErrorBoundary> set Error ErrorBoundary`,
  after: 0,
} as const

const SetError = ({ errorMessage }: { errorMessage: string }) => {
  useErrorBoundary().setError(new Error(errorMessage))
  return null
}
