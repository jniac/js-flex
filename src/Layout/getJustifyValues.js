/**
 * returns
 * @return {Array} [align, extraGutter, extraPaddingStart]
 */
export default (justify, freeSpace, gutterCount) => {

    if (justify.endsWith('%')) {

        return [parseFloat(justify) / 100, 0, 0]
    }

    let align = 0
    let extraGutter = 0
    let extraPaddingStart = 0

    switch (justify) {

        case 'start':
            align = 0
            break

        default:
        case 'center':
            align = .5
            break

        case 'end':
            align = 1
            break

        case 'space-between':

            if (gutterCount === 0) {

                align = .5

            } else {

                extraGutter = freeSpace / gutterCount
            }
            break

        case 'space-evenly':

            if (gutterCount === 0) {

                align = .5

            } else {

                extraGutter = freeSpace / (gutterCount + 2)
                extraPaddingStart = extraGutter
            }
            break

        case 'space-around':

            if (gutterCount === 0) {

                align = .5

            } else {

                extraGutter = freeSpace / (gutterCount + 1)
                extraPaddingStart = extraGutter / 2
            }
            break
    }

    return [align, extraGutter, extraPaddingStart]
}
