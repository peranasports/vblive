import {
  Bars4Icon,
  FolderArrowDownIcon,
  FolderIcon,
  PencilSquareIcon,
  TvIcon,
  WifiIcon
} from "@heroicons/react/24/outline";
import { sortBy } from "lodash";
import Moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MatchSummary({
  matches,
  team,
  gameSelected,
  onGameSelected,
  teamSelected,
  onTeamSelected,
  onSaveToDatabase,
  inDatabase,
  isLive,
}) {
  const navigate = useNavigate();
  const [currentGame, setCurrentGame] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(0);
  const [teamTabs, setTeamTabs] = useState([]);
  const [gameTabs, setGameTabs] = useState([]);

  const navigation = [
    { name: "Matches", index: 0, icon: FolderIcon, link: "/matcheslist" },
    { name: "Live", index: 1, icon: WifiIcon, link: "/live" },
    { name: "Import", index: 2, icon: FolderArrowDownIcon, link: "/input" },
    { name: "Play Lists", index: 3, icon: TvIcon, link: "/playlistslist" },
    { name: "New Match", index: 4, icon: PencilSquareIcon, link: "/codingpage" },
  ];

  const doSelectMenu = (index) => {
    const st = { currentContent: index};
    navigate("/mainpage", {
      state: st,
    });
  };

  const doSelectGame = (sgn) => {
    setCurrentGame(sgn);
    onGameSelected(sgn);
  };
  const doSelectTeam = (tmn) => {
    setCurrentTeam(tmn);
    onTeamSelected(tmn);
  };

  useEffect(() => {
    setCurrentGame(gameSelected);
    setCurrentTeam(teamSelected);
    if (matches) {
      const tts = [
        { name: team.toUpperCase(), index: 0 },
        {
          name:
            matches.length === 1
              ? matches[0].teamB.Name.toUpperCase()
              : "OPPONENTS (" + matches.length + ")",
          index: 1,
        },
      ];
      setTeamTabs(tts);
      if (matches.length === 1) {
        var gameTabs = [{ name: "Match", index: 0 }];
        sortBy(matches[0].sets, "GameNumber").map((game, i) => {
          gameTabs.push({
            name:
              "Set " +
              game.GameNumber +
              ": " +
              game.HomeScore +
              " - " +
              game.AwayScore,
            index: game.GameNumber,
          });
        });
        setGameTabs(gameTabs);
      }
    }
  }, [gameSelected, teamSelected]);

  function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
  }

  const doHome = () => {
    navigate("/");
  };

  return (
    matches && (
      <div className="flex-col w-full mt-2">
        <div className="flex justify-between">
          <>
            {matches.length === 1 ? (
              <>
                <div className="flex-col">
                  <div className="flex gap-2">
                    <div className="dropdown dropdown-start">
                      <Bars4Icon
                        tabIndex={0}
                        className="mt-0.5 size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
                      />
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                      >
                        {navigation.map((item, index) => (
                          <li key={item.name}>
                            <a
                              onClick={() => {
                                doSelectMenu(index);
                              }}
                            >
                              <item.icon
                                className="mr-2 h-5 w-5 text-base-content/50 hover:text-base-content/80"
                                aria-hidden="true"
                              />
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>{" "}
                    <p className="mt-1 text-sm text-base-700">
                      {Moment(matches[0].TrainingDate).format("DD-MMM-yyyy")}
                    </p>
                    {matches[0].tournamentName ? (
                      <p className="mt-1 text-sm text-base-700">
                        - {matches[0].tournamentName}
                      </p>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <></>
            )}
          </>
          <div className="flex gap-2">
            <>
              {isLive === false && inDatabase === false ? (
                <div
                  className="tooltip tooltip-bottom"
                  data-tip="Save to database"
                >
                  <button
                    className="btn-in-form"
                    onClick={() => onSaveToDatabase()}
                  >
                    Save to DB
                  </button>
                </div>
              ) : (
                <></>
              )}
            </>
            {/* <HomeIcon
              className="mt-1 size-6 cursor-pointer text-base-content/50 hover:text-base-content/80"
              onClick={() => doHome()}
            /> */}
          </div>
        </div>
        <div className="">
          <div>
            <div className="grid grid-cols-1 sm:hidden my-2">
              <div className="grid grid-cols-6">
                <div className="col-span-1">
                  <label className="text-sm pt-1.5">Team</label>
                </div>
                <div className="col-span-5">
                  <div className="flex gap-1">
                    <select
                      onChange={(e) =>
                        doSelectTeam(
                          teamTabs.find((tab) => tab.name === e.target.value)
                            .index
                        )
                      }
                      value={
                        teamTabs[currentTeam] && teamTabs[currentTeam].name
                      }
                      aria-label="Select a tab"
                      className="select-generic"
                    >
                      {teamTabs.map((tab) => (
                        <option key={tab.name}>{tab.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-base-content/20">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                  {teamTabs.map((tab) => (
                    <a
                      key={tab.name}
                      onClick={() => doSelectTeam(tab.index)}
                      aria-current={
                        tab.index === currentTeam ? "page" : undefined
                      }
                      className={classNames(
                        tab.index === currentTeam
                          ? "border-primary/80 text-primary/80"
                          : "border-transparent text-base-content hover:border-base-content/30 hover:text-base-content/70",
                        "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                      )}
                    >
                      {tab.name}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
        {matches.length === 1 ? (
          <div>
            <div className="grid grid-cols-1 sm:hidden my-2">
              <div className="grid grid-cols-6">
                <div className="col-span-1">
                  <label className="text-sm pt-1">Sets</label>
                </div>
                <div className="col-span-5">
                  <div className="flex gap-1">
                    <select
                      onChange={(e) =>
                        doSelectGame(
                          gameTabs.find((tab) => tab.name === e.target.value)
                            .index
                        )
                      }
                      value={
                        gameTabs[currentGame] && gameTabs[currentGame].name
                      }
                      aria-label="Select a tab"
                      className="select-generic"
                    >
                      {gameTabs.map((tab) => (
                        <option key={tab.name}>{tab.name}</option>
                      ))}
                    </select>
                    {/* <ChevronDownIcon
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-gray-500"
                    /> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-base-content/20">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8">
                  {gameTabs.map((tab) => (
                    <a
                      key={tab.name}
                      onClick={() => doSelectGame(tab.index)}
                      aria-current={
                        tab.index === currentGame ? "page" : undefined
                      }
                      className={classNames(
                        tab.index === currentGame
                          ? "border-primary/80 text-primary/80"
                          : "border-transparent text-base-content hover:border-base-content/30 hover:text-base-content/70",
                        "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                      )}
                    >
                      {tab.name}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    )
  );
}

export default MatchSummary;
