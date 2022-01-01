import { Dict } from 'defs/Custom'
import { NS } from 'defs/NetscriptDefinitions'
import { SCRIPTS, MAIN_PORT, ALT_SERVER } from '/scripts/library/constants.js'

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL')
    ns.clearLog()
    const host = !ns.args[0] ? 'home' : ns.args[0] as string
    const waitTime = 250
    await ns.sleep(waitTime)
    
    const waitQueue: Dict<number> = Object()
    for (const script in SCRIPTS) {
        ns.clearPort(MAIN_PORT)
        waitQueue[script] = 0
    }

    ns.exec(SCRIPTS['nuke'].file, 'home', 1)

    await ns.sleep(waitTime)

    if (ns.getServerMaxRam('home') < 16 && host === 'home') {
        ns.exec('/scripts/main.js', ALT_SERVER, 1, ALT_SERVER)
        return
    }

    let wait = 0, scriptSleep = 0, initLoop = 0, runTime = 0, endTime = 0
    while (true) {
        initLoop = Date.now()
        for (const script in SCRIPTS) {
            if (waitQueue[script] <= initLoop) {
                ns.exec(SCRIPTS[script].file, host, 1, host)
                await ns.sleep(waitTime)
                while((scriptSleep = ns.readPort(MAIN_PORT)) == "NULL PORT DATA")
                    await ns.sleep(waitTime)

                endTime = Date.now()
                runTime = endTime - initLoop
                wait = scriptSleep - runTime
                waitQueue[script] = wait

                ns.print(`Executed ${script} (${runTime}/${wait} millis)`)
            }
        }

        for (const script in waitQueue)
            if (waitQueue[script] < wait)
                wait = waitQueue[script]
            
        if (wait < waitTime) 
            wait = waitTime

        await ns.sleep(wait)
    }
}