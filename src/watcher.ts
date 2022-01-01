import { NS, ProcessInfo } from 'defs/NetscriptDefinitions'

export async function main(ns: NS): Promise<void> {
    const hashes: any = {}

    const files = ns.ls('home', '.js')
    for (const file of files) {
        const contents = ns.read(file)
        hashes[file] = getHash(contents)
    }

    while (true) {
        const files = ns.ls('home', '.js')

        for (const file of files) {
            const contents = ns.read(file)
            const hash = getHash(contents)

            if (hash != hashes[file]) {
                ns.tprint(`INFO: Detected change in ${file}`)

                const processes = ns.ps().filter((p: ProcessInfo) => {
                    return p.filename == file
                })

                for (const process of processes) {
                    ns.tprint(`INFO: Restarting ${process.filename} ${process.args} -t ${process.threads}`)
                    if (process.filename != ns.getScriptName()) {
                        ns.kill(process.pid, ns.getHostname())
                        ns.run(process.filename, process.threads, ...process.args)
                    } else {
                        ns.spawn(process.filename, process.threads, ...process.args)
                    }
                }

                hashes[file] = hash
            }
        }

        await ns.sleep(1000)
    }
}

function getHash(input: string): number {
    let hash = 0, i: number, chr: number
    if (input.length === 0) return hash
    for (i = 0; i < input.length; i++) {
        chr = input.charCodeAt(i)
        hash = ((hash << 5) - hash) + chr
        hash |= 0 // Convert to 32bit integer
    }
    return hash
}