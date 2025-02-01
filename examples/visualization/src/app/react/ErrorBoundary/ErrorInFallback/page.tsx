'use client'

import { ErrorBoundary as SuspensiveErrorBoundary } from '@suspensive/react'
import { type PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react'
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Area } from '~/components/uis'

export const useTimeout = (fn: () => void, ms: number) => {
  const fnRef = useRef(fn)
  fnRef.current = fn
  const fnPreserved = useCallback(() => fnRef.current(), [])
  useEffect(() => {
    const id = setTimeout(fnPreserved, ms)
    return () => clearTimeout(id)
  }, [fnPreserved, ms])
}

export const Throw = {
  Error: ({ message, after = 0, children }: PropsWithChildren<{ message: string; after?: number }>) => {
    const [isNeedThrow, setIsNeedThrow] = useState(after === 0)
    if (isNeedThrow) {
      throw new Error(message)
    }
    useTimeout(() => setIsNeedThrow(true), after)
    return <>{children}</>
  },
}

export default function Page() {
  return (
    <div>
      <Area title="@suspensive/react">
        <SuspensiveErrorBoundary fallback={() => <>This is expected</>}>
          <SuspensiveErrorBoundary
            fallback={() => {
              console.log("@suspensive/react's ErrorBoundary fallback")
              return (
                <Throw.Error message={'error message in fallback'} after={1000}>
                  SuspensiveErrorBoundary's fallback before error
                </Throw.Error>
              )
            }}
          >
            <Throw.Error message={'error message in children'} after={1000}>
              SuspensiveErrorBoundary's children before error
            </Throw.Error>
          </SuspensiveErrorBoundary>
        </SuspensiveErrorBoundary>
      </Area>

      <Area title="react-error-boundary">
        <ReactErrorBoundary fallbackRender={() => <>This is expected</>}>
          <ReactErrorBoundary
            fallbackRender={() => {
              console.log("react-error-boundary's ErrorBoundary fallback")
              return (
                <Throw.Error message={'error message in fallback'} after={1000}>
                  ReactErrorBoundary's fallback before error
                </Throw.Error>
              )
            }}
          >
            <Throw.Error message={'error message in children'} after={1000}>
              ReactErrorBoundary's children before error
            </Throw.Error>
          </ReactErrorBoundary>
        </ReactErrorBoundary>
      </Area>
    </div>
  )
}
