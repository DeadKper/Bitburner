import { NS } from 'defs/NetscriptDefinitions'

export async function main(ns: NS): Promise<void> {
    const target = ns.args[0] as string
    const wait = ns.args[1] as number
    let times = ns.args[2] as number
    if (wait)
        await ns.sleep(wait)
    if (!times || Number.isNaN(times))
        times = 1
    while(times-- > 0)
        await ns.grow(target)
}