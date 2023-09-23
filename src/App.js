import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { VBLiveAPIProvider } from "./context/VBLiveAPI/VBLiveAPIContext";
import { AlertProvider } from "./context/Alert/AlertContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Session from "./pages/Session";
import Input from "./pages/Input";
import NotFound from "./pages/NotFound";
import Playlist from "./components/playlist/Playlist";
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
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/forgotpassword" element={<ForgotPassword />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/session" element={<Session />} />
                  <Route path="/playlist" element={<Playlist />} />
                  <Route path="/input" element={<Input />} />
                  <Route path="/*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AlertProvider>
        <ToastContainer />
      </VBLiveAPIProvider>
    </CookiesProvider>
  );
}

export default App;
