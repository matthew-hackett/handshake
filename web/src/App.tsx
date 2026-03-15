import { useState } from 'react'
import './App.css'
import Connected from './components/Connected'
import Pending from './components/Pending'
import Wrapper from './components/Wrapper';
import {BrowserView, MobileView} from 'react-device-detect';

function App() {
    const [channel, setChannel] = useState<RTCDataChannel | null>(null);

    return <>
        <Wrapper>
            {
                channel
                    ? <Connected channel={channel} />
                    : <Pending onConnected={setChannel} />
            }
        </Wrapper>
    </>
    
}

export default App
