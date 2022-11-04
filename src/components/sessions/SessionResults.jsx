import { useContext } from 'react'
import Spinner from '../layout/Spinner'
import SessionItem from '../sessions/SessionItem'
import VBLiveAPIContext from '../../context/VBLiveAPI/VBLiveAPIContext'

function SessionResults() {
  const { sessions, loading } = useContext(VBLiveAPIContext)

  if (!loading) {
    console.log(sessions)
    return (
      <div className='grid grid-cols-1 gap-8 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2'>
        {sessions.map((session) => (
          <SessionItem key={session.id} session={session} />
        ))}
      </div>
    )
  } else {
    return <Spinner />
  }
}

export default SessionResults
