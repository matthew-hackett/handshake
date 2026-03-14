import { useState } from "react";
import { startMotion } from "../logic/motion";
import { makeSnippetDetector, snippetToPacketData } from "../logic/spike";
import { sendPacket, connect, type PacketData } from "../domain/connect";

const WS_URL = "ws://127.0.0.1:1234";

export default function Pending() {
    const [enabled, setEnabled] = useState(false);
    const [connecting, setConnecting] = useState(false);

    const handleStart = async () => {
        setConnecting(true);

        try {
            // wait for WebSocket to be ready
            await connect(WS_URL);

            // request motion permission here
            //eslint disable-next-line
            const DME = DeviceMotionEvent as any;
            if (typeof DME.requestPermission === "function") {
                const permission = await DME.requestPermission();
                if (permission !== "granted") {
                    alert("Motion permission denied");
                    setConnecting(false);
                    return;
                }
            }

            const snippetDetector = makeSnippetDetector(12);

            await startMotion(({ x, y, z }) => {
                const snippet = snippetDetector(x, y, z);
                if (snippet) {
                    const packet: PacketData = snippetToPacketData(snippet);
                    sendPacket(packet);
                }
            });

            setEnabled(true);
        } catch (err) {
            alert("Failed to connect or start motion: " + JSON.stringify(err));
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div>
            <button onClick={handleStart} disabled={enabled || connecting}>
                {enabled
                    ? "Motion Enabled"
                    : connecting
                        ? "Connecting..."
                        : "Start Motion"}
            </button>
        </div>
    );
}