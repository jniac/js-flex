import html from './html.js'

let count = 0

export default (description, { color = '#ccc', width = 600, height = 300, pixelRatio = 2 } = {}) => {

    const id = count++
    const name = `test${id}`

    const fullWidth = width * pixelRatio
    const fullHeight = height * pixelRatio

    const element = html`
        <div class="test-display">
            <canvas width="${fullWidth}" height="${fullHeight}" style="width:${width}px; height:${height}px;"></canvas>
            <header>
                <h3 style="background-color: ${color};">${name}</h3>
                <h2>${description}</h2>
            </header>
        </div>
    `

    document.body.append(element)

    const canvas = element.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    const scope = {}

    Object.assign(globalThis, { [name]:scope })

    const defaultColor = '#0036'
    const canvasOffset = { x:50, y:50 }

    const clear = () => {

        ctx.clearRect(0, 0, width * pixelRatio, height * pixelRatio)
    }

    const drawRect = (x, y, width, height, options) => {

        const { strokeColor, strokeWidth = 1 } = options ?? {}

        ctx.strokeStyle = strokeColor
        ctx.lineWidth = strokeWidth * pixelRatio

        x += canvasOffset.x
        y += canvasOffset.y

        ctx.strokeRect(x * pixelRatio, y * pixelRatio, width * pixelRatio, height * pixelRatio)
    }

    let onUpdateCallback
    let frame = 0, time = 0
    const loop = () => {

        requestAnimationFrame(loop)

        onUpdateCallback?.({ frame, time, timeCos01:Math.cos(time) * .5 + .5 })

        time += 1 / 60
        frame++
    }

    const onStart = callback => callback({ frame:0, time:0 })
    const onUpdate = callback => {
        onUpdateCallback = callback
        requestAnimationFrame(loop)
    }
    const clearOnUpdate = () => onUpdateCallback = undefined

    const log = message => console.log(`%c${name}%c ${message}`, `color: ${color}`, '')

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
        log,
    }
}
