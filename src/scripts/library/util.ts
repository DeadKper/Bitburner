import { NS } from 'defs/NetscriptDefinitions'
import { Hack } from 'defs/Custom'

export const hacks: Hack[] = [
    { file: 'BruteSSH.exe', exec: (ns, target) => ns.brutessh(target) },
    { file: 'FTPCrack.exe', exec: (ns, target) => ns.ftpcrack(target) },
    { file: 'relaySMTP.exe', exec: (ns, target) => ns.relaysmtp(target) },
    { file: 'HTTPWorm.exe', exec: (ns, target) => ns.httpworm(target) },
    { file: 'SQLInject.exe', exec: (ns, target) => ns.sqlinject(target) },
]

export function getAvailableHacks(ns: NS): Hack[] {
    return hacks.filter(({ file }) => ns.fileExists(file, 'home'))
}

export function getRooted(ns: NS, servers: string[]): string[] {
    const array: string[] = []
    for (const server of servers) {
        if (ns.hasRootAccess(server))
            array.push(server)
    }

    return array
}

export function getNukable(ns: NS, servers: string[]): string[] {
    const availableHacks = getAvailableHacks(ns) 
    const array: string[] = []
    for (const server of servers) {
        if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()
                && ns.getServerNumPortsRequired(server) <= availableHacks.length)
            array.push(server)
    }

    return array
}

export function getPurchased(ns: NS, servers: string[]): string[] {
    const array: string[] = []
    for (const server of servers) {
        if (server === 'home')
            continue
        if (ns.getServerRequiredHackingLevel(server) == 1
                && ns.getServerBaseSecurityLevel(server) == 1
                && ns.getServerNumPortsRequired(server) == 5)
            array.push(server)
    }

    return array
}

export function getOptimal(ns: NS, servers: string[]): string {
    let optimalServer = "n00dles", optimalValue = 0, currentValue: number
    for (const server of servers) {
        currentValue = ns.getServerMaxMoney(server) / (
            ns.getWeakenTime(server)
            / ns.getServerSecurityLevel(server)
            * ns.getServerMinSecurityLevel(server))
            * ns.getServerGrowth(server)
        if (currentValue >= optimalValue) {
            optimalValue = currentValue
            optimalServer = server
        }
    }

    return optimalServer
}

export function getServers(ns: NS): string[] {
    const queue = [ 'home' ], discovered = [ 'home' ]
 
    while (queue.length) {
        const parent = ns.scan(queue.shift())
        for (const child of parent) {
            if (discovered.includes(child)) // Child has already been seen, ignore it
                continue

            queue.push(child) // Push new server to the queue to scan later
            discovered.push(child) // Create empty tag array for new server
        }
    }

    return discovered
}

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')
    ns.print(`util ran`)
}