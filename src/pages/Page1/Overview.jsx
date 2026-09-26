import { useEffect, useState } from "react";
import { fetchTeamsWithSquads } from "../../utils/teamswithplayers";
import TrapHeader from "../../components/broadcast/TrapHeader";

const Overview = () => {
  const [teams, setTeams] = useState([]);
  const getAllTeamswithplayers = async () => {
    fetchTeamsWithSquads().then((teamslist) => {
      setTeams(teamslist);
    });
  };

  function formatPriceInLakhs(price) {
    const n = Number(price ?? 0);
    if (Number.isNaN(n)) return "—";
    if (n >= 100) {
      const crore = (n / 100).toFixed(2);
      return `${Number(crore).toLocaleString("en-IN")} Crore`;
    }
    return `${Number(n).toLocaleString("en-IN")} Lakh`;
  }

  useEffect(() => {
    getAllTeamswithplayers();
  }, []);

  // Bought-players breakdown by role, from each team's own squad list.
  const roleCounts = (squad = []) => {
    const counts = { Batsman: 0, Bowler: 0, "Wicket Keeper": 0, "All Rounder": 0 };
    squad.forEach((p) => {
      if (counts[p.role] !== undefined) counts[p.role] += 1;
    });
    return counts;
  };

  return (
    <div className=" pb-8 pt-2  -translate-x-20  pr-5">
      <div className="translate-x-5">
        <TrapHeader>Team overview</TrapHeader>
      </div>
      <div className="bc-card-wrap pr-15  pl-5 ">
        <div className="bc-card-slant py-5 pr-10 overflow-visible pl-8">
          <div className="space-y-2 overflow-visible">
            {teams.map((team, idx) => {
              const counts = roleCounts(team.squad);
              return (
                <div key={idx} className="bc-team-row px-3 py-2">
                  <div className="flex items-center text-sm">
                    <span className="w-8 font-extrabold text-white/50">
                      {team.team_id}
                    </span>
                    <span className="font-bold whitespace-nowrap">{team.name}</span>
                    <span className="flex-1 min-w-0 text-[10px] font-bold text-white/50 pl-3 whitespace-nowrap overflow-hidden">
                      BAT {counts.Batsman} · BOWL {counts.Bowler} · AR{" "}
                      {counts["All Rounder"]} · WK {counts["Wicket Keeper"]}
                    </span>
                    <span className="w-14 text-center font-extrabold">
                      {team.playerCount}
                    </span>
                    <span className="w-28 text-right font-extrabold bc-gold-text">
                      ₹{formatPriceInLakhs(team.purse)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
