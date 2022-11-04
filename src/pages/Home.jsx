import React from 'react'
import SessionSearch from '../components/sessions/SessionSearch'
import SessionResults from '../components/sessions/SessionResults'

function Home() {
  return (
    <div>
        <SessionSearch />
        <SessionResults />
    </div>
  )
}

export default Home