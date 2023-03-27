import React from 'react'
import { useState, useContext } from 'react'
import AlertContext from '../../context/Alert/AlertContext'
import VBLiveAPIContext from '../../context/VBLiveAPI/VBLiveAPIContext'
import { getSessionInfoForServer } from '../../context/VBLiveAPI/VBLiveAPIAction'

function SessionSearch() {
  const [text, setText] = useState('')
  const [app, setApp] = useState(0)
  const { sessions, dispatch } = useContext(VBLiveAPIContext)
  const { setAlert } = useContext(AlertContext)

  const handleChange = (e) => setText(e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (text === '') {
      setAlert('Please enter server name to search', 'error')
    } else {
      dispatch({ type: 'SET_LOADING' })
      // var appname = app === 0 ? 'VBStats' : 'DVMate'
      const sessionsData = await getSessionInfoForServer(text)
      dispatch({ type: 'GET_SESSION_INFO_FOR_SERVER', payload: sessionsData })
      // setText('')
    }
  }

  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 mb-8 gap-8'>
      <div>
        <p className='text-sm mt-4'>For live broadcast</p>
        <form onSubmit={handleSubmit}>
          <div className='form-control pt-1'>
            <div className='relative'>
              <input
                type='text'
                className='w-full pr-40 bg-gray-200 input input-lg text-black'
                placeholder='Enter DVMateLive Server Name'
                value={text}
                onChange={handleChange}
              />
              <button
                type='submit'
                className='absolute top-0 right-0 rounded-l-none w-36 btn btn-lg'>
                Go
              </button>
            </div>
          </div>
        </form>
      </div>
      {sessions.length > 0 && (
        <div className='pt-6'>
          <button
            onClick={() => dispatch({ type: 'CLEAR_SESSIONS' })}
            className='btn btn-ghost btn-lg'>
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

export default SessionSearch