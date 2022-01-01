import type { NS } from 'defs/NetscriptDefinitions'

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
}

export type Dict<T> = { [key: string]: T }

export type ServerTag = 'home' | 'rooted' | 'owned' | 'optimal' | 'nukable' 