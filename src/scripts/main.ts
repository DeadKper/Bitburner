import { Dict, ScriptType } from 'defs/Custom'
import { NS } from 'defs/NetscriptDefinitions'
import { SCRIPTS, MAIN_PORT, ALT_SERVER } from '/scripts/library/constants.js'
import * as nt from '/scripts/library/notns.js'

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')
    ns.clearLog()
    const host = ns.getHostname()
    const waitTime = 250
    await ns.sleep(waitTime)
    ns.clearPort(MAIN_PORT)

    const waitQueue: Dict<number> = Object()
    for (const script in SCRIPTS)
        waitQueue[script] = 0

    let wait: number, scriptSleep: number, startTime = Date.now(), runTime: number

    ns.exec(SCRIPTS['nuke'].file, host, 1)
    while((scriptSleep = ns.readPort(MAIN_PORT)) == "NULL PORT DATA")
        await ns.sleep(waitTime)
    
    runTime = Date.now() - startTime
    wait = nt.round(startTime + scriptSleep - runTime, 'up')
    waitQueue['nuke'] = wait

    ns.print(`Executed 'nuke' (${runTime}/${wait - startTime} millis)`)

    if (ns.getServerMaxRam('home') < 16 && host == 'home') {
        ns.print(
              `Not enougth ram on 'home' (${ns.getServerMaxRam('home')}/16)`
            + `\nChanging to: ${ALT_SERVER}`
        )
        ns.exec('/scripts/main.js', ALT_SERVER, 1)
        return
    }

    while (true) {
        startTime = Date.now()
        for (const script in SCRIPTS) {
            if (waitQueue[script] > startTime)
                continue

            ns.exec(SCRIPTS[script as ScriptType].file, host, 1, host)
            await ns.sleep(waitTime)
            while((scriptSleep = ns.readPort(MAIN_PORT)) == "NULL PORT DATA")
                await ns.sleep(waitTime)

            runTime = Date.now() - startTime
            wait = nt.round(startTime + scriptSleep - runTime, 'up')
            waitQueue[script] = wait

            ns.print(`Executed '${script}' (${runTime}/${wait - startTime} millis)`)
        }

        for (const script in waitQueue)
            if (waitQueue[script] < wait)
                wait = waitQueue[script]

        await ns.sleep(startTime + waitTime < wait ? waitTime : wait - startTime)
    }
}