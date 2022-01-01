import { Action, Dict, Script } from 'defs/Custom'
import { NS } from 'defs/NetscriptDefinitions'

export const RESERVED_RAM = 2.95 + 7
export const ALT_SERVER = 'foodnstuff'
export const MAIN_PORT = 1
export const SCRIPTS: Dict<Script> = {
    nuke: { file: '/scripts/auto/nuke.js' },
}
export const SCRIPTS_IGNORE = []
export const ACTIONS: Dict<Action> = {
    hack: { file: '/scripts/actions/hack.js', ram: 1.7, mult: 0.25},
    grow: { file: '/scripts/actions/grow.js', ram: 1.75, mult: 0.8 },
    weaken: { file: '/scripts/actions/weaken.js', ram: 1.75, mult: 0.8},
}

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')
}