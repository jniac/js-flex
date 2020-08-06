import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'
import draw from './draw.js'

const consoleLog = testBed.subscribe('#f06')

const nextItem = (...items) => {

    let index = -1
    const nextIndex = () => index = (index + 1) % items.length

    return () => items[nextIndex()]
}

const next = {
    childrenCount: nextItem(3, 7, 4, 3, 6, 3, 11),
    size: nextItem('1w', '3w', '10%', '1w', '3w', '1w', '50%'),
}

const addSomeChildren = (parent, recursiveLimit = 3) => {

    if (recursiveLimit > 0) {

        const count = next.childrenCount()
        for (let i = 0; i < count; i++) {

            const child = MyNode.new({ size:next.size() })
            addSomeChildren(child, recursiveLimit - 1)
            parent.add(child)
        }
    }
}

const root = MyNode.new({ size:500, gutter:10, padding:10 })

addSomeChildren(root, 4)

root.children[1].layout.color = '#36f'

for (const [index, child] of root.children[1].children.entries()) {

    if (index % 2)
        child.layout.color = '#3f9'
}


const display = getDisplay('Stress test', { color:'#3f9' })
display.addToScope({ root })
display.onStart(() => draw({ flex, root, display, showText:false, depthStride:36 }))

testBed.addToPerformanceBench(() => {

    const { averageTime, totalTime, max } = testBed.bench(() => flex.compute(root), 1000)
    const message = `[${averageTime.toFixed(3)}ms] average time for ${max} loop (${root.totalNodeCount} nodes, ${totalTime.toFixed(1)}ms)`

    display.log(message)
    display.addMessageToFooter(message)
})
