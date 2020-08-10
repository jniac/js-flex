
export const stringIsPureNumber = string => /^(\d+(\.\d*)?|\.\d+)$/.test(string)

export const sizeIsProportional = size =>
    typeof size === 'string' && size.endsWith('w')

export const sizeIsRelative = size =>
    typeof size === 'string' && size.endsWith('%')

export const sizeIsOppositeRelative = size =>
    typeof size === 'string' && size.endsWith('op')
