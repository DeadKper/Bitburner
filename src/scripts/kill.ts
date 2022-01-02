import { NS } from 'defs/NetscriptDefinitions'
import { getRooted, getServers } from '/scripts/library/util.js'

export async function main(ns: NS): Promise<void> {
    const host = ns.getHostname()
    const rooted = getRooted(ns, getServers)
    for (const server of rooted) {
        if (server == host) continue
        ns.killall(server)
    }
    ns.killall(host)
}