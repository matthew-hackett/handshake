import type { HandshakeData } from "../domain/connect.ts";

export type Sample = {
    time: number
    x: number
    y: number
    z: number
}

export type Snippet = Sample[]

export function snippetToPacketData(s: Snippet): HandshakeData {
    return {
        type: "handshake-data",
        samples: s.map(({ x, y, z }) => ({ x, y, z })),
    }
}

export function makeSnippetDetector(threshold: number, snippetDuration = 1000) {
    let recording = false
    let snippet: Snippet = []
    let startTime = 0

    return function processSample(x: number, y: number, z: number): Snippet | null {
        const now = Date.now()
        const mag = Math.sqrt(x * x + y * y + z * z)

        if (!recording && mag > threshold) {
            recording = true
            snippet = []
            startTime = now
        }

        if (recording) {
            snippet.push({ time: now, x, y, z })

            if (now - startTime >= snippetDuration) {
                recording = false
                const captured = snippet
                snippet = []
                return captured
            }
        }

        return null
    }
}
