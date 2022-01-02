import { Action, ActionType, Dict, HackConstants, Run, DictMapND, DictMap } from 'defs/Custom'
import { NS } from 'defs/NetscriptDefinitions'
import { getOptimalApprox, getRooted, getServers } from '/scripts/library/util.js'
import { ACTIONS, GROW_SEC_INC, HACK_SEC_INC, MAIN_PORT, RESERVED_RAM, WEAKEN_SEC_DEC } from '/scripts/library/constants.js'
import * as nt from '/scripts/library/notns.js'

let _hack_id = 0 // Use _hack_id in future executions of this script
function id(): string {
    if (++_hack_id > 999999)
    _hack_id = 1
    return `${_hack_id}`.padStart(6, '0')
}

// eslint-disable-next-line prefer-const
let _hack_rerun = false // Use _hack_rerun in future executions of this script 
export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')
    ns.clearLog()
    const host = ns.args[0] as string
    const rooted = getRooted(ns, getServers)
    const target = getOptimalApprox(ns, rooted)
    const constants: HackConstants = {
        host: host,
        target: target,
        servers: getRamArray(ns, rooted, host),
        runSleep: 300,
        weakenTime: nt.round(ns.getWeakenTime(target), 'up'),
    }
    let wait = 0
    wait += await weaken(ns, constants, wait)
    wait += await grow(ns, constants, wait)
    wait += await hack(ns, constants, wait)

    const scriptSleep = constants.weakenTime + 2000
    printSection(ns, 'Main',
          `\nTarget: ${constants.target}`
        + `\nServers: ${Object.keys(constants.servers).length}`
        + `\nRun Sleep: ${constants.runSleep}`
        + `\nWeaken Time: ${constants.weakenTime}`
        + `\nWait Time: ${wait}`
        + `\nScript Sleep: ${scriptSleep}\n`
    )

    ns.clearPort(MAIN_PORT) // In case I decide to run a script while main is running
    ns.writePort(MAIN_PORT, scriptSleep)
}

function getSleep(constants: HackConstants, actionName: ActionType): number {
    const { weakenTime, runSleep } = constants
    const action = ACTIONS[actionName]
    return nt.round(nt.round(weakenTime * (1 - action.mult), 'ceil') - runSleep / 3 * action.flat)
}

function printSection(ns: NS, name: string, sectionString: string): void {
    const size = 48
    const char = '-'
    const repeatStart = nt.round((size - 2 - name.length) / 2, 'floor')
    const repeatEnd = size - repeatStart - 2 - name.length
    ns.print(`\n\n\n[${char.repeat(repeatStart)} ${name} ${char.repeat(repeatEnd)}]`
        + `\n${sectionString}\n[${char.repeat(size)}]`)
}

function getRamArray(ns: NS, rooted: string[], host: string): Dict<number> {
    const dict: Dict<number> = {}
    let ram: number, sectionString = `\nHost: ${host}\n`
    for (const server of rooted) {
        ram = ns.getServerMaxRam(server)
        dict[server] = server == host ? nt.round(ram - RESERVED_RAM, 2) : ram
        sectionString += `${server}: ${dict[server]}GB\n`
    }
    printSection(ns, 'RAM', sectionString)
    return dict
}

function getRemainingThreads(constants: HackConstants, ram: number): number {
    let threads = 0
    const { servers } = constants
    for (const server in servers)
        threads += nt.round(servers[server] / ram, 'floor')

    return threads
}

async function weaken(ns: NS, constants: HackConstants, wait: number): Promise<number> {
    if (_hack_rerun)
        return 0

    const { target } = constants

    const weakenThreadsNeeded = getWeakenThreadsNeeded(
          ns.getServerSecurityLevel(target)
        - ns.getServerMinSecurityLevel(target))
    
    if (weakenThreadsNeeded == 0)
        return 0
    
    const totalThreads = getRemainingThreads(constants, ACTIONS['weaken'].ram)

    if (totalThreads < 1)
        return 0

    const prefix: DictMapND<ActionType,number> = {
        weaken: weakenThreadsNeeded < totalThreads ? weakenThreadsNeeded : totalThreads
    }

    printSection(ns, 'Weaken', 
          `\nWeaken Needed: ${weakenThreadsNeeded}`
        + `\nTotal Threads: ${totalThreads}\n`
    )

    const runs = makeRuns(ns, constants, false, prefix as DictMap<ActionType,number>, 'weaken')

    return execRuns(ns, constants, runs, wait)
}

function getWeakenThreadsNeeded(security: number): number {
    return nt.round(security / WEAKEN_SEC_DEC, 'ceil')
}

async function grow(ns: NS, constants: HackConstants, wait: number): Promise<number> {
    if (_hack_rerun)
        return 0

    const { target } = constants
    

    const growth = 1 /
        ( ns.getServerMoneyAvailable(target)
        / ns.getServerMaxMoney(target))

    const growThreadsNeeded = getGrowThreadsNeeded(ns, target, growth)
    const weakenThreadsNeeded = getWeakenThreadsNeeded(GROW_SEC_INC * growThreadsNeeded)

    if (growThreadsNeeded == 0)
        return 0

    const totalThreads = getRemainingThreads(constants, ACTIONS['grow'].ram)

    if (totalThreads < 2)
        return 0

    const times = nt.round((growThreadsNeeded + weakenThreadsNeeded) / totalThreads, 'ceil')

    let growThreads: number, weakenThreads: number

    if (times > 1) {
        const growRatio = nt.round(growThreadsNeeded / weakenThreadsNeeded, 'ceil')
        if (growRatio + 1 > totalThreads) {
            growThreads = totalThreads - 1
            weakenThreads = 1
        } else {
            weakenThreads = nt.round(totalThreads / growRatio, 'ceil')
            growThreads = totalThreads - weakenThreads
        }
    } else {
        growThreads = growThreadsNeeded
        weakenThreads = weakenThreadsNeeded
    }

    const prefix: DictMapND<ActionType,number> = {
        grow: growThreads,
        weaken: growThreads + weakenThreads,
    }

    printSection(ns, 'Grow',
          `\nGrow Needed: ${growThreadsNeeded}`
        + `\nGrow Used: ${growThreads}`
        + `\nWeaken Needed: ${weakenThreadsNeeded}`
        + `\nWeaken Used: ${weakenThreads}`
        + `\nTotal Threads: ${totalThreads}\n`
    )

    const runs = makeRuns(ns, constants, false, prefix as DictMap<ActionType,number>, 'grow')

    if (runs.length == 0)
        return 0

    return execRuns(ns, constants, runs, wait)
}

function getGrowThreadsNeeded(ns: NS, target: string, growth: number): number {
    return nt.round(ns.growthAnalyze(target, growth), 'ceil')
}

async function hack(ns: NS, constants: HackConstants, wait: number): Promise<number> {
    const { target } = constants

    const baseHackedPercent = ns.hackAnalyze(target)

    const prefix: DictMap<ActionType,number> = {
        hack: 0,
        grow: 0,
        weaken: 0,
    }

    const tryPrefix: DictMap<ActionType,number> = {
        hack: 0,
        grow: 0,
        weaken: 0,
    }

    let hackedPercent
    let hackThreads: number, growThreads: number, weakenThreads: number
    for (hackThreads = 1; (hackedPercent = hackThreads * baseHackedPercent) <= 0.5; hackThreads++) {
        growThreads = getGrowThreadsNeeded(ns, target, 1 / (1 - hackedPercent))
        weakenThreads = getWeakenThreadsNeeded(HACK_SEC_INC * hackThreads + growThreads * GROW_SEC_INC)

        tryPrefix.hack = hackThreads
        tryPrefix.grow = hackThreads + growThreads
        tryPrefix.weaken = tryPrefix.grow + weakenThreads

        if (makeRuns(ns, constants, false, tryPrefix, 'hack').length > 0)
            Object.assign(prefix, tryPrefix)
    }

    if (prefix.hack == 0)
        return 0

    printSection(ns, 'Hack',
          `\nHack Threads: ${prefix.hack}`
        + `\nGrow Threads: ${prefix.grow - prefix.hack}`
        + `\nWeaken Threads: ${prefix.weaken - prefix.grow}`
        + `\nHacked Percent: ${nt.round(baseHackedPercent * prefix.hack * 100, 2)}%`
        + `\nHacked Ammount: $${nt.round(ns.getServerMaxMoney(target) * baseHackedPercent * prefix.hack, 2)}\n`
    )

    const runs = makeRuns(ns, constants, true, prefix as DictMap<ActionType,number>, 'hack')

    if (runs.length == 0)
        return 0

    _hack_rerun = true
    return execRuns(ns, constants, runs, wait)
}

function makeRuns(ns: NS, constants: HackConstants, isHackRun: boolean, prefix: DictMap<ActionType,number>, runName: ActionType): Run[] {
    const runs: Run[] = []

    const runThreads = getRunThreads(prefix)
    if (runThreads == 0)
        return runs

    let servers: Dict<number>
    const isTryRun = !isHackRun && runName == 'hack'
    if (isTryRun)
        servers = Object.assign({}, constants.servers)
    else
        servers = constants.servers

    let runCount = 0, flag = false
    let actionName: ActionType, action: Action
    let threadCount = 0, remainingPrefix, threads

    for (const server in servers) {
        actionName = getAction(ns, threadCount, prefix) as ActionType
        action = ACTIONS[actionName]
        while(servers[server] > action.ram) {
            threads = nt.round(servers[server] / action.ram, 'down')
            remainingPrefix = prefix[actionName] as number - threadCount

            if (threads > remainingPrefix)
                threads = remainingPrefix
            
            threadCount += threads
            servers[server] = nt.round(servers[server] - threads * action.ram, 2)

            runs.push({
                action: actionName,
                threads: threads,
                server: server,
                sleep: getSleep(constants, actionName),
                runType: runName,
                run: runCount + 1,
            } as Run)

            if (threadCount == runThreads) {
                threadCount = 0
                runCount++
                if (!isHackRun) {
                    flag = true
                    break
                }
            }

            actionName = getAction(ns, threadCount, prefix) as ActionType
            action = ACTIONS[actionName]
        }

        if (flag)
            break
    }

    for (let i = runs.length - 1; i >= 0 && runs[i].run > runCount; i--)
        runs.pop()
    
    if (runs.length == 0 || isTryRun)
        return runs

    let sectionString = `\nRuns made: ${runs[runs.length - 1].run}\nPrefix used:\n`
    for (const action in prefix)
        sectionString += `- ${action}: ${prefix[action as ActionType]}\n`
    sectionString += '\nRuns:\n'
    for (const run of runs)
        sectionString += `- ${run.server}: ${run.action} * ${run.threads}\n`

    printSection(ns, `Make Runs: ${runName}`, sectionString)

    return runs
}

function getAction(ns: NS, threadCount: number, prefix: Dict<number>): ActionType | undefined {
    for (const action in prefix) {
        const threads = prefix[action]
        if (threadCount < threads)
            return action as ActionType
    }

    return undefined
}

function getRunThreads(prefix: DictMap<ActionType,number>): number {
    let runThreads = 0
    for (const key in prefix) {
        const threads = prefix[key as ActionType] as number
        if (threads > runThreads)
            runThreads = threads
    }
    return runThreads
}

function sleepTime(sleep: number, wait: number, runSleep: number, run: number, currentSleep: number): number {
    return sleep + wait + runSleep * (run - 1) - currentSleep
}

async function execRuns(ns: NS, constants: HackConstants, runs: Run[], wait: number): Promise<number> {
    const { target, runSleep } = constants
    const retryTime = nt.round(runSleep * 0.9, 'floor')
    let currentSleep = 0, init, waitResult = 0, currentRun = runs[0].run

    for (let i = 0; i < runs.length; i++) {
        const { action, server, threads, sleep, runType, run } = runs[i]
        if (run != currentRun) {
            currentRun = run
            init = Date.now()
            await ns.sleep(runSleep / 4)
            currentSleep += Date.now() - init
        }
        const sleepT = sleepTime(sleep, wait, runSleep, run, currentSleep)
        while (ns.exec(ACTIONS[action].file, server, threads, target, sleepT, runType, run, id()) == 0) {
            ns.print(
                  `${action} could not be executed on ${server} with ${threads} `
                + `threads, retrying in ${nt.round(retryTime, 'floor')} millis`)
            init = Date.now()
            await ns.sleep(retryTime)
            currentSleep += Date.now() - init
        }
        waitResult = sleepT - currentSleep
    }

    return waitResult + runSleep + wait
}