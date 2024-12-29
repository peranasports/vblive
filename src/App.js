import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { VBLiveAPIProvider } from "./context/VBLiveAPI/VBLiveAPIContext";
import { AlertProvider } from "./context/Alert/AlertContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { Theme } from "react-daisyui";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Session from "./pages/Session";
import Input from "./pages/Input";
import NotFound from "./pages/NotFound";
import HittingChartReport from "./components/matches/HittingChartReport";
import VideoAnalysis from "./components/matches/VideoAnalysis";
import Playlist from "./components/playlist/Playlist";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/react";
import MatchesList from "./pages/MatchesList";
import MultiSessions from "./pages/MultiSessions";
import PlaylistsList from "./pages/PlaylistsList";
import Live from "./pages/Live";
import MainPage from "./pages/MainPage";
import { useState } from "react";

function App() {
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "garden"
  );

  return (
    <Theme dataTheme={currentTheme}>
      <CookiesProvider>
        <VBLiveAPIProvider>
          <AlertProvider>
            <Router>
              <div
                className="flex flex-col h-screen"
                style={{ paddingBottom: "0px" }}
              >
                {/* <Navbar /> */}
                <main className="mx-2 px-2 pb-2">
                  <Analytics />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/live" element={<Live />} />
                    <Route path="/mainpage" element={<MainPage />} />
                    <Route path="/matcheslist" element={<MatchesList />} />
                    <Route path="/playlistslist" element={<PlaylistsList />} />
                    <Route
                      path="/forgotpassword"
                      element={<ForgotPassword />}
                    />
                    <Route path="/about" element={<About />} />
                    <Route path="/session" element={<Session />} />
                    <Route path="/multisessions" element={<MultiSessions />} />
                    <Route path="/playlist" element={<Playlist />} />
                    <Route path="/videoanalysis" element={<VideoAnalysis />} />
                    <Route
                      path="/hittingchartreport"
                      element={<HittingChartReport />}
                    />
                    <Route path="/input" element={<Input />} />
                    <Route path="/*" element={<NotFound />} />
                  </Routes>
                </main>
                {/* <Footer /> */}
              </div>
            </Router>
          </AlertProvider>
          <ToastContainer />
        </VBLiveAPIProvider>
      </CookiesProvider>
    </Theme>
  );
}

export default App;
