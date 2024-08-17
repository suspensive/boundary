'use client'

import { Delay, ErrorBoundary, useErrorBoundaryFallbackProps } from '@suspensive/react'
import React from 'react'

export default function Page() {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => {
        console.log({ error })

        return (
          <button onClick={reset} className="text-red-50">
            {error.message}
          </button>
        )
      }}
    >
      <ErrorBoundary
        fallback={({ error, reset }) => {
          console.log(error)

          return <button onClick={reset}>{error.message}</button>
        }}
      >
        <Delay fallback="delaying..." ms={1000}>
          <Contents />
        </Delay>
      </ErrorBoundary>
    </ErrorBoundary>
  )
}

const Contents = () => {
  useErrorBoundaryFallbackProps()

  return <>Contents</>
}
