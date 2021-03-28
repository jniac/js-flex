const now = require('performance-now')
const rollup = require('rollup')
const chalk = require('chalk')
const fs = require('fs-extra')

const packageJson = require('../package.json')

const dateToString = (date = new Date) => `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${date.toTimeString().slice(0, 8)}`

const banner = () => `
// js-flex ${packageJson.version}
// ${packageJson.homepage}
// ES2020 - Build with rollup - ${dateToString()}
`

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
    const previous = await fs.readFile(config.output.file, 'utf8')
    await bundle.write(config)
    const current = await fs.readFile(config.output.file, 'utf8')
    // NOTE: This is not optim. It should exists better ways to detect changes. But we don't care.
    const hasChanged = previous.slice(config.output.banner.length) !== current.slice(config.output.banner.length)

    if (hasChanged === false) {
        await fs.outputFile(config.output.file, previous, 'utf8')
    }

    return { hasChanged }
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
    const { hasChanged } = await buildModule()
    if (hasChanged) {
        await buildCommonJS()
        rollupTime += now()
        console.log(chalk`rollup({blue build [module + cjs] {bold ${rollupTime.toFixed(2)}ms}})`)
    } else {
        rollupTime += now()
        console.log(chalk`rollup({blue no change! SKIP! {bold ${rollupTime.toFixed(2)}ms}})`)
    }

}
