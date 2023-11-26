/* eslint-disable @typescript-eslint/naming-convention */
import type { QueryFunction, UseErrorBoundary, UseQueryOptions } from '@tanstack/react-query'
import { useQueries } from '@tanstack/react-query'
import type { UseSuspenseQueryOptions, UseSuspenseQueryResult } from './useSuspenseQuery'

// Avoid TS depth-limit error in case of large array literal
type MAXIMUM_DEPTH = 20

type GetSuspenseOptions<T> =
  // Part 1: responsible for applying explicit type parameter to function arguments, if object { queryFnData: TQueryFnData, error: TError, data: TData }
  T extends { queryFnData: infer TQueryFnData; error?: infer TError; data: infer TData }
    ? UseSuspenseQueryOptions<TQueryFnData, TError, TData>
    : T extends { queryFnData: infer TQueryFnData; error?: infer TError }
      ? UseSuspenseQueryOptions<TQueryFnData, TError>
      : T extends { data: infer TData; error?: infer TError }
        ? UseSuspenseQueryOptions<unknown, TError, TData>
        : // Part 2: responsible for applying explicit type parameter to function arguments, if tuple [TQueryFnData, TError, TData]
          T extends [infer TQueryFnData, infer TError, infer TData]
          ? UseSuspenseQueryOptions<TQueryFnData, TError, TData>
          : T extends [infer TQueryFnData, infer TError]
            ? UseSuspenseQueryOptions<TQueryFnData, TError>
            : T extends [infer TQueryFnData]
              ? UseSuspenseQueryOptions<TQueryFnData>
              : // Part 3: responsible for inferring and enforcing type if no explicit parameter was provided
                T extends {
                    queryFn?: QueryFunction<infer TQueryFnData, infer TQueryKey>
                    select: (data: any) => infer TData
                    useErrorBoundary?: UseErrorBoundary<any, infer TError, any, any>
                  }
                ? UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
                : T extends {
                      queryFn?: QueryFunction<infer TQueryFnData, infer TQueryKey>
                      useErrorBoundary?: UseErrorBoundary<any, infer TError, any, any>
                    }
                  ? UseSuspenseQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey>
                  : // Fallback
                    UseSuspenseQueryOptions

type GetSuspenseResults<T> =
  // Part 1: responsible for mapping explicit type parameter to function result, if object
  T extends { queryFnData: any; error?: infer TError; data: infer TData }
    ? UseSuspenseQueryResult<TData, TError>
    : T extends { queryFnData: infer TQueryFnData; error?: infer TError }
      ? UseSuspenseQueryResult<TQueryFnData, TError>
      : T extends { data: infer TData; error?: infer TError }
        ? UseSuspenseQueryResult<TData, TError>
        : // Part 2: responsible for mapping explicit type parameter to function result, if tuple
          T extends [any, infer TError, infer TData]
          ? UseSuspenseQueryResult<TData, TError>
          : T extends [infer TQueryFnData, infer TError]
            ? UseSuspenseQueryResult<TQueryFnData, TError>
            : T extends [infer TQueryFnData]
              ? UseSuspenseQueryResult<TQueryFnData>
              : // Part 3: responsible for mapping inferred type to results, if no explicit parameter was provided
                T extends {
                    queryFn?: QueryFunction<unknown, any>
                    select: (data: any) => infer TData
                    useErrorBoundary?: UseErrorBoundary<any, infer TError, any, any>
                  }
                ? UseSuspenseQueryResult<TData, unknown extends TError ? Error : TError>
                : T extends {
                      queryFn?: QueryFunction<infer TQueryFnData, any>
                      useErrorBoundary?: UseErrorBoundary<any, infer TError, any, any>
                    }
                  ? UseSuspenseQueryResult<TQueryFnData, unknown extends TError ? Error : TError>
                  : // Fallback
                    UseSuspenseQueryResult

/**
 * SuspenseQueriesOptions reducer recursively unwraps function arguments to infer/enforce type param
 */
export type SuspenseQueriesOptions<
  T extends Array<any>,
  Result extends Array<any> = [],
  Depth extends ReadonlyArray<number> = [],
> = Depth['length'] extends MAXIMUM_DEPTH
  ? Array<UseSuspenseQueryOptions>
  : T extends []
    ? []
    : T extends [infer Head]
      ? [...Result, GetSuspenseOptions<Head>]
      : T extends [infer Head, ...infer Tail]
        ? SuspenseQueriesOptions<[...Tail], [...Result, GetSuspenseOptions<Head>], [...Depth, 1]>
        : Array<unknown> extends T
          ? T
          : // If T is *some* array but we couldn't assign unknown[] to it, then it must hold some known/homogenous type!
            // use this to infer the param types in the case of Array.map() argument
            T extends Array<UseSuspenseQueryOptions<infer TQueryFnData, infer TError, infer TData, infer TQueryKey>>
            ? Array<UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>>
            : // Fallback
              Array<UseSuspenseQueryOptions>

/**
 * SuspenseQueriesResults reducer recursively maps type param to results
 */
export type SuspenseQueriesResults<
  T extends Array<any>,
  Result extends Array<any> = [],
  Depth extends ReadonlyArray<number> = [],
> = Depth['length'] extends MAXIMUM_DEPTH
  ? UseSuspenseQueryResult[]
  : T extends []
    ? []
    : T extends [infer Head]
      ? [...Result, GetSuspenseResults<Head>]
      : T extends [infer Head, ...infer Tail]
        ? SuspenseQueriesResults<[...Tail], [...Result, GetSuspenseResults<Head>], [...Depth, 1]>
        : T extends Array<UseSuspenseQueryOptions<infer TQueryFnData, infer TError, infer TData, any>>
          ? // Dynamic-size (homogenous) UseQueryOptions array: map directly to array of results
            Array<
              UseSuspenseQueryResult<
                unknown extends TData ? TQueryFnData : TData,
                unknown extends TError ? Error : TError
              >
            >
          : // Fallback
            Array<UseSuspenseQueryResult>

/**
 * This hook is wrapping useQueries of `@tanstack/react-query` v4 with default suspense option.
 * @see {@link https://suspensive.org/docs/react-query/useSuspenseQuery}
 */
export const useSuspenseQueries = <T extends Array<any>>({
  queries,
  context,
}: {
  queries: readonly [...SuspenseQueriesOptions<T>]
  context?: UseQueryOptions['context']
}): SuspenseQueriesResults<T> =>
  useQueries({
    queries: queries.map((query) => ({
      ...query,
      enabled: true,
      useErrorBoundary: true,
      suspense: true,
    })),
    context,
  }) as SuspenseQueriesResults<T>
