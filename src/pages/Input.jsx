import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SessionSearch from "../components/sessions/SessionSearch";
import SessionResults from "../components/sessions/SessionResults";
import { useAuthStatus } from "../components/hooks/useAuthStatus";

function Input() {
  const navigate = useNavigate();
  const dvRef = useRef();
  const { currentUser } = useAuthStatus();
  const [dvwFileName, setDvwFileName] = useState(null);
  const [dvwFileData, setDvwFileData] = useState(null);
  const psRef = useRef();
  const [psvbFileName, setPsvbFileName] = useState(null);
  const [psvbFileData, setPsvbFileData] = useState(null);
  const plRef = useRef();
  const [playlistFileName, setPlaylistFileName] = useState(null);
  const [playlistFileData, setPlaylistFileData] = useState(null);

  const handleDVWFile = (event) => {
    var url = URL.createObjectURL(event.target.files[0]);
    setDvwFileName(event.target.files[0].name);
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      setDvwFileData(e.target.result);
      const st = {
        dvwFileData: e.target.result,
        filename: event.target.files[0],
      };
      navigate("/session", { state: st });
    };
  };

  const handlePSVBFile = (event) => {
    var url = URL.createObjectURL(event.target.files[0]);
    setPsvbFileName(event.target.files[0].name);
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      setPsvbFileData(e.target.result);
      const st = {
        psvbFileData: e.target.result,
        filename: event.target.files[0],
      };
      navigate("/session", { state: st });
    };
  };

  const handlePlaylistFile = (event) => {
    var url = URL.createObjectURL(event.target.files[0]);
    setPlaylistFileName(event.target.files[0].name);
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      setPlaylistFileData(e.target.result);
      const st = {
        playlistFileData: e.target.result,
        filename: event.target.files[0].name,
        playlist: null,
        currentUser: currentUser.email,
      };
      navigate("/playlist", { state: st });
    };
  };

  return (
    <div>
      <SessionSearch />
      <div className="flex my-4">
        <input
          type="file"
          id="selectedDVWFile"
          ref={dvRef}
          style={{ display: "none" }}
          onChange={handleDVWFile}
          onClick={(event) => {
            event.target.value = null;
          }}
        />
        <input
          type="button"
          className="btn btn-sm w-60"
          value="Load DVW file..."
          onClick={() => document.getElementById("selectedDVWFile").click()}
        />
        <label className="label ml-4">
          <span className="label-text">
            {dvwFileName === null
              ? "load a local DataVolley file"
              : dvwFileName}
          </span>
        </label>
      </div>

      <div className="flex my-4">
        <input
          type="file"
          id="selectedPSVBFile"
          ref={psRef}
          style={{ display: "none" }}
          onChange={handlePSVBFile}
          onClick={(event) => {
            event.target.value = null;
          }}
        />
        <input
          type="button"
          className="btn btn-sm w-60"
          value="Load PSVB file..."
          onClick={() => document.getElementById("selectedPSVBFile").click()}
        />
        <label className="label ml-4">
          <span className="label-text">
            {psvbFileName === null ? "load a local VBStats file" : psvbFileName}
          </span>
        </label>
      </div>

      <div className="flex my-4">
        <input
          type="file"
          id="selectedPlaylistFile"
          ref={plRef}
          style={{ display: "none" }}
          onChange={handlePlaylistFile}
          onClick={(event) => {
            event.target.value = null;
          }}
        />
        <input
          type="button"
          className="btn btn-sm w-60"
          value="Load play list file..."
          onClick={() =>
            document.getElementById("selectedPlaylistFile").click()
          }
        />
        <label className="label ml-4">
          <span className="label-text">
            {playlistFileName === null ? "load a play list" : playlistFileName}
          </span>
        </label>
      </div>

      <SessionResults />
    </div>
  );
}

export default Input;
