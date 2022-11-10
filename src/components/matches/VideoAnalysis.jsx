import { useEffect, useState, useRef } from 'react'
import { useCookies } from 'react-cookie'
import ReactPlayer from 'react-player'

function VideoAnalysis({ match }) {
    const playerRef = useRef()
    const [cookies, setCookie] = useCookies(['videofile'])
    const [videoFilePath, setVideoFilePath] = useState(null);
    const videoUrl = process.env.REACT_APP_VIDEO_SERVER_URL + match.code + '.mp4'
    // console.log('Match.jsx match', match)
    // console.log('Match.jsx videoUrl', videoUrl)

    const goToVideoPosition = (videoTime) => {
        // console.log('Match TS', videoTime)
        // console.log('Match TS', videoUrl)
        playerRef.current.seekTo(videoTime, "seconds");
    }

    const playerReady = () => {
        // if (pendingPlayItem != null) {
        //   playerRef.current.seekTo(pendingPlayItem.startLocation, "seconds");
        //   setPendingPlayItem(null)
        // }
    }

    const closeEventsList = () => {
        document.getElementById('my-drawer-3').checked = false
    }

    const showEventsList = () => {
        document.getElementById('my-drawer-3').checked = true
    }

    const fileObjectToJsonString = (fileObject) => {
        fileObject.toJSON = function () {
            return {
                'lastModified': fileObject.lastModified,
                'lastModifiedDate': fileObject.lastModifiedDate,
                'name': fileObject.name,
                'size': fileObject.size,
                'type': fileObject.type
            };
        }
        return JSON.stringify(fileObject);
    }

    const JsonStringToFileObject = () => {
        var fileObject
    }

    const handleVideoUpload = (event) => {
        var url = URL.createObjectURL(event.target.files[0])
        var videofile = fileObjectToJsonString(event.target.files[0])
        setCookie('videofile', videofile, { path: '/' })
        setVideoFilePath(URL.createObjectURL(event.target.files[0]));
    };

    useEffect(() => {
        var vf = cookies.videofile
        if (vf !== undefined) {
            // var file = JSON.parse(vf)
            // var url = URL.createObjectURL(vf)
            // setVideoFilePath(url)
        }
        setVideoFilePath(process.env.REACT_APP_VIDEO_SERVER_URL + match.code + '.mp4')
    }, [])


    if (match === undefined) {
        return <></>
    }

    return (
        <>
            <div className="drawer drawer-mobile">
                <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <div className="flex flex-col w-full justify-between">
                        <div className="flex w-full pl-2 rounded-lg card-compact bg-base-300 hover:bg-base-300">
                            <div className='md:hidden'>
                                {/* <img className='mr-2 pt-1' alt="" width={32}
                                    src={require(`../components/layout/assets/hamburger_button.png`)}
                                    onClick={() => showEventsList()}
                                /> */}
                            </div>
                            <div className='flex flex-col'>
                                <div className='flex'>
                                    <div>
                                        {/* {player1CountryCode !== null ? <img className='pl-2 w-7 md:w-9' alt="" src={require(`../components/layout/assets/flags/${player1CountryCode}.png`)} /> : ""} */}
                                    </div>
                                    <div className='flex'>
                                        {/* <p className='pl-2 pt-0 text-sm font-normal md:text-lg'>
                                            {player1FirstName !== null ? player1FirstName.toUpperCase() : null}
                                        </p>
                                        <p className='px-2 pt-0 text-sm font-bold md:text-lg'>
                                            {player1LastName !== null ? player1LastName.toUpperCase() : null}
                                        </p> */}
                                    </div>
                                </div>
                                <div className='flex'>
                                    <div>
                                        {/* {player2CountryCode !== null ? <img className='pl-2 w-7 md:w-9' alt="" src={require(`../components/layout/assets/flags/${player2CountryCode}.png`)} /> : ""} */}
                                    </div>
                                    <div className='flex'>
                                        {/* <p className='pl-2 pt-0 text-sm font-normal md:text-lg'>
                                            {player2FirstName !== null ? player2FirstName.toUpperCase() : null}
                                        </p>
                                        <p className='px-2 pt-0 text-sm font-bold md:text-lg'>
                                            {player2LastName !== null ? player2LastName.toUpperCase() : null}
                                        </p> */}
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div>
                            <input type="file" name={videoFilePath} onChange={handleVideoUpload} />
                            <div className='flex justify-center my-4'>
                                <ReactPlayer ref={playerRef}
                                    url={videoFilePath}
                                    playing={true}
                                    width="90%"
                                    height="90%"
                                    controls={true}
                                    onReady={() => playerReady()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="drawer-side h-full">
                    <label htmlFor="my-drawer-3" className="drawer-overlay"></label>
                    <div className="overflow-y-auto w-80 bg-base-100">
                        {/* <SetList sets={sets}
                            handleItemClicked={(videoTime) => goToVideoPosition(videoTime)} /> */}
                    </div>
                </div>
            </div>
        </>
    )
}

export default VideoAnalysis