import VBLiveLogo from "../assets/logo512.png";
import { Link, useNavigate } from "react-router-dom";
import PropsType from "prop-types";
import { useAuthStatus } from "../hooks/useAuthStatus";
import { useEffect } from "react";
import { getAuth } from "firebase/auth";

function Navbar({ title }) {
  const navigate = useNavigate();
  const { loggedIn, currentUser, checkingStatus } = useAuthStatus();

  const doLogout = () => {
    var auth = getAuth();
    auth.signOut();
    navigate("/signin");
  };

  const doMatches = () => {
    navigate("/matcheslist", { state: { currentUser: currentUser } });
  };

  const getID = () => {
    return currentUser.email;
  };

  useEffect(() => {}, [loggedIn]);

  return (
    <nav className="navbar shadow-lg bg-neutral text-neutral-content">
      <div className="container mx-auto h-[2px]">
        <div className="flex px-2 mx-2 space-x-4">
          <img className="pt-1 h-8 w-8" alt="" src={VBLiveLogo} />
          <Link to="/" className="text-xl pt-1 font-bold align-middle">
            {title}
          </Link>
        </div>
        <div className="flex-1 px2 mx-2">
          <div className="flex justify-end mt-4">
            <Link to="/" className="btn btn-ghost btn-sm rounded-btn">
              Home
            </Link>
            <button
              className="btn btn-ghost btn-sm rounded-btn"
              onClick={() => doMatches()}
            >
              Matches
            </button>
            <Link to="/about" className="btn btn-ghost btn-sm rounded-btn">
              About
            </Link>
          </div>
          {currentUser === null ? (
            <></>
          ) : (
            <div className="flex justify-end">
              <p className="mt-1 mr-4 text-md">{getID()}</p>
              <button
                className="logoutButton mb-4 btn btn-sm"
                onClick={doLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>

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
    </nav>
  );
}

Navbar.defaultProps = {
  title: "Volleyball Live",
};

Navbar.PropsType = {
  title: PropsType.string,
};
export default Navbar;
