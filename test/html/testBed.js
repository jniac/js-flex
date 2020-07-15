
let count = 0
class Test {

    constructor(color) {

        this.id = count++
        this.color = color
    }

    log(message) {

        console.log(`%c#${this.id.toString().padStart(2, '0')} %c${message}`, `color:${this.color}`, '')
    }
}

const subscribe = color => {

    const test = new Test(color)

    return message => test.log(message)
}

const performanceBench = new Set()
const addToPerformanceBench = callback => performanceBench.add(callback)
const dumpPerformanceBench = () => {
    for (const cb of performanceBench)
        cb()
}
const bench = (callback, max = 1000) => {

    let t = -performance.now()
    for (let i = 0; i < max; i++)
        callback()
    t += performance.now()

    return {
        averageTime: t / max,
        totalTime: t,
        max,
    }
}

export default {
    subscribe,
    addToPerformanceBench,
    dumpPerformanceBench,
    bench,
}
