import html from './html.js'

let count = 0

export default (name, { width = 600, height = 300 } = {}) => {

    const element = html`
        <div class="test-display">
            <canvas width="${width}" height="${height}"></canvas>
            <h2>${name}</h2>
        </div>
    `

    document.body.append(element)

    const id = count++
    const canvas = element.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    const scope = {}

    Object.assign(globalThis, { [`test${id}`]:scope })

    return { canvas, ctx, scope }
}
