import * as fs from 'fs'

export function writePkgFile(pkgFile: string, noConsole = false) {
  try {
    const serverProto = process.env.CI_SERVER_PROTOCOL
    const serverHost = process.env.CI_SERVER_HOST
    const serverPort = process.env.CI_SERVER_PORT
    const projectId = process.env.CI_PROJECT_ID
    if (!serverHost || !serverProto || !projectId) {
      if (!noConsole)
        console.log(`Missing CI environment variables:`, {
          CI_SERVER_PROTOCOL: serverProto,
          CI_SERVER_HOST: serverHost,
          CI_SERVER_PORT: serverPort,
          CI_PROJECT_ID: projectId,
        })
      return false
    }

    let url
    if (serverPort === '443' || serverPort === '80') {
      url = `${serverProto}://${serverHost}/api/v4/projects/${projectId}/packages/npm`
    } else {
      url = `${serverProto}://${serverHost}:${serverPort}/api/v4/projects/${projectId}/packages/npm`
    }
    const json = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
    if (json.publishConfig?.registry) {
      if (!noConsole) console.log(`publishConfig.registry exists`, json.publishConfig.registry)
      return false
    }
    json.publishConfig = json.publishConfig || {}
    json.publishConfig.registry = url

    fs.writeFileSync(pkgFile, JSON.stringify(json, null, 2))
    if (!noConsole) console.log(`set publishConfig.registry to`, url)
    return true
  } catch (err) {
    if (!noConsole) console.error(`read ${pkgFile} failed:`, err)
    return false
  }
}
