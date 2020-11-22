#!/usr/bin/env node
const { writePkgFile } = require('../dist/index.js')

const pkgFile = process.argv[2]
if (!pkgFile) {
  console.error('Please provide the path to "package.json" file. example: gitlab-ci-registry ./package.json')
}
writePkgFile(pkgFile)
