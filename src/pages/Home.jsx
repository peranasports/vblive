import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionSearch from '../components/sessions/SessionSearch'
import SessionResults from '../components/sessions/SessionResults'

function Home() {
  const navigate = useNavigate()
  const dvRef = useRef();
  const [dvwFileName, setDvwFileName] = useState(null)
  const [dvwFileData, setDvwFileData] = useState(null)

  const handleDVWFile = (event) => {
    var url = URL.createObjectURL(event.target.files[0]);
    setDvwFileName(event.target.files[0].name)
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      setDvwFileData(e.target.result);
      const st = {
        sessionId:null,
        dvwFileData:e.target.result, 
      }
      navigate('/session', { state:st })
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
                  onClick={(event)=> { event.target.value = null }}
                />
                <input
                  type="button"
                  className="btn btn-sm w-60"
                  value="Load DVW file..."
                  onClick={() =>
                    document.getElementById("selectedDVWFile").click()
                  }
                />
                <label className="label ml-4">
                  <span className="label-text">
                    {dvwFileName === null
                      ? "load a local DVW file"
                      : dvwFileName}
                  </span>
                </label>
              </div>

        <SessionResults />
    </div>
  )
}

export default Home