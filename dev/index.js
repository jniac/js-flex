const chokidar = require('chokidar')
const chalk = require('chalk')
const serveHandler = require('serve-handler')
const http = require('http')

const build = require('./build.js')
const test = require('../test/cli/index.js')
const packageJson = require('../package.json')

console.log(chalk`start develop on {green ${packageJson.name}}{yellow @${packageJson.version}}\n`)

const buildAndTest = async () => {

    await build()
    console.log(await test())
}

chokidar.watch('./src').on('change', async () => {

    buildAndTest()
})

buildAndTest()

const PORT = 3300
const server = http.createServer((request, response) => serveHandler(request, response))
server.listen(PORT, () => {
    console.log(chalk`dev server @ {blue http://localhost:${PORT}}`)
})