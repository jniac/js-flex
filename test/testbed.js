
const chalk = require('chalk')
const now = require('performance-now')

const currentOptions = {
    verbose: true,
}

let indentationLevel = 0
let tab = '  '

const newLine = () => console.log('')

const log = (...args) => {

    const message = args.join(' ')

    if (currentOptions.verbose)
        console.log(tab.repeat(indentationLevel), message)

    return message
}



const describe = (text, callback) => {

    indentationLevel++

    log('')
    log(text)

    const result = callback()

    if (result && 'then' in result && 'catch' in result) {

        return new Promise(resolve => {

            result
            .then(() => {

                resolve()
                indentationLevel--
            })
        })

    } else {

        indentationLevel--
    }
}




const itMonitoring = {

    total: 0,
    success: 0,
    fail: 0,

    reset() {
        this.total = 0
        this.success = 0
        this.fail = 0
    }
}

const success = text => {

    log(chalk`{green ✓} {grey ${text}}`)

    indentationLevel--
    itMonitoring.success++
}

const fail = (text, e) => {

    log(chalk`{red ✗} ${text}`)
    log(chalk`oops: {red ${e.message}}`)

    indentationLevel--
    itMonitoring.fail++
}

const it = (name, callback) => {

    indentationLevel++
    itMonitoring.total++

    try {

        const result = callback()

        if (result && 'then' in result && 'catch' in result) {

            return new Promise(resolve => {

                result
                .then(() => {

                    success(name)
                    resolve()

                })
                .catch(e => {

                    fail(name, e)
                    resolve()
                })

            })

        } else {

            success(name)
        }

    } catch (e) {

        fail(name, e)
    }
}

const test = (options, callback) => {

    if (typeof options === 'function')
        return test({ verbose:true }, options)

    Object.assign(currentOptions, options)

    itMonitoring.reset()

    const time = now()

    const end = () => {

        log('')

        const cnt = `(${itMonitoring.success}/${itMonitoring.total})`
        const ms = `(${(now() - time).toFixed(2)}ms)`

        if (itMonitoring.fail === 0)
            return log(chalk`{green PASSING ${cnt}} {grey ${ms}}`)

        return log(chalk`{red FAILING ${cnt}} {grey ${ms}}`)
    }

    const result = callback()

    if (result && 'then' in result && 'catch' in result) {

        return new Promise(resolve => {

            result
            .then(() => resolve(end()))
        })

    }

    return end()
}



const almostEquals = (a, b, epsilon = 1e-6) => {

    if (Math.abs(a - b) > epsilon)
        throw new Error(`'a' is not reasonably equal to 'b': ${a} ≠ ${b}`)
}

module.exports = {
    test,
    describe,
    it,
    almostEquals,
}
