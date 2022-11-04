import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { VBLiveAPIProvider } from './context/VBLiveAPI/VBLiveAPIContext'
import { AlertProvider } from './context/Alert/AlertContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Session from './pages/Session'
import NotFound from './pages/NotFound'
import MatchSummary from './components/matches/MatchSummary'

function App() {
  return (
    <VBLiveAPIProvider>
      <AlertProvider>
        <Router>
          <div className='flex flex-col h-screen'>
            <Navbar />
            <main className='container mx-auto px-3 pb-12'>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/session/:sessionId' element={<Session />} />
                {/* <Route path='/about' element={<About />} />
            <Route path='/player/:playerId' element={<Player />} />
            <Route path='/filtersanalysis/:matchIds/:playerId' element={<FiltersAnalysis />} />
            <Route path='/playlist/:playerId' element={<Playlist />} />
            <Route path='/filtersvideo' element={<FiltersVideo />} />
            <Route path='/notfound' element={<NotFound />} /> */}
                <Route path='/*' element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AlertProvider>
    </VBLiveAPIProvider>
  );
}

export default App;
