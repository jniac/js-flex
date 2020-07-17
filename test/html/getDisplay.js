import html from './html.js'

export default (name, { width = 600, height = 300 } = {}) => {

    const element = html`
        <div class="test-display">
            <canvas width="${width}" height="${height}"></canvas>
            <h2>${name}</h2>
        </div>
    `

    document.body.append(element)

    const canvas = element.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    return { canvas, ctx }
}
