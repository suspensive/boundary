import { TEXT } from '@suspensive/test-utils'
import { act, render, screen, waitFor } from '@testing-library/react'
import ms from 'ms'
import { describe, expect, it, vi } from 'vitest'
import { Delay, withDelay } from '.'

describe('<Delay/>', () => {
  it('should render the children after the delay', async () => {
    vi.useFakeTimers()
    render(<Delay ms={ms('0.1s')}>{TEXT}</Delay>)
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(ms('0.1s')))
    await waitFor(() => expect(screen.queryByText(TEXT)).toBeInTheDocument())
  })
  it('should render the children directly if no ms prop', () => {
    render(<Delay>{TEXT}</Delay>)
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
  })
})

const TEXTAfterDelay100ms = withDelay(() => <>{TEXT}</>, { ms: ms('0.1s') })

describe('withDelay', () => {
  it('renders the children after the delay with component', async () => {
    vi.useFakeTimers()
    render(<TEXTAfterDelay100ms />)
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    act(() => vi.advanceTimersByTime(ms('0.1s')))
    await waitFor(() => expect(screen.queryByText(TEXT)).toBeInTheDocument())
  })

  it('should set displayName based on Component.displayName', () => {
    const TestComponentWithDisplayName = () => <>{TEXT}</>
    TestComponentWithDisplayName.displayName = 'TestDisplayName'
    expect(withDelay(TestComponentWithDisplayName).displayName).toBe('withDelay(TestDisplayName)')
    expect(withDelay(() => <>{TEXT}</>).displayName).toBe('withDelay(Component)')
  })
})
