const now = require('performance-now')
const rollup = require('rollup')
const chalk = require('chalk')
const fs = require('fs-extra')
const filesize = require('filesize')

const packageJson = require('../package.json')

const dateToString = (date = new Date) => `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${date.toTimeString().slice(0, 8)}`

const banner = () => `// js-flex ${packageJson.version}\n// ES2020 - Build with rollup - ${dateToString()}\n`

const buildModule = async () => {

    const config = {

        input: 'src/index.js',
        output: {
            banner: banner(),
            file: 'build/flex.js',
            format: 'module',
        },
    }

    const bundle = await rollup.rollup(config)
    await bundle.write(config)
}

const buildCommonJS = async () => {

    const config = {

        input: 'src/index.js',
        output: {
            banner: banner(),
            file: 'build/flex.common.js',
            format: 'cjs',
        },
    }

    const bundle = await rollup.rollup(config)
    await bundle.write(config)
}

module.exports = async () => {

    let rollupTime = -now()
    await buildModule()
    await buildCommonJS()
    rollupTime += now()

    console.log(chalk`rollup({blue build [module + cjs] {bold ${rollupTime.toFixed(2)}ms}})`)
}
