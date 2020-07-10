
const chalk = require('chalk')

let indentationLevel = 0
let tab = '  '

const newLine = () => console.log('')
const log = (...args) => console.log(tab.repeat(indentationLevel), ...args)



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

const test = callback => {

    const end = () => {

        log('')

        if (itMonitoring.fail === 0) {

            log(chalk`{green PASSING (${itMonitoring.success}/${itMonitoring.total})}`)

        } else {

            log(chalk`{red FAILING (${itMonitoring.success}/${itMonitoring.total})}`)
        }
    }

    const result = callback()

    if (result && 'then' in result && 'catch' in result) {

        return new Promise(resolve => {

            result
            .then(() => {

                resolve()
                end()
            })
        })

    } else {

        end()
    }
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
