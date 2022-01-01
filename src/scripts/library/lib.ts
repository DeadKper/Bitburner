import { Dict, ServerTag } from 'defs/Custom'
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

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')
}