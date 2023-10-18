import { act, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { vi } from 'vitest'
import { assert } from './utils'
import { ERROR_MESSAGE, MS_100, TEXT, ThrowError } from './utils/toTest'
import { ErrorBoundary, ErrorBoundaryGroup, useErrorBoundaryGroup, withErrorBoundaryGroup } from '.'

const innerErrorBoundaryCount = 3
const resetButtonText = 'reset button'

describe('<ErrorBoundaryGroup/>', () => {
  it('should reset all ErrorBoundaries in children', () => {
    vi.useFakeTimers()
    render(
      <ErrorBoundaryGroup>
        <ErrorBoundaryGroup.Reset trigger={(group) => <button onClick={group.reset}>{resetButtonText}</button>} />
        {Array.from({ length: innerErrorBoundaryCount }).map((_, key) => (
          <ErrorBoundary key={key} fallback={(props) => <div>{props.error.message}</div>}>
            <ThrowError message={ERROR_MESSAGE} after={MS_100}>
              <div>{TEXT}</div>
            </ThrowError>
          </ErrorBoundary>
        ))}
      </ErrorBoundaryGroup>
    )

    expect(screen.getAllByText(TEXT).length).toBe(innerErrorBoundaryCount)
    act(() => vi.advanceTimersByTime(MS_100))
    expect(screen.getAllByText(ERROR_MESSAGE).length).toBe(innerErrorBoundaryCount)

    const resetButton = screen.getByRole('button', { name: resetButtonText })
    act(() => {
      ThrowError.reset()
      resetButton.click()
    })
    expect(screen.getAllByText(TEXT).length).toBe(innerErrorBoundaryCount)
    expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument()
  })

  it('should reset all ErrorBoundaries in children even if it is nested, but if use blockOutside, can block reset by outside', () => {
    vi.useFakeTimers()
    render(
      <ErrorBoundaryGroup>
        <ErrorBoundaryGroup.Reset trigger={(group) => <button onClick={group.reset}>{resetButtonText}</button>} />
        {Array.from({ length: innerErrorBoundaryCount }).map((_, index) => (
          <ErrorBoundaryGroup key={index} blockOutside={index === innerErrorBoundaryCount - 1}>
            <ErrorBoundary fallback={(props) => <div>{props.error.message}</div>}>
              <ThrowError message={ERROR_MESSAGE} after={MS_100}>
                <div>{TEXT}</div>
              </ThrowError>
            </ErrorBoundary>
          </ErrorBoundaryGroup>
        ))}
      </ErrorBoundaryGroup>
    )

    expect(screen.getAllByText(TEXT).length).toBe(innerErrorBoundaryCount)
    act(() => vi.advanceTimersByTime(MS_100))
    expect(screen.getAllByText(ERROR_MESSAGE).length).toBe(innerErrorBoundaryCount)

    const resetButton = screen.getByRole('button', { name: resetButtonText })
    act(() => {
      ThrowError.reset()
      resetButton.click()
    })
    expect(screen.getAllByText(TEXT).length).toBe(innerErrorBoundaryCount - 1)
    expect(screen.getAllByText(ERROR_MESSAGE).length).toBe(1)
  })
})

const UsingUseErrorBoundaryGroup = () => {
  useErrorBoundaryGroup()
  return <>{TEXT}</>
}
describe('useErrorBoundaryGroup', () => {
  it('should throw error without ErrorBoundaryGroup in parent', () => {
    expect(() => render(<UsingUseErrorBoundaryGroup />)).toThrow(
      assert.message.useErrorBoundaryGroup.onlyInChildrenOfErrorBoundaryGroup
    )
  })
})

describe('withErrorBoundaryGroup', () => {
  it('should wrap component. we can check by useErrorBoundaryGroup', () => {
    const rendered = render(createElement(withErrorBoundaryGroup(UsingUseErrorBoundaryGroup)))
    expect(rendered.queryByText(TEXT)).toBeInTheDocument()
  })

  it('should set displayName based on Component.displayName', () => {
    const TestComponentWithDisplayName = () => <>{TEXT}</>
    TestComponentWithDisplayName.displayName = 'TestDisplayName'
    expect(withErrorBoundaryGroup(TestComponentWithDisplayName).displayName).toBe(
      'withErrorBoundaryGroup(TestDisplayName)'
    )
    expect(withErrorBoundaryGroup(() => <>{TEXT}</>).displayName).toBe('withErrorBoundaryGroup(Component)')
  })
})
