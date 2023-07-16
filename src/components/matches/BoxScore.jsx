import { useEffect, useState } from 'react'
import { sortBy } from 'lodash'

function BoxScore({ match, selectedGame, selectedTeam }) {
    const [loading, setLoading] = useState(false)
    const [shortHeader, setShortHeader] = useState(true)
    const [statsItems, setStatsItems] = useState([])

    useEffect(() => {
        if (selectedGame === 0) {
            setStatsItems(selectedTeam === 0 ? match.teamA.statsItems : match.teamB.statsItems)
        }
        else {
            var sis = selectedTeam === 0 ? match.sets[selectedGame - 1].teamAStatsItems : match.sets[selectedGame - 1].teamBStatsItems
            setStatsItems(sis)
        }
    }, [selectedGame, selectedTeam])

    // if (loading) {
    //     return <Spinner />
    // }

    if (match === undefined || match === null) {
        return <></>
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <button
                            type="button"
                            onClick={() => {
                                setShortHeader(!shortHeader)
                            }}
                            className="flex justify-end rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
                        >
                            {shortHeader ? 'Show Full Headers' : 'Show Short Headers'}
                        </button>
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    {shortHeader ?
                                        <tr>
                                            <th scope="col" className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                Player
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                K
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                E
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                TA
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                HE
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                SA
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                SE
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                PE
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                %PP
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                PAVE
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                TP
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                ASS
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                DIG
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                DE
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                DAVE
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                BS
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                BA
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                BE
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                PTS
                                            </th>
                                        </tr>
                                        :
                                        <tr>
                                            <th scope="col" className="py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                Player
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Attack Kills
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Attack Errors
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Total Attempts
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Hitting Efficiency
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Serve Aces
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Serve Errors
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Pass Errors
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                % Perfect Passes
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Passing Average
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Total Passes
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Set Assists
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Digs
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Dig Errors
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Dig Average
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Block Solos
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Block Assists
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Block Errors
                                            </th>
                                            <th scope="col" className="px-3 py-2 text-left text-sm font-semibold text-gray-900">
                                                Points Scored
                                            </th>
                                        </tr>
                                    }
                                </thead>
                                <tbody className="bg-white">
                                    {sortBy(statsItems, 'ShirtNumber').map((statsItem, i) => (
                                        <tr key={statsItem.Guid} className={i % 2 === 0 ? undefined : 'bg-gray-100'}>
                                            <td className="whitespace-nowrap py-2.5 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                {statsItem.player !== null ? statsItem.player.shirtNumber + ". " + statsItem.player.NickName.toUpperCase() : "TEAM"}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.Spike3}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.Spike0}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.SpikeTotal}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.SpikeEfficiency != -3 ? statsItem.SpikeEfficiencyString : ''}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.Serve3}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.Serve0}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.Pass0}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.PassTotal === 0 ? '' : statsItem.PassPercentPerfect.toFixed(0)}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.PassAverageString}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.PassTotal}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.Set3}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.GoodDigs}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.Dig0}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.DigAverageString}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.BlckSolo}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.BlckAssist}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.Blck0}</td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-sm text-gray-500">{statsItem.PointsWon}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BoxScore
