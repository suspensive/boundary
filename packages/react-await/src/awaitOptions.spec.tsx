import { FALLBACK, TEXT } from '@suspensive/utils'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { Await } from './Await'
import { awaitOptions } from './awaitOptions'
import { useAwait } from './useAwait'

const key = (id: number) => ['key', id] as const

const options = awaitOptions({ key: key(1), fn: () => Promise.resolve(TEXT) })

describe('awaitOptions', () => {
  it('should be used with Await', async () => {
    render(
      <Suspense fallback={FALLBACK}>
        <Await options={options}>{({ data }) => <>{data}</>}</Await>
      </Suspense>
    )

    expect(await screen.findByText(TEXT)).toBeInTheDocument()
  })

  it('should be used with useAwait', async () => {
    const AwaitedComponent = () => {
      const awaited = useAwait(options)

      return <>{awaited.data}</>
    }

    render(
      <Suspense fallback={FALLBACK}>
        <AwaitedComponent />
      </Suspense>
    )

    expect(await screen.findByText(TEXT)).toBeInTheDocument()
  })
})
