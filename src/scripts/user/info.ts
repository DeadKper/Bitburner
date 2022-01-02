import { NS } from 'defs/NetscriptDefinitions'
import { getNukable, getOptimalApprox, getPurchased, getRooted, getServers } from '/scripts/library/util.js'
import * as nt from '/scripts/library/notns.js'

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
            target = getOptimalApprox(ns, getRooted(ns, servers))
        default:
            money = ns.getServerMoneyAvailable(target)
            maxRam = ns.getServerMaxRam(target)
            useRam = ns.getServerUsedRam(target)
            ns.tprint(`\nPrinting info for server: '${target}'\n` +
                `Rooted: ${ns.hasRootAccess(target)}\n` +
                `Money: $${nt.round(money)}, ${nt.round(money / 
                    ns.getServerMaxMoney(target) * 100, 2)}%\n` +
                `Growth: ${ns.getServerGrowth(target)}\n` +
                `Security: ${nt.round(ns.getServerSecurityLevel(target), 3)}/`+
                    `${ns.getServerMinSecurityLevel(target)}\n` +
                `HackLevel: ${ns.getServerRequiredHackingLevel(target)}\n` +
                `Ram: ${useRam}/${maxRam}GB, ${nt.round((maxRam - useRam) / maxRam * 100, 2)}%`)
    }
}