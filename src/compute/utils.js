
export const sizeIsProportional = size => typeof size === 'string' && size.endsWith('w')

export const sizeIsRelative = size => typeof size === 'string' && size.endsWith('%')
