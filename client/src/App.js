import { Routes , Route} from 'react-router-dom'
import './App.css';
import Roompage from './pages/Room'
import Homepage from './pages/Home'
import { PeerProvider } from './Providers/Peer'
import { SocketProvider } from './Providers/Socket'


function App() {
  return (
    <div className="App">
       <SocketProvider>
        <PeerProvider>
      <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/room/:roomId" element={<Roompage />} />
      </Routes>
      </PeerProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
