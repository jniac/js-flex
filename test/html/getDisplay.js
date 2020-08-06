import html from './html.js'

let count = 0

export default (description, { width = 600, height = 300 } = {}) => {

    const id = count++
    const name = `test${id}`

    const element = html`
        <div class="test-display">
            <canvas width="${width}" height="${height}"></canvas>
            <header>
                <h3>${name}</h3>
                <h2>${description}</h2>
            </header>
        </div>
    `

    document.body.append(element)

    const canvas = element.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    const scope = {}

    Object.assign(globalThis, { [name]:scope })

    const defaultColor = '#0038'
    const canvasOffset = { x:50, y:50 }

    const clear = () => {

        ctx.clearRect(0, 0, width, height)
    }

    const drawRect = (x, y, width, height, options) => {

        const { strokeColor } = options ?? {}

        ctx.strokeStyle = strokeColor

        x += canvasOffset.x
        y += canvasOffset.y

        ctx.strokeRect(x, y, width, height)
    }

    let onUpdateCallback
    let frame = 0, time = 0
    const loop = () => {

        requestAnimationFrame(loop)

        onUpdateCallback?.({ frame, time })

        time += 1 / 60
        frame++
    }

    const onStart = callback => callback({ frame:0, time:0 })
    const onUpdate = callback => {
        onUpdateCallback = callback
        requestAnimationFrame(loop)
    }
    const clearOnUpdate = () => onUpdateCallback = undefined

    return {
        canvas,
        ctx,
        scope,
        defaultColor,
        clear,
        drawRect,
        onStart,
        onUpdate,
        clearOnUpdate,
    }
}
