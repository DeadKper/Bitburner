import { NS } from 'defs/NetscriptDefinitions'

export async function main(ns: NS): Promise<void> {
    function recursiveScan(parent: string, server: string, target: string, route: string[]): boolean {
        const children = ns.scan(server)
        for (const child of children) {
            if (parent == child) {
                continue
            }
            if (child == target) {
                route.unshift(child)
                route.unshift(server)
                return true
            }
    
            if (recursiveScan(server, child, target, route)) {
                route.unshift(server)
                return true
            }
        }
        return false
    }

    const args = ns.flags([["help", false]])
    const route: string[] = []
    const server = args._[0]
    if (!server || args.help) {
        ns.tprint("This script helps you find a server on the network and shows you the path to get to it.")
        ns.tprint(`Usage: run ${ns.getScriptName()} SERVER`)
        ns.tprint("Example:")
        ns.tprint(`> run ${ns.getScriptName()} n00dles`)
        return
    }

    if (!recursiveScan('', 'home', server, route)) {
        ns.tprint(`${server} not found`)
        return
    }
    let string = '\n'
    for (const i in route) {
        const extra = +i > 0 ? "└ " : ""
        string += `${" ".repeat(+i)}${extra}${route[i]}\n`
    }
    ns.tprint(string)
}