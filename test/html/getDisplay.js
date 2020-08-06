import html from './html.js'

let count = 0

export default (description, { color = '#ccc', width = 600, height = 300, pixelRatio = 2 } = {}) => {

    const id = count++
    const name = `test${id}`

    const fullWidth = width * pixelRatio
    const fullHeight = height * pixelRatio

    const element = html`
        <div class="display">
            <canvas width="${fullWidth}" height="${fullHeight}" style="width:${width}px; height:${height}px;"></canvas>
            <header>
                <h3 style="background-color: ${color};">${name}</h3>
                <h2>${description}</h2>
            </header>
            <footer></footer>
        </div>
    `

    document.body.append(element)

    const canvas = element.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    const scope = {}
    const addToScope = props => Object.assign(scope, props)

    Object.assign(globalThis, { [name]:scope })

    const defaultColor = '#0036'
    const canvasOffset = { x:50, y:50 }

    const clear = () => {

        ctx.clearRect(0, 0, width * pixelRatio, height * pixelRatio)
    }

    const draw = options => {

        const { strokeColor, strokeWidth = 1, fillColor } = options ?? {}

        if (strokeColor) {

            ctx.strokeStyle = strokeColor
            ctx.lineWidth = strokeColor ? strokeWidth * pixelRatio : 0
            ctx.stroke()
        }

        if (fillColor) {

            ctx.fillStyle = fillColor
            ctx.fill()
        }
    }

    const drawRect = (x, y, width, height, options) => {

        if (width === 0 && height === 0)
            return drawPoint(x, y, 10, options)

        x += canvasOffset.x
        y += canvasOffset.y

        ctx.beginPath()
        ctx.rect(x * pixelRatio, y * pixelRatio, width * pixelRatio, height * pixelRatio)

        draw(options)
    }

    const drawPoint = (x, y, size, options) => {

        draw(options)

        x += canvasOffset.x
        y += canvasOffset.y

        x *= pixelRatio
        y *= pixelRatio
        size *= pixelRatio

        ctx.moveTo(x - size * .5, y)
        ctx.lineTo(x + size * .5, y)
        ctx.moveTo(x, y - size * .5)
        ctx.lineTo(x, y + size * .5)
        ctx.stroke()
    }

    const drawText = (x, y, text, options) => {

        let { size = 11 } = options ?? {}

        x += canvasOffset.x
        y += canvasOffset.y

        x *= pixelRatio
        y *= pixelRatio
        size *= pixelRatio

        ctx.textBaseline = 'hanging'
        ctx.font = `${size}px monospace`
        ctx.textAlign = 'center'
        ctx.fillText(text, x, y)
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

    const addMessageToFooter = message => {

        element.querySelector('footer').append(html`
            <h4>${message}</h4>
        `)
    }

    return {
        canvas,
        ctx,
        scope,
        addToScope,
        defaultColor,
        clear,
        drawRect,
        drawPoint,
        drawText,
        onStart,
        onUpdate,
        clearOnUpdate,
        log,
        addMessageToFooter,
    }
}
