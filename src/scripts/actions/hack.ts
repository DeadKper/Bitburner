import { NS } from 'defs/NetscriptDefinitions'
import { loop } from '/scripts/actions/weaken.js'

export async function main(ns: NS): Promise<void> {
    await loop(ns, ns.hack)
}