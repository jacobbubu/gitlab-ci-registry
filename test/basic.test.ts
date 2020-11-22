jest.mock(`fs`, () => {
  const fs = jest.requireActual('fs')
  // const unionfs = require('unionfs').default
  const { Union } = require('unionfs')
  const ufs = new Union()
  ufs.reset = () => {
    // fss is ufs' list of overlays
    ufs.fss = [fs]
  }

  // strange, the `use` method is lost on subsequent calls.
  // so we use a new method `use2` to call the closured `use`
  ufs.use2 = (newFs: any) => {
    ufs.use(newFs)
  }
  return ufs.use(fs)
})

import * as fs from 'fs'
import { Volume } from 'memfs'
import { writePkgFile } from '../src'

const pkg1 = {
  name: 'fake',
}
const pkgFile = 'target/package.json'

describe('simple', () => {
  beforeEach((done) => {
    done()
  })

  afterEach(() => {
    // Reset the mocked fs
    ;(fs as any).reset()
  })

  it('not changed when the env. are not ready', () => {
    const vol = Volume.fromJSON({
      [pkgFile]: JSON.stringify(pkg1, null, 2),
    })

    ;(fs as any).use2(vol)

    const original = fs.readFileSync(pkgFile, 'utf8')
    expect(writePkgFile(pkgFile, true)).toBeFalsy()
    expect(original).toBe(fs.readFileSync(pkgFile, 'utf8'))
  })

  it('changed with PORT 443', () => {
    process.env.CI_PROJECT_ROOT_NAMESPACE = 'li-mesh'
    process.env.CI_SERVER_HOST = 'gitlab.com'
    process.env.CI_SERVER_PROTOCOL = 'https'
    process.env.CI_SERVER_PORT = '443'
    process.env.CI_PROJECT_ID = '21'
    const vol = Volume.fromJSON({
      [pkgFile]: JSON.stringify(pkg1, null, 2),
    })

    ;(fs as any).use2(vol)

    expect(writePkgFile(pkgFile, true)).toBeTruthy()
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
    const expectedRegistryKey = `@${process.env.CI_PROJECT_ROOT_NAMESPACE}:registry`
    expect(pkg.publishConfig[expectedRegistryKey]).toBe(
      `${process.env.CI_SERVER_PROTOCOL}://${process.env.CI_SERVER_HOST}/api/v4/projects/${process.env.CI_PROJECT_ID}/packages/npm/`
    )
  })

  it('changed with PORT 8080', () => {
    process.env.CI_PROJECT_ROOT_NAMESPACE = 'li-mesh'
    process.env.CI_SERVER_HOST = 'gitlab.com'
    process.env.CI_SERVER_PROTOCOL = 'https'
    process.env.CI_SERVER_PORT = '8080'
    process.env.CI_PROJECT_ID = '21'
    const vol = Volume.fromJSON({
      [pkgFile]: JSON.stringify(pkg1, null, 2),
    })

    ;(fs as any).use2(vol)

    expect(writePkgFile(pkgFile, true)).toBeTruthy()
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
    const expectedRegistryKey = `@${process.env.CI_PROJECT_ROOT_NAMESPACE}:registry`
    expect(pkg.publishConfig[expectedRegistryKey]).toBe(
      `${process.env.CI_SERVER_PROTOCOL}://${process.env.CI_SERVER_HOST}:${process.env.CI_SERVER_PORT}/api/v4/projects/${process.env.CI_PROJECT_ID}/packages/npm/`
    )
  })
})
