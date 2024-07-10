import type { Suspense } from 'react'
import { type SuspenseClientOnly, defineSuspense } from './defineSuspense'

describe('defineSuspense', () => {
  it('type check', () => {
    expectTypeOf(defineSuspense({ componentPropsClientOnly: true })).toEqualTypeOf<typeof SuspenseClientOnly>()
    expectTypeOf(defineSuspense({ defaultPropsClientOnly: true })).toEqualTypeOf<typeof SuspenseClientOnly>()
    expectTypeOf(defineSuspense({ componentPropsClientOnly: true, defaultPropsClientOnly: undefined })).toEqualTypeOf<
      typeof SuspenseClientOnly
    >()
    expectTypeOf(defineSuspense({ componentPropsClientOnly: undefined, defaultPropsClientOnly: true })).toEqualTypeOf<
      typeof SuspenseClientOnly
    >()
    expectTypeOf(defineSuspense({ defaultPropsClientOnly: true, componentPropsClientOnly: true })).toEqualTypeOf<
      typeof SuspenseClientOnly
    >()
    expectTypeOf(defineSuspense({ defaultPropsClientOnly: true, componentPropsClientOnly: false })).toEqualTypeOf<
      typeof SuspenseClientOnly
    >()
    expectTypeOf(defineSuspense({ defaultPropsClientOnly: false, componentPropsClientOnly: true })).toEqualTypeOf<
      typeof SuspenseClientOnly
    >()
    expectTypeOf(defineSuspense({ defaultPropsClientOnly: false, componentPropsClientOnly: false })).toEqualTypeOf<
      typeof Suspense
    >()
    expectTypeOf(
      defineSuspense({ defaultPropsClientOnly: undefined, componentPropsClientOnly: undefined })
    ).toEqualTypeOf<typeof Suspense>()
  })
})
