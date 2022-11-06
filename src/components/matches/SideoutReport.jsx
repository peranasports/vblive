import Sideout from './Sideout'
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { sortBy } from 'lodash'

function SideoutReport({ match, selectedGame, onGameSelected, selectedTeam, onTeamSelected }) {

    const [sideoutData, setSideoutData] = useState(null)
    const [selectedRow, setSelectedRow] = useState(0)
    const [selectedRows, setSelectedRows] = useState([1, 2, 3, 4, 5, 6])
    const [rowString, setRowString] = useState('ALL ROWS')
    const COLORS = ['#27ae60', '#e67e22', '#3498db', '#8e44ad', '#f1c40f', '#c0392b'];

    useEffect(() => {
        var sis = null
        if (selectedGame === 0) {
            sis = (selectedTeam === 0 ? match.teamA.statsItems[0] : match.teamB.statsItems[0])
        }
        else {
            sis = selectedTeam === 0 ? match.sets[selectedGame - 1].teamAStatsItems[0] : match.sets[selectedGame - 1].teamBStatsItems[0]
        }
        var fbkills = 0
        var fboppserveerrors = 0
        var fbopperrors = 0
        var kills = 0
        var opperrors = 0
        var fails = 0
        var sss = selectedRows.length > 1 ? 'ROWS ' : 'ROW '
        var ssr = sortBy(selectedRows)

        var ssr = selectedRows.sort(function (a, b) {
            return a - b;
        });

        for (var nsr = 0; nsr < ssr.length; nsr++) {
            if (nsr > 0) {
                sss += ', '
            }
            sss += selectedRows[nsr].toString()
            fbkills += sis.SideOutFirstBallKills[selectedRows[nsr]]
            fboppserveerrors += sis.SideOutFirstBallOppServeError[selectedRows[nsr]]
            fbopperrors += sis.SideOutFirstBallOppErrors[selectedRows[nsr]]
            kills += sis.SideOutKills[selectedRows[nsr]]
            opperrors += sis.SideOutOppErrors[selectedRows[nsr]]
            fails += sis.SideOutFails[selectedRows[nsr]]
        }
        setRowString(selectedRows.length === 6 ? 'ALL ROWS' : sss)
        var sodata = []
        sodata.push({ colour: COLORS[0], name: 'FB Kills', value: fbkills })
        sodata.push({ colour: COLORS[1], name: 'Opp. Serve Errors', value: fboppserveerrors })
        sodata.push({ colour: COLORS[2], name: 'FB Opp. Errors', value: fbopperrors })
        sodata.push({ colour: COLORS[3], name: 'Kills/Blocks', value: kills })
        sodata.push({ colour: COLORS[4], name: 'Opp. Errors', value: opperrors })
        sodata.push({ colour: COLORS[5], name: 'Unsuccessful', value: fails })
        setSideoutData(sodata)
    }, [selectedGame, selectedRows, selectedRow])

    if (sideoutData === null) {
        return <></>
    }

    const doSelectRow = (row) => {
        if (row == 7) {
            setSelectedRows([1, 2, 3, 4, 5, 6])
        }
        else {
            var srs = selectedRows
            var index = srs.indexOf(row)
            if (index === -1) {
                srs.push(row)
            }
            else {
                srs.splice(index, 1)
            }
            setSelectedRows(srs)
        }
        setSelectedRow(!selectedRow)
    }

    return (
        <div>
            <div className="drawer drawer-mobile">
                <input id="my-drawer-5" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    <div className="flex space-x-2 justify-end">
                    </div>
                    <div className="h-full">
                        <p className='mt-3'></p>
                        <p className='text-3xl font-bold'>{selectedTeam === 0 ? match.teamA.Name.toUpperCase() : match.teamB.Name.toUpperCase()}</p>
                        <Sideout match={match} selectedGame={selectedGame} selectedTeam={selectedTeam} selectedRows={selectedRows}
                            onRowSelected={(row) => doSelectRow(row)} />
                    </div>
                </div>
                <div className="drawer-side w-80">
                    <label htmlFor="my-drawer-5" className="drawer-overlay"></label>
                    <div className="h-80">
                        <p className='mt-3'></p>
                        <p className='text-3xl font-bold'>{selectedGame === 0 ? 'MATCH' : 'SET ' + selectedGame}</p>
                        <p className='text-xl font-bold'>{rowString}</p>
                        <ResponsiveContainer width="100%" height="85%">
                            <PieChart width={400} height={400}>
                                <Pie
                                    data={sideoutData}
                                    isAnimationActive={false}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {sideoutData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <tbody className="bg-white">
                                        {
                                            sideoutData.map((sod, row) => (
                                                <tr key={row}>
                                                    <td style={{ backgroundColor: sod.colour }} className={`whitespace-nowrap py-1 pl-4 pr-3 text-sm text-white font-medium sm:pl-6`}>
                                                        {sod.name}
                                                    </td>
                                                    <td style={{ backgroundColor: sod.colour }} className="whitespace-nowrap px-3 py-1 bg-[${sod.colour}] text-sm text-white">{sod.value}</td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default SideoutReport