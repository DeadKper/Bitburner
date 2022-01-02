import { Action, ActionType, DictMap, Script, ScriptType } from 'defs/Custom'
import { NS } from 'defs/NetscriptDefinitions'

export const RESERVED_RAM = 3 + 6.3
export const ALT_SERVER = 'foodnstuff'
export const MAIN_PORT = 1
export const HACK_SEC_INC = 0.002
export const GROW_SEC_INC = 0.004
export const WEAKEN_SEC_DEC = 0.05
export const SCRIPTS: DictMap<ScriptType, Script> = {
    nuke: { file: '/scripts/auto/nuke.js' },
    hack: { file: '/scripts/auto/hack.js' },
}
export const SCRIPTS_IGNORE = []
export const ACTIONS: DictMap<ActionType, Action> = {
    hack: { file: '/scripts/actions/hack.js', ram: 1.7, mult: 0.25, flat: 2 },
    grow: { file: '/scripts/actions/grow.js', ram: 1.75, mult: 0.8, flat: 1 },
    weaken: { file: '/scripts/actions/weaken.js', ram: 1.75, mult: 1, flat: 0 },
}

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')
}