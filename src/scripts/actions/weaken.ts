import { NS } from 'defs/NetscriptDefinitions'

export async function main(ns: NS): Promise<void> {
    await loop(ns, ns.weaken)
}

export async function loop(ns: NS, func: (v: string) => Promise<number>): Promise<void> {
    function getNumber(value: string | number | boolean, defaultVal: number): number {
        return !Number.isNaN(value) && value > 0 ? value as number : defaultVal 
    }
    
    const target = ns.args[0] as string
    const wait = getNumber(ns.args[1], 0)
    let times = getNumber(ns.args[2], 1)

    while(times-- > 0) {
        await ns.sleep(wait)
        await func(target)
    }
}