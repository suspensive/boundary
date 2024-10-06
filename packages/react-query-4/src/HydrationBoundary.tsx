/* eslint-disable react-compiler/react-compiler */
import { type DehydratedState, type HydrateOptions, hydrate, useQueryClient } from '@tanstack/react-query'
import React from 'react'

export interface HydrationBoundaryProps {
  state?: unknown
  options?: Omit<HydrateOptions, 'defaultOptions'> & {
    defaultOptions?: Omit<Exclude<HydrateOptions['defaultOptions'], undefined>, 'mutations'>
  }
  children?: React.ReactNode
}

/**
 * @experimental This is experimental feature.
 */
export const HydrationBoundary = ({ children, options = {}, state }: HydrationBoundaryProps) => {
  const client = useQueryClient()
  const [hydrationQueue, setHydrationQueue] = React.useState<DehydratedState['queries'] | undefined>()

  const optionsRef = React.useRef(options)
  optionsRef.current = options

  // This useMemo is for performance reasons only, everything inside it _must_
  // be safe to run in every render and code here should be read as "in render".
  //
  // This code needs to happen during the render phase, because after initial
  // SSR, hydration needs to happen _before_ children render. Also, if hydrating
  // during a transition, we want to hydrate as much as is safe in render so
  // we can prerender as much as possible.
  //
  // For any queries that already exist in the cache, we want to hold back on
  // hydrating until _after_ the render phase. The reason for this is that during
  // transitions, we don't want the existing queries and observers to update to
  // the new data on the current page, only _after_ the transition is committed.
  // If the transition is aborted, we will have hydrated any _new_ queries, but
  // we throw away the fresh data for any existing ones to avoid unexpectedly
  // updating the UI.
  React.useMemo(() => {
    if (state) {
      if (typeof state !== 'object') {
        return
      }

      const queryCache = client.getQueryCache()

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const queries = (state as DehydratedState).queries || []

      const newQueries: DehydratedState['queries'] = []
      const existingQueries: DehydratedState['queries'] = []
      for (const dehydratedQuery of queries) {
        const existingQuery = queryCache.get(dehydratedQuery.queryHash)

        if (!existingQuery) {
          newQueries.push(dehydratedQuery)
        } else {
          const hydrationIsNewer = dehydratedQuery.state.dataUpdatedAt > existingQuery.state.dataUpdatedAt
          const queryAlreadyQueued = hydrationQueue?.find((query) => query.queryHash === dehydratedQuery.queryHash)

          if (
            hydrationIsNewer &&
            (!queryAlreadyQueued || dehydratedQuery.state.dataUpdatedAt > queryAlreadyQueued.state.dataUpdatedAt)
          ) {
            existingQueries.push(dehydratedQuery)
          }
        }
      }

      if (newQueries.length > 0) {
        // It's actually fine to call this with queries/state that already exists
        // in the cache, or is older. hydrate() is idempotent for queries.
        hydrate(client, { queries: newQueries }, optionsRef.current)
      }
      if (existingQueries.length > 0) {
        setHydrationQueue((prev) => (prev ? [...prev, ...existingQueries] : existingQueries))
      }
    }
  }, [client, hydrationQueue, state])

  React.useEffect(() => {
    if (hydrationQueue) {
      hydrate(client, { queries: hydrationQueue }, optionsRef.current)
      // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
      setHydrationQueue(undefined)
    }
  }, [client, hydrationQueue])

  return children as React.ReactElement
}
