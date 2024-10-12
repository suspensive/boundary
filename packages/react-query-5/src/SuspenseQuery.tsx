import {
  type DefaultError,
  type QueryKey,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQuery,
} from '@tanstack/react-query'
import type { ReactNode } from 'react'

/**
 * We provide these components to clearly express what causes suspense at the same depth.
 * `<SuspenseQuery/>` serves to make `useSuspenseQuery` easier to use in jsx.
 * @see {@link https://suspensive.org/en/docs/react-query/SuspenseQuery Suspensive Docs}
 * @example
 * ```tsx
 * import { SuspenseQuery } from '@suspensive/react-query'
 *
 * // You can use QueryOptions as props.
 * <SuspenseQuery {...queryOptions()}>
 *   {({ data, isLoading }) => { // QueryResult can be used in children.
 *     return <></>
 *   }
 * </SuspenseQ
 */
export const SuspenseQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>({
  children,
  ...options
}: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  children: (queryResult: UseSuspenseQueryResult<TData, TError>) => ReactNode
}) => <>{children(useSuspenseQuery(options))}</>
