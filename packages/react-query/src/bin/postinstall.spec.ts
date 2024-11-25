import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getTanStackReactQueryPackageJson } from './utils/package'
import { switchVersion } from './utils/switchVersion'

vi.mock('./utils/package')
vi.mock('./utils/switchVersion')

describe('postinstall', () => {
  const mockConsoleWarn = vi.spyOn(console, 'warn')
  const mockGetPackageJson = vi.mocked(getTanStackReactQueryPackageJson)
  const mockSwitchVersion = vi.mocked(switchVersion)

  const runPostInstall = async (version: string) => {
    mockGetPackageJson.mockReturnValue({
      name: 'tanstack-query',
      version,
      description: `TanStack Query v${version.split('.')[0]}`,
    })

    await import('./postinstall')
  }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('should switch to version 4 when TanStack Query v4 is installed', async () => {
    await runPostInstall('4.2.3')

    expect(mockGetPackageJson).toHaveBeenCalledTimes(1)
    expect(mockSwitchVersion).toHaveBeenCalledWith(4)
    expect(mockSwitchVersion).toHaveBeenCalledTimes(1)
    expect(mockConsoleWarn).not.toHaveBeenCalled()
  })

  it('should switch to version 5 when TanStack Query v5 is installed', async () => {
    await runPostInstall('5.2.3')

    expect(mockGetPackageJson).toHaveBeenCalledTimes(1)
    expect(mockSwitchVersion).toHaveBeenCalledWith(5)
    expect(mockSwitchVersion).toHaveBeenCalledTimes(1)
    expect(mockConsoleWarn).not.toHaveBeenCalled()
  })

  it('should show warning when unsupported version is installed', async () => {
    await runPostInstall('3.3.4')

    expect(mockGetPackageJson).toHaveBeenCalledTimes(1)
    expect(mockSwitchVersion).not.toHaveBeenCalled()
    expect(mockConsoleWarn).toHaveBeenCalledWith('[@suspensive/react-query]', 'version v3.3.4 is not supported.')
  })
})