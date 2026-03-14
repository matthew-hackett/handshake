import { useState } from 'react'
import './App.css'
import Connected from './components/Connected'
import Pending from './components/Pending'

function App() {
    const [channel, setChannel] = useState<RTCDataChannel | null>(null);

    return channel
        ? <Connected channel={channel} />
        : <Pending onConnected={setChannel} />;
}

export default App
