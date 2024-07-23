import tanStackReactQueryPackageJson from '@tanstack/react-query/package.json'
import packageJson from '../../../package.json'
import {
  getExportAPIsWithoutSuspensive,
  getPackageJson,
  getSuspensiveReactQueryPackageJson,
  getTanStackReactQueryPackageJson,
  getTargetSuspensiveReactQueryAPIs,
  getTargetSuspensiveReactQueryVersion,
} from './package'

const version4APIs = [
  'useSuspenseQuery',
  'useSuspenseQueries',
  'useSuspenseInfiniteQuery',
  'queryOptions',
  'infiniteQueryOptions',
  'SuspenseQuery',
  'SuspenseQueries',
  'SuspenseInfiniteQuery',
  'QueryErrorBoundary',
  'Mutation',
]

describe('package', () => {
  it('should get package.json', () => {
    const result = getPackageJson()

    expect(result).toBeDefined()
    expect(result.name).toBe(packageJson.name)
    expect(result.description).toBe(packageJson.description)
    expect(result.version).toBe(packageJson.version)
  })

  it('should get @tanstack/react-query package.json', () => {
    const result = getTanStackReactQueryPackageJson()

    expect(result).toBeDefined()
    expect(result.name).toBe(tanStackReactQueryPackageJson.name)
    expect(result.description).toBe(tanStackReactQueryPackageJson.description)
    expect(result.version).toBe(tanStackReactQueryPackageJson.version)
  })

  it('should get the target @suspensive/react-query version from the index file content', () => {
    const targetSuspensiveReactQueryVersion = getTargetSuspensiveReactQueryVersion()

    expect(targetSuspensiveReactQueryVersion).toBe('4')
  })

  it('should get the target @suspensive/react-query version 4 APIs', () => {
    const apis = getTargetSuspensiveReactQueryAPIs()

    expect(apis).toEqual(version4APIs)
  })

  it('should get the @suspensive/react-query package.json for version 4', () => {
    const result = getSuspensiveReactQueryPackageJson('4')

    expect(result).toBeDefined()
    expect(result.name).toBe('@suspensive/react-query-4')
  })

  it('should get exported APIs without @suspensive/react-query', () => {
    const apis = getExportAPIsWithoutSuspensive()

    expect(apis).toEqual(expect.arrayContaining([]))
  })
})
