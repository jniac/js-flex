import flex from '../../../src/index.js'
import testBed from '../testBed.js'
import getDisplay from '../getDisplay.js'
import MyNode from './MyNode.js'

const spacing = 2

const nextItem = (...items) => {

    let index = -1
    const nextIndex = () => index = (index + 1) % items.length

    return () => items[nextIndex()]
}

const next = {
    childrenCount: nextItem(3, 7, 4, 3, 6, 3, 11),
    size: nextItem('1w', '3w', '10%', '1w', '3w', '1w', '50%'),
    horizontal: nextItem(true, false, false),
    // size: nextItem('1w'),
    // size: nextItem('fill'),
}

const addSomeChildren = (parent, recursiveLimit = 3) => {

    if (recursiveLimit > 0) {

        const count = next.childrenCount()
        for (let i = 0; i < count; i++) {

            const size = next.size()
            const horizontal = next.horizontal()
            const child = MyNode.new({ size, spacing, horizontal })
            addSomeChildren(child, recursiveLimit - 1)
            parent.add(child)
        }
    }
}

const root = MyNode.vertical({ width:1200 - 100, height:600 - 100, spacing })
addSomeChildren(root, 4)

Object.assign(globalThis, { root })

const display = getDisplay('simple, "Stress test"', { width:1200, height:600 })

const { rootNode } = flex.compute2D(root, { verbose:display.log })
display.addToScope({ rootNode })
console.log(rootNode.toGraphString(n => `${n.id} ${n.layout.isHorizontal ? 'horz' : 'vert'}`))

// draw
for (const node of rootNode.flat()) {

    const strokeColor = node.findUp(n => n.layout.color)?.layout.color ?? display.defaultColor
    display.drawRect(...node.bounds.rect, { strokeColor })
}
