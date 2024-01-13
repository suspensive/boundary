'use client'
import { Delay } from '@suspensive/react'

export default function Page() {
  return (
    <Delay ms={40} fallback="Fallback1">
      Delayed
    </Delay>
  )
}
