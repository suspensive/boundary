import { render, screen, waitFor } from '@testing-library/react'
import ms from 'ms'
import { DefaultProps, DefaultPropsProvider } from './DefaultProps'
import { Delay } from './Delay'
import { Message_Delay_ms_prop_should_be_greater_than_or_equal_to_0, SuspensiveError } from './models/SuspensiveError'
import { CustomError, TEXT } from './test-utils'

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
})

describe('<Delay/>', () => {
  it('should render the children after the delay', async () => {
    render(<Delay ms={ms('0.1s')}>{TEXT}</Delay>)

    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(TEXT)).toBeInTheDocument())
  })
  it('should render the children directly if no ms prop', () => {
    render(<Delay>{TEXT}</Delay>)
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
  })
  it('should accept 0 for ms prop', () => {
    render(<Delay ms={0}>{TEXT}</Delay>)

    expect(screen.queryByText(TEXT)).toBeInTheDocument()
  })
  it('should render fallback content initially and then the actual text after the delay', async () => {
    render(
      <Delay ms={ms('1s')} fallback={<p role="paragraph">fallback</p>}>
        {TEXT}
      </Delay>
    )
    expect(screen.queryByRole('paragraph')).toBeInTheDocument()

    vi.advanceTimersByTime(ms('1s'))

    await waitFor(() => expect(screen.queryByText(TEXT)).toBeInTheDocument())
  })
  it('should throw SuspensiveError if negative number is passed as ms prop', () => {
    expect(() => render(<Delay ms={-1}>{TEXT}</Delay>)).toThrow(
      Message_Delay_ms_prop_should_be_greater_than_or_equal_to_0
    )
    try {
      render(<Delay ms={-1}>{TEXT}</Delay>)
    } catch (error) {
      expect(error).toBeInstanceOf(SuspensiveError)
      expect(error).toBeInstanceOf(Error)
      expect(error).not.toBeInstanceOf(CustomError)
    }
  })
  it('should use `defaultProps.fallback` if no fallback prop is passed', () => {
    const defaultProps = new DefaultProps({ Delay: { fallback: 'defaultFallback' } })
    render(
      <DefaultPropsProvider defaultProps={defaultProps}>
        <Delay ms={1}>{TEXT}</Delay>
      </DefaultPropsProvider>
    )
    expect(screen.queryByText('defaultFallback')).toBeInTheDocument()
  })
})
