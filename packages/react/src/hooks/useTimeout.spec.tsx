import { sleep } from '@suspensive/test-utils'
import { render, renderHook, screen } from '@testing-library/react'
import ms from 'ms'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useTimeout } from '.'

describe('useTimeout', () => {
  it('should run given function once after given timeout', async () => {
    const spy = vi.fn()
    const result = renderHook(() => useTimeout(spy, ms('0.1s')))
    expect(spy).toHaveBeenCalledTimes(0)
    await sleep(ms('0.1s'))
    expect(spy).toHaveBeenCalledTimes(1)
    result.rerender(() => useTimeout(spy, ms('0.1s')))
    await sleep(ms('0.1s'))
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should not re-call callback received as argument even if component using this hook is rerendered', async () => {
    const TestComponent = () => {
      const [number, setNumber] = useState(0)

      useTimeout(() => {
        setNumber(number + 1)
      }, ms('0.1s'))

      return <div>{number}</div>
    }

    const result = render(<TestComponent />)
    expect(screen.getByText('0')).toBeInTheDocument()
    await sleep(ms('0.1s'))
    expect(screen.getByText('1')).toBeInTheDocument()
    result.rerender(<TestComponent />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
