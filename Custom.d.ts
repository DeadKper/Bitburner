import type { NS } from 'defs/NetscriptDefinitions'

// Generics
export interface Dict<T> { 
    [key: string]: T;
}

export type DictMapND<K extends number | string,V> = {
    [key in K]?: V
}

export type DictMap<K extends number | string,V> = DictMapND<K,V> & {
    [key in K]: V
}

// Interfaces
export interface Hack {
    file: string;
    exec: (ns: NS, target: string) => void;
}

export interface Script {
    file: string;
}

export interface Action {
    file: string;
    ram: number;
    mult: number;
    flat: number;
}

export interface Run {
    action: ActionType;
    server: string;
    threads: number;
    sleep: number;
    runType: string;
    run: number;
}

export interface HackConstants {
    host: string;
    target: string;
    servers: Dict<number>;
    runSleep: number;
    weakenTime: number;
}

// Types
export type ScriptType = 'nuke' | 'hack'

export type ActionType = 'hack' | 'grow' | 'weaken'

export type ServerTag = 'home' | 'rooted' | 'owned' | 'optimal' | 'nukable'

export type RoundType = 'ceil' | 'up' | 'down' | 'floor' | 'normal'