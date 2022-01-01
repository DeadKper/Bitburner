import { NS } from 'defs/NetscriptDefinitions'
import { getNukable, getOptimal, getPurchased, getRooted, getServers } from '/scripts/library/util.js'

export async function main(ns: NS): Promise<void> {
    let target = ns.args[0] as string
    const servers = getServers(ns)
    let money, maxRam, useRam
    switch(target) {
        case 'rooted':
            ns.tprint(getRooted(ns, servers))
            break
        case 'nukable':
            ns.tprint(getNukable(ns, servers))
            break
        case 'purchased':
            ns.tprint(getPurchased(ns, servers))
            break
        case 'optimal':
            target = getOptimal(ns, getRooted(ns, servers))
        default:
            money = ns.getServerMoneyAvailable(target)
            maxRam = ns.getServerMaxRam(target)
            useRam = ns.getServerUsedRam(target)
            ns.tprint(`\nPrinting info for server: '${target}'\n` +
                `Rooted: ${ns.hasRootAccess(target)}\n` +
                `Money: $${Math.round(money)}, ${Math.round(money / 
                    ns.getServerMaxMoney(target) * 10000) / 100}%\n` +
                `Growth: ${ns.getServerGrowth(target)}\n` +
                `Security: ${Math.round(ns.getServerSecurityLevel(target) * 1000) / 1000}/`+
                    `${ns.getServerMinSecurityLevel(target)}\n` +
                `HackLevel: ${ns.getServerRequiredHackingLevel(target)}\n` +
                `Ram: ${useRam}/${maxRam}GB, ${Math.round((maxRam - useRam) / maxRam * 10000) / 100}%`)
    }
}