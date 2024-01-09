import { FALLBACK, Suspend, TEXT } from '@suspensive/test-utils'
import { render, screen, waitFor } from '@testing-library/react'
import ms from 'ms'
import { beforeEach, describe, expect, it } from 'vitest'
import { Suspense } from './Suspense'

describe('<Suspense/>', () => {
  beforeEach(() => Suspend.reset())

  it('should render the children if nothing to suspend', () => {
    render(<Suspense fallback={FALLBACK}>{TEXT}</Suspense>)
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
    expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument()
  })
  it('should render the fallback if something to suspend in children', () => {
    render(
      <Suspense fallback={FALLBACK}>
        <Suspend during={Infinity} toShow={TEXT} />
      </Suspense>
    )
    expect(screen.queryByText(FALLBACK)).toBeInTheDocument()
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
  })
  it('should render the children after suspending', async () => {
    render(
      <Suspense>
        <Suspend during={ms('0.1s')} toShow={TEXT} />
      </Suspense>
    )
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText(TEXT)).toBeInTheDocument())
  })
})
describe('<Suspense.CSROnly/>', () => {
  beforeEach(() => Suspend.reset())

  it('should render the fallback during suspending', () => {
    render(
      <Suspense.CSROnly fallback={FALLBACK}>
        <Suspend during={Infinity} toShow={TEXT} />
      </Suspense.CSROnly>
    )
    expect(screen.queryByText(FALLBACK)).toBeInTheDocument()
    expect(screen.queryByText(TEXT)).not.toBeInTheDocument()
  })
  it('should render the children after the suspending', async () => {
    render(
      <Suspense.CSROnly fallback={FALLBACK}>
        <Suspend during={ms('0.1s')} toShow={TEXT} />
      </Suspense.CSROnly>
    )
    await waitFor(() => expect(screen.queryByText(TEXT)).toBeInTheDocument())
    expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument()
  })
  it('should render the children if nothing to suspend in children', () => {
    render(<Suspense.CSROnly fallback={FALLBACK}>{TEXT}</Suspense.CSROnly>)
    expect(screen.queryByText(FALLBACK)).not.toBeInTheDocument()
    expect(screen.queryByText(TEXT)).toBeInTheDocument()
  })
})
