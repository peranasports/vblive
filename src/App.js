import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { VBLiveAPIProvider } from "./context/VBLiveAPI/VBLiveAPIContext";
import { AlertProvider } from "./context/Alert/AlertContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Session from "./pages/Session";
import NotFound from "./pages/NotFound";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <CookiesProvider>
      <VBLiveAPIProvider>
        <AlertProvider>
          <Router>
            <div className="flex flex-col h-screen">
              <Navbar />
              <main className="container mx-auto px-3 pb-12">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/session" element={<Session />} />
                  {/* <Route path='/about' element={<About />} />
            <Route path='/player/:playerId' element={<Player />} />
            <Route path='/filtersanalysis/:matchIds/:playerId' element={<FiltersAnalysis />} />
            <Route path='/playlist/:playerId' element={<Playlist />} />
            <Route path='/filtersvideo' element={<FiltersVideo />} />
            <Route path='/notfound' element={<NotFound />} /> */}
                  <Route path="/*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
          <ToastContainer />
        </AlertProvider>
      </VBLiveAPIProvider>
    </CookiesProvider>
  );
}

export default App;
