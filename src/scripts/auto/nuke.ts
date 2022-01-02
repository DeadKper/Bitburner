import { NS } from 'defs/NetscriptDefinitions'
import { ALT_SERVER, MAIN_PORT } from '/scripts/library/constants.js'
import { getAvailableHacks, getNukable, getServers } from '/scripts/library/util.js'

export async function main(ns: NS): Promise<void> {
    const hacks = getAvailableHacks(ns)
    const servers = getServers(ns)
    const actions = ns.ls('home', '/actions')
    const nukable = getNukable(ns, servers)
    for (const server of nukable) {
        for (const hack of hacks)
            hack.exec(ns, server)
        
        ns.nuke(server)
        await ns.scp(actions, 'home', server)
        if (server == ALT_SERVER)
            await ns.scp(ns.ls('home', '/scripts'), 'home', server)
    }

    ns.clearPort(MAIN_PORT) // In case I decide to run a script while main is running
    ns.writePort(MAIN_PORT, 5 * 60 * 1000)
}