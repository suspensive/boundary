import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ms from 'ms'
import { type ComponentRef, createElement, createRef } from 'react'
import {
  ErrorBoundary,
  type ErrorBoundaryFallbackProps,
  useErrorBoundary,
  useErrorBoundaryFallbackProps,
} from './ErrorBoundary'
import { useTimeout } from './hooks'
import { SuspensiveError } from './models/SuspensiveError'
import { CustomError, ERROR_MESSAGE, FALLBACK, TEXT, Throw } from './test-utils'

describe('<ErrorBoundary/>', () => {
  beforeEach(() => Throw.reset())

  it('should show children if no error but if error in children, catch it and show fallback and call onError', async () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError} fallback={<>{FALLBACK}</>}>
        <Throw.Error message={ERROR_MESSAGE} after={ms('0.1s')}>
          {TEXT}
        </Throw.Error>
      </ErrorBoundary>
    )
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(0)
    await waitFor(() => expect(screen.queryByText(FALLBACK)).toBeInTheDocument())
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('should show children if no error but if error in children, catch it and show fallback component', async () => {
    render(
      <ErrorBoundary fallback={(props) => <>{props.error.message}</>}>
        <Throw.Error message={ERROR_MESSAGE} after={ms('0.1s')}>
          {TEXT}
        </Throw.Error>
      </ErrorBoundary>
    )
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(ERROR_MESSAGE)).toBeInTheDocument())
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
  })

  it('requires fallback is set, if fallback is undefined, ErrorBoundary will rethrow error', () => {
    expect(() =>
      render(
        <ErrorBoundary fallback={undefined}>
          <Throw.Error message={ERROR_MESSAGE} after={0} />
        </ErrorBoundary>
      )
    ).toThrow(ERROR_MESSAGE)
  })

  it('should catch it even if thrown null', async () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError} fallback={<>{FALLBACK}</>}>
        <Throw.Null after={ms('0.1s')}>{TEXT}</Throw.Null>
      </ErrorBoundary>
    )
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(0)
    await waitFor(() => expect(screen.queryByText(FALLBACK)).toBeInTheDocument())
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('should be reset by items of resetKeys, and call onReset', async () => {
    const onReset = vi.fn()
    const { rerender } = render(
      <ErrorBoundary resetKeys={[0]} fallback={(props) => props.error.message} onReset={onReset}>
        <Throw.Error message={ERROR_MESSAGE} after={ms('0.1s')}>
          {TEXT}
        </Throw.Error>
      </ErrorBoundary>
    )
    expect(onReset).toHaveBeenCalledTimes(0)
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(ERROR_MESSAGE)).toBeInTheDocument())
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(0)
    rerender(
      <ErrorBoundary resetKeys={[1]} fallback={(props) => props.error.message} onReset={onReset}>
        <Throw.Error message={ERROR_MESSAGE} after={ms('0.1s')}>
          {TEXT}
        </Throw.Error>
      </ErrorBoundary>
    )
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should be reset by length of resetKeys, and call onReset', async () => {
    const onReset = vi.fn()
    const { rerender } = render(
      <ErrorBoundary resetKeys={[0]} fallback={(props) => props.error.message} onReset={onReset}>
        <Throw.Error message={ERROR_MESSAGE} after={ms('0.1s')}>
          {TEXT}
        </Throw.Error>
      </ErrorBoundary>
    )
    expect(onReset).toHaveBeenCalledTimes(0)
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(ERROR_MESSAGE)).toBeInTheDocument())
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(0)
    rerender(
      <ErrorBoundary resetKeys={[0, 1]} fallback={(props) => props.error.message} onReset={onReset}>
        <Throw.Error message={ERROR_MESSAGE} after={ms('0.1s')}>
          {TEXT}
        </Throw.Error>
      </ErrorBoundary>
    )
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should be reset by render prop reset(), and call onReset', async () => {
    const onReset = vi.fn()
    const fallbackFn = vi.fn<(props: ErrorBoundaryFallbackProps) => undefined>()
    render(
      <ErrorBoundary fallback={fallbackFn} onReset={onReset}>
        <Throw.Error message={ERROR_MESSAGE} after={ms('0.1s')}>
          {TEXT}
        </Throw.Error>
      </ErrorBoundary>
    )
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(TEXT)).not.toBeInTheDocument())
    expect(onReset).toHaveBeenCalledTimes(0)
    expect(fallbackFn).toHaveBeenCalled()
    act(() => fallbackFn.mock.calls[0][0].reset())
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should be reset by ref.reset(), and call onReset', async () => {
    const onReset = vi.fn()
    // eslint-disable-next-line @eslint-react/no-create-ref
    const ref = createRef<ComponentRef<typeof ErrorBoundary>>()
    render(
      <ErrorBoundary ref={ref} fallback={(props) => <>{props.error.message}</>} onReset={onReset}>
        <Throw.Error message={ERROR_MESSAGE} after={ms('0.1s')}>
          {TEXT}
        </Throw.Error>
      </ErrorBoundary>
    )

    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(TEXT)).not.toBeInTheDocument())
    expect(onReset).toHaveBeenCalledTimes(0)
    act(() => ref.current?.reset())
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should catch Error by many criteria', async () => {
    const onErrorParent = vi.fn()
    const onErrorChild = vi.fn()

    render(
      <ErrorBoundary fallback={({ error }) => <>{error.message} of Parent</>} onError={onErrorParent}>
        <ErrorBoundary
          shouldCatch={[false, CustomError, (error) => error instanceof CustomError]}
          fallback={({ error }) => <>{error.message} of Child</>}
          onError={onErrorChild}
        >
          {createElement(() => {
            throw new Error(ERROR_MESSAGE)
          })}
        </ErrorBoundary>
      </ErrorBoundary>
    )

    expect(onErrorChild).toBeCalledTimes(0)
    expect(onErrorParent).toBeCalledTimes(1)
    await waitFor(() => expect(screen.queryByText(`${ERROR_MESSAGE} of Parent`)).toBeInTheDocument())
  })

  it('should re-throw error if not shouldCatch error in children without rendering fallback', async () => {
    const onErrorParent = vi.fn()
    const onErrorChild = vi.fn()
    const Fallback = vi.fn()

    render(
      <ErrorBoundary fallback={({ error }) => <>{error.message} of Parent</>} onError={onErrorParent}>
        <ErrorBoundary shouldCatch={false} fallback={Fallback} onError={onErrorChild}>
          {createElement(() => {
            throw new Error(ERROR_MESSAGE)
          })}
        </ErrorBoundary>
      </ErrorBoundary>
    )

    expect(onErrorChild).toBeCalledTimes(0)
    expect(onErrorParent).toBeCalledTimes(1)
    await waitFor(() => expect(screen.queryByText(`${ERROR_MESSAGE} of Parent`)).toBeInTheDocument())
  })

  it.each([
    {
      childCalledTimes: 0,
      parentCalledTimes: 1,
      shouldCatch: CustomError,
      errorText: `${ERROR_MESSAGE} of Parent`,
    },
    {
      childCalledTimes: 1,
      parentCalledTimes: 0,
      shouldCatch: Error,
      errorText: `${ERROR_MESSAGE} of Child`,
    },
  ])(
    'should catch Error by one criteria(ErrorConstructor)',
    async ({ childCalledTimes, parentCalledTimes, shouldCatch, errorText }) => {
      const onErrorParent = vi.fn()
      const onErrorChild = vi.fn()

      render(
        <ErrorBoundary fallback={({ error }) => <>{error.message} of Parent</>} onError={onErrorParent}>
          <ErrorBoundary
            shouldCatch={shouldCatch}
            fallback={({ error }) => <>{error.message} of Child</>}
            onError={onErrorChild}
          >
            {createElement(() => {
              throw new Error(ERROR_MESSAGE)
            })}
          </ErrorBoundary>
        </ErrorBoundary>
      )

      expect(onErrorChild).toBeCalledTimes(childCalledTimes)
      expect(onErrorParent).toBeCalledTimes(parentCalledTimes)
      await waitFor(() => expect(screen.queryByText(errorText)).toBeInTheDocument())
    }
  )

  it.each([
    {
      childCalledTimes: 0,
      parentCalledTimes: 1,
      shouldCatch: (error: Error) => error instanceof CustomError,
      errorText: `${ERROR_MESSAGE} of Parent`,
    },
    {
      childCalledTimes: 1,
      parentCalledTimes: 0,
      shouldCatch: (error: Error) => error instanceof Error,
      errorText: `${ERROR_MESSAGE} of Child`,
    },
  ])(
    'should catch Error by one criteria(ShouldCatchCallback)',
    async ({ childCalledTimes, parentCalledTimes, shouldCatch, errorText }) => {
      const onErrorParent = vi.fn()
      const onErrorChild = vi.fn()

      render(
        <ErrorBoundary fallback={({ error }) => <>{error.message} of Parent</>} onError={onErrorParent}>
          <ErrorBoundary
            shouldCatch={shouldCatch}
            fallback={({ error }) => <>{error.message} of Child</>}
            onError={onErrorChild}
          >
            {createElement(() => {
              throw new Error(ERROR_MESSAGE)
            })}
          </ErrorBoundary>
        </ErrorBoundary>
      )

      expect(onErrorChild).toBeCalledTimes(childCalledTimes)
      expect(onErrorParent).toBeCalledTimes(parentCalledTimes)
      await waitFor(() => expect(screen.queryByText(errorText)).toBeInTheDocument())
    }
  )

  it.each([
    { childCalledTimes: 0, parentCalledTimes: 1, shouldCatch: false, errorText: `${ERROR_MESSAGE} of Parent` },
    { childCalledTimes: 1, parentCalledTimes: 0, shouldCatch: true, errorText: `${ERROR_MESSAGE} of Child` },
  ])(
    'should catch Error by one criteria(boolean)',
    async ({ childCalledTimes, parentCalledTimes, errorText, shouldCatch }) => {
      const onErrorParent = vi.fn()
      const onErrorChild = vi.fn()

      render(
        <ErrorBoundary fallback={({ error }) => <>{error.message} of Parent</>} onError={onErrorParent}>
          <ErrorBoundary
            shouldCatch={shouldCatch}
            fallback={({ error }) => <>{error.message} of Child</>}
            onError={onErrorChild}
          >
            {createElement(() => {
              throw new Error(ERROR_MESSAGE)
            })}
          </ErrorBoundary>
        </ErrorBoundary>
      )

      expect(onErrorChild).toBeCalledTimes(childCalledTimes)
      expect(onErrorParent).toBeCalledTimes(parentCalledTimes)
      await waitFor(() => expect(screen.queryByText(errorText)).toBeInTheDocument())
    }
  )
})

describe('<ErrorBoundary.Consumer/>', () => {
  it('should consume ErrorBoundaryContext like useErrorBoundary', async () => {
    const user = userEvent.setup()
    render(
      <ErrorBoundary fallback={({ error }) => <div>{error.message}</div>}>
        <ErrorBoundary.Consumer>
          {(errorBoundary) => (
            <button onClick={() => errorBoundary.setError(new Error(ERROR_MESSAGE))}>error maker</button>
          )}
        </ErrorBoundary.Consumer>
      </ErrorBoundary>
    )
    await user.click(screen.getByRole('button'))
    await waitFor(() => expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument())
  })
})

describe('useErrorBoundary', () => {
  beforeEach(() => Throw.reset())

  it('should supply setError to set Error of ErrorBoundary manually', async () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary
        onError={onError}
        fallback={function ErrorBoundaryFallback() {
          const props = useErrorBoundaryFallbackProps()
          useTimeout(props.reset, ms('0.1s'))
          return <>{props.error.message}</>
        }}
      >
        {createElement(() => {
          const errorBoundary = useErrorBoundary()
          useTimeout(() => errorBoundary.setError(new Error(ERROR_MESSAGE)), ms('0.1s'))
          return <>{TEXT}</>
        })}
      </ErrorBoundary>
    )

    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(0)

    await waitFor(() => expect(screen.queryByText(ERROR_MESSAGE)).toBeInTheDocument())
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('should guarantee hook calling position is in children of ErrorBoundary', () => {
    expect(
      render(
        <ErrorBoundary fallback={ERROR_MESSAGE}>
          {createElement(() => {
            useErrorBoundary()
            return <>{TEXT}</>
          })}
        </ErrorBoundary>
      ).getByText(TEXT)
    ).toBeInTheDocument()
    expect(() =>
      render(
        createElement(() => {
          useErrorBoundary()
          return <></>
        })
      )
    ).toThrow(SuspensiveError)
    expect(() =>
      render(
        <ErrorBoundary
          fallback={() => {
            useErrorBoundary()
            return <></>
          }}
        >
          <Throw.Error message={ERROR_MESSAGE} after={0} />
        </ErrorBoundary>
      )
    ).toThrow(SuspensiveError)
  })
})

describe('useErrorBoundaryFallbackProps', () => {
  beforeEach(() => Throw.reset())

  it('should supply reset function and error to reset in fallback of ErrorBoundary', async () => {
    const onReset = vi.fn()
    render(
      <ErrorBoundary
        onReset={onReset}
        fallback={function ErrorBoundaryFallback() {
          const props = useErrorBoundaryFallbackProps()
          useTimeout(props.reset, ms('0.1s'))

          return <>{props.error.message}</>
        }}
      >
        <Throw.Error message={ERROR_MESSAGE} after={ms('0.1s')}>
          {TEXT}
        </Throw.Error>
      </ErrorBoundary>
    )
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(0)

    await waitFor(() => expect(screen.queryByText(ERROR_MESSAGE)).toBeInTheDocument())
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(0)

    await waitFor(() => expect(screen.queryByText(TEXT)).toBeInTheDocument())
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should guarantee hook calling position is in fallback of ErrorBoundary', () => {
    const inFallback = vi.fn()
    expect(() =>
      render(
        <ErrorBoundary
          fallback={(props) => {
            inFallback()
            return <>{props.error.message}</>
          }}
        >
          {createElement(() => {
            useErrorBoundaryFallbackProps()
            return <></>
          })}
        </ErrorBoundary>
      )
    ).toThrow(SuspensiveError)
    expect(inFallback).toHaveBeenCalledTimes(0)
  })
  it('should be prevented to be called outside fallback of ErrorBoundary', () => {
    expect(() =>
      render(
        createElement(() => {
          useErrorBoundaryFallbackProps()
          return <></>
        })
      )
    ).toThrow(SuspensiveError)
  })
  it("should be prevented to be called in children of ErrorBoundary (ErrorBoundary shouldn't catch SuspensiveError)", () => {
    const inFallback = vi.fn()
    expect(() =>
      render(
        <ErrorBoundary
          fallback={(props) => {
            inFallback()
            return <>{props.error.message}</>
          }}
        >
          {createElement(() => {
            useErrorBoundaryFallbackProps()
            return <></>
          })}
        </ErrorBoundary>
      )
    ).toThrow(SuspensiveError)
    expect(inFallback).toHaveBeenCalledTimes(0)
  })
})
