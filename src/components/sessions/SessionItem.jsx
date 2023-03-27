import { Link, useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

function SessionItem({ session }) {
  const navigate = useNavigate()
  const { id, description, sessionDateString } = session

  const doSession = () =>
  {
    const st = {
      sessionId: id,
      dvwFileData: null,
    };
    navigate("/session", { state: st });
  }

  return (
    <div className='card shadow-md compact side bg-base-100'>
      <div className='flex-row items-center space-x-4 card-body'>
        <div>
          <div className='avatar'>
            <div className='shadow w-14 h-14'>
              <img src={require(`../assets/logo64.png`)} alt='Profile' />
            </div>
          </div>
        </div>
        <div>
        <div>
            <h2 className='card-title' onClick={() => doSession()}>{description.toUpperCase()}</h2>
          </div>

          {/* <Link
            className='text-base-content'
            to={`/session/${id}`}
          >
            <h2 className='card-title'>{description.toUpperCase()}</h2>
          </Link> */}
        </div>
      </div>
    </div>
  )
}

SessionItem.propTypes = {
  session: PropTypes.object.isRequired,
}

export default SessionItem
