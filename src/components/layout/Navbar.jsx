import VBLiveLogo from "../assets/VBLive_Logo_Horizontal.png";
import PSLogo from "../assets/PeranaSportsLogoLong.png";
import { Link, useNavigate } from "react-router-dom";
import PropsType from "prop-types";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import ThemePicker from "./ThemePicker";

function Navbar({ title }) {
  const navigate = useNavigate();
  const { loggedIn, currentUser, checkingStatus } = useAuthStatus();

  const doLogout = () => {
    var auth = getAuth();
    auth.signOut();
    navigate("/signin");
  };

  const doThemes = () => {
    document.getElementById("my-modal-themes").checked = true;
  };

  const doThemeChange = (th) => {
    document.getElementById("my-modal-themes").checked = false;
  };

  const doMatches = () => {
    const st = { liveMatches: [], userEmail: currentUser.email };
    navigate("/matcheslist", { state: st });
  };

  const doPlaylists = () => {
    const st = { userEmail: currentUser.email };
    navigate("/playlistslist", { state: st });
  };

  const getID = () => {
    return currentUser.email;
  };

  useEffect(() => {}, [loggedIn]);

  return (
    <>
      <div className="shadow-lg bg-neutral text-neutral-content">
        <div className="flex mx-4 h-14">
          <div className="flex px-2 space-x-2">
            <img className="mt-2 h-10 w-44 min-w-44 max-w-44" alt="" src={VBLiveLogo} />
          </div>
          <div className="flex-col px2 mx-2 w-full">
            <div className="flex justify-end">
              <Link to="/live" className="btn btn-ghost btn-sm rounded-btn">
                Live
              </Link>
              <Link to="/input" className="btn btn-ghost btn-sm rounded-btn">
                Import
              </Link>
              <button
                className="btn btn-ghost btn-sm rounded-btn"
                onClick={() => doMatches()}
              >
                Matches
              </button>
              <button
                className="btn btn-ghost btn-sm rounded-btn"
                onClick={() => doPlaylists()}
              >
                Play Lists
              </button>
              <button
                className="btn btn-ghost btn-sm rounded-btn"
                onClick={() => doThemes()}
              >
                Themes
              </button>
              <Link to="/about" className="btn btn-ghost btn-sm rounded-btn">
                About
              </Link>
              {currentUser ? (
                <button
                className="btn btn-ghost btn-sm rounded-btn"
                  onClick={doLogout}
                >
                  Log out
                </button>
              ) : (
                <></>
              )}
            </div>
            {currentUser === null ? (
              <></>
            ) : (
              <div className="flex justify-end">
                <p className="mr-4 text-sm">{getID()}</p>
              </div>
            )}
          </div>
          <img className="pt-1 h-12" alt="PSLogo" src={PSLogo} />

          {/* <div className='flex-1 px2 mx-2'>
                <div className='flex justify-end'>
                    <Link to='/' className='btn btn-ghost btn-sm rounded-btn'>
                        Home
                    </Link>
                    <Link to='/about' className='btn btn-ghost btn-sm rounded-btn'>
                        About
                    </Link>
                </div>
            </div> */}
        </div>
      </div>
      <input type="checkbox" id="my-modal-themes" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box rounded-none sm:w-9/12 w-8/10 max-w-5xl h-34">
          <ThemePicker onThemeChange={(th) => doThemeChange(th)} />
          <div className="flex gap-2 justify-end">
            <div className="modal-action">
              <label htmlFor="my-modal-themes" className="btn-ps-primary">
                Close
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Navbar.defaultProps = {
  title: "Volleyball Live",
};

Navbar.PropsType = {
  title: PropsType.string,
};
export default Navbar;
