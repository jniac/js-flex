const path = require('path')
const chokidar = require('chokidar')
const chalk = require('chalk')
const now = require('performance-now')

const build = require('./build.js')
const test = require('../test/cli/index.js')
const packageJson = require('../package.json')

console.log(chalk`start develop on {green ${packageJson.name}}{yellow @${packageJson.version}}\n`)

build()

chokidar.watch('./src').on('change', async path => {

    await build()
    console.log(await await test())
})
