import { Dict, RoundType, ServerTag } from 'defs/Custom'
import { NS } from 'defs/NetscriptDefinitions'

export function filterServers(servers: Dict<ServerTag[]>, tag: ServerTag, includeTags?: boolean): string | string[] | Dict<ServerTag[]> {
    const filtered = Object.fromEntries(Object.entries(servers).filter(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ([k, value]) => value.includes(tag)
    )) as Dict<ServerTag[]>
    if (tag === 'optimal') 
        return Object.keys(filtered)[0]
    return includeTags ? filtered : Object.keys(filtered)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function is(value: any, type: string): boolean {
    type = type.toLocaleLowerCase()
    if (type === 'iterable')
        return is(value[Symbol.iterator], 'function')
    return Object.prototype.toString.call(value).toLocaleLowerCase() === `[object ${type}]`
}

export function mod(value: number, step: number): number {
    const valDecCount = (value.toString().split('.')[1] || '').length
    const stepDecCount = (step.toString().split('.')[1] || '').length
    const decCount = valDecCount > stepDecCount? valDecCount : stepDecCount
    const valInt = parseInt(value.toFixed(decCount).replace('.',''))
    const stepInt = parseInt(step.toFixed(decCount).replace('.',''))
    return (((valInt % stepInt) + stepInt) % stepInt) / Math.pow(10, decCount)
}

export function round(number: number, digits?: number | RoundType, type?: RoundType): number {
    let round = Math.round
    const strDigit = is(digits, 'string')
    if (strDigit || !is(type, 'undefined')) {
        if (strDigit)
            type = digits as RoundType
        digits = 0
        if (type == 'floor' || type == 'down')
            round = Math.floor
        else if (type == 'ceil' || type == 'up')
            round = Math.ceil
    }

    let negative = false
    if (is(digits, 'undefined'))
        digits = 0

    if (number < 0) {
        negative = true
        number = number * -1
    }
    const multiplicator = Math.pow(10, digits as number)
    number = +(number * multiplicator).toFixed(11)
    number = +(round(number) / multiplicator).toFixed(digits as number)
    if (negative) number = +(number * -1).toFixed(digits as number)
    return number
}

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')
}