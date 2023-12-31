import { type ContextType, type PropsWithChildren, useMemo } from 'react'
import {
  DelayDefaultPropsContext,
  SuspenseDefaultPropsContext,
  SuspensiveDevMode,
  SuspensiveDevModeContext,
} from './contexts'

export class Suspensive {
  public defaultOptions?: {
    suspense?: ContextType<typeof SuspenseDefaultPropsContext>
    delay?: ContextType<typeof DelayDefaultPropsContext>
  }
  public devMode = new SuspensiveDevMode()

  constructor(config: { defaultOptions?: Suspensive['defaultOptions'] } = {}) {
    this.defaultOptions = config.defaultOptions
  }
}

interface SuspensiveProviderProps extends PropsWithChildren {
  value: Suspensive
}
export const SuspensiveProvider = ({ value, children }: SuspensiveProviderProps) => {
  const delayDefaultOptions = useMemo(() => value.defaultOptions?.delay || {}, [value.defaultOptions?.delay])
  const suspenseDefaultOptions = useMemo(() => value.defaultOptions?.suspense || {}, [value.defaultOptions?.suspense])

  return (
    <SuspensiveDevModeContext.Provider value={value.devMode}>
      <DelayDefaultPropsContext.Provider value={delayDefaultOptions}>
        <SuspenseDefaultPropsContext.Provider value={suspenseDefaultOptions}>
          {children}
        </SuspenseDefaultPropsContext.Provider>
      </DelayDefaultPropsContext.Provider>
    </SuspensiveDevModeContext.Provider>
  )
}
