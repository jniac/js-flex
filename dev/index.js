const path = require('path')
const chokidar = require('chokidar')
const chalk = require('chalk')
const now = require('performance-now')

const build = require('./build.js')
const test = require('../test/index.js')

build()

chokidar.watch('./src').on('change', async path => {

    await build()
    console.log(await await test())
})
