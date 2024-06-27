import { copy } from './copy'

export function switchVersion(version: number) {
  const result = copy(version)

  if (result) {
    console.log('[@suspensive/react-query]', `set version to v${version}`)
  } else {
    console.warn('[@suspensive/react-query]', `not found version files.`)
  }
}
