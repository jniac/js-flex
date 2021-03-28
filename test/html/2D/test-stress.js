import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'
import { Random } from 'https://jniac.github.io/js-kit/build/kit.module.js'

const R = new Random()

const spacing = 2

const nextItem = (...items) => {

    let index = -1
    const nextIndex = () => index = (index + 1) % items.length

    return () => items[nextIndex()]
}

const next = {
    childrenCount: nextItem(3, 7, 4, 3, 6, 3, 11),
    // size: nextItem('1w', '3w', '10%', '1w', '3w', '1w', '50%'),
    // size: nextItem('1w', '3w', '2w'),
    size: () => R.weightedItem([
        { value:'1w',  weight:140 },
        { value:'3w',  weight:40 },
        { value:'2w',  weight:40 },
        { value:'40%',  weight:1 },
    ]).value,
    // size: nextItem('1w', '3w', '5%', '1w', '3w', '1w', '20%'),
    horizontal: nextItem(true, false, true, true, false, false, true, true, false),
    color: nextItem('#aab', '#aab', 'red', '#aab', '#bbc', '#fc0', '#fc0', '#99a', '#aab', '#bbc', 'white'),
    color: () => R.weightedItem([
        { value:'#03c',  weight:1 },
        { value:'#aab',  weight:10 },
        { value:'#bbc',  weight:10 },
        { value:'#99a',  weight:6 },
        { value:'white', weight:4 },
        { value:'#fc0',  weight:6 },
        { value:'red',   weight:2 },
    ]).value,
    // size: nextItem('1w'),
    // size: nextItem('fill'),
}

const addSomeChildren = (parent, recursiveLimit = 3) => {

    if (recursiveLimit > 0) {

        const count = next.childrenCount()
        for (let i = 0; i < count; i++) {

            const horizontal = next.horizontal()
            const color = next.color()
            const width = parent.style.horizontal ? next.size() : 'fill'
            const height = !parent.style.horizontal ? next.size() : 'fill'
            const child = MyNode.new({ width, height, spacing, horizontal, color })
            addSomeChildren(child, recursiveLimit - 1)
            parent.add(child)
        }
    }
}

const root = MyNode.vertical({ width:1208 - 100, height:600 - 100, spacing })
addSomeChildren(root, 4)

Object.assign(globalThis, { root })

const display = getDisplay('simple, "Stress test"', { width:1208, height:600 })

const { rootNode } = flex.compute2D(root, { verbose:display.log })
display.addToScope({ rootNode })

next.color()
// draw
for (const node of rootNode.flat()) {

    const fillColor = node.findUp(n => n.style.color)?.style.color ?? display.defaultColor
    const strokeColor = next.color()
    display.drawRect(...node.bounds.rect, { fillColor })
}

testBed.addToPerformanceBench(() => {

    const { averageTime, totalTime, max } = testBed.bench(() => flex.compute2D(root), 1000)
    const message = `[${averageTime.toFixed(3)}ms] average time for ${root.totalNodeCount} nodes (${max} loop, ${totalTime.toFixed(1)}ms)`

    display.log(message)
    display.addMessageToFooter(message)
})
