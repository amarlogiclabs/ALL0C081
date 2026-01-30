import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Search, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { TierBadge } from '@/components/TierBadge';
import { api } from '@/lib/api';

interface LeaderboardUser {
  id: string;
  username: string;
  elo: number;
  tier: string;
  wins: number;
  total_matches: number;
  avatar: string;
}

export default function Leaderboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api('/api/users/leaderboard');
        const data = await res.json();
        if (data.success) {
          setLeaderboard(data.data);
        }
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-400" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-yellow-500 mr-3" />
              Global Leaderboard
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Compete with developers from around the world and climb the ranks.
            </p>
          </div>

          {/* Top 3 Podium */}
          {filteredLeaderboard.length >= 3 && !searchTerm && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
              {/* 2nd Place */}
              <div className="order-2 md:order-1 flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-400 overflow-hidden mb-4">
                    <img
                      src={filteredLeaderboard[1].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${filteredLeaderboard[1].username}`}
                      alt={filteredLeaderboard[1].username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-400 text-slate-900 text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Medal className="w-3 h-3 mr-1" /> 2nd
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg truncate max-w-[150px]">{filteredLeaderboard[1].username}</p>
                  <TierBadge tier={filteredLeaderboard[1].tier as any} size="sm" className="mt-2" />
                  <p className="text-accent font-mono mt-2 text-xl">{filteredLeaderboard[1].elo}</p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="order-1 md:order-2 flex flex-col items-center transform md:-translate-y-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-yellow-500 overflow-hidden mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                    <img
                      src={filteredLeaderboard[0].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${filteredLeaderboard[0].username}`}
                      alt={filteredLeaderboard[0].username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-yellow-950 font-bold px-3 py-1 rounded-full flex items-center">
                    <Trophy className="w-4 h-4 mr-1" /> 1st
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-2xl truncate max-w-[200px]">{filteredLeaderboard[0].username}</p>
                  <TierBadge tier={filteredLeaderboard[0].tier as any} size="md" className="mt-2" />
                  <p className="text-yellow-400 font-mono text-3xl font-bold mt-2">{filteredLeaderboard[0].elo}</p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-amber-700 overflow-hidden mb-4">
                    <img
                      src={filteredLeaderboard[2].avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${filteredLeaderboard[2].username}`}
                      alt={filteredLeaderboard[2].username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-amber-700 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                    <Medal className="w-3 h-3 mr-1" /> 3rd
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg truncate max-w-[150px]">{filteredLeaderboard[2].username}</p>
                  <TierBadge tier={filteredLeaderboard[2].tier as any} size="sm" className="mt-2" />
                  <p className="text-accent font-mono mt-2 text-xl">{filteredLeaderboard[2].elo}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search players..."
                className="pl-10 bg-slate-900 border-slate-700 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </Card>

          {/* List */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 text-left text-sm font-semibold text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Player</th>
                    <th className="px-6 py-4">Tier</th>
                    <th className="px-6 py-4 text-right">Rating</th>
                    <th className="px-6 py-4 text-right">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredLeaderboard.slice(searchTerm ? 0 : 3).map((player, index) => {
                    const rank = searchTerm ? index + 1 : index + 4;
                    const winRate = player.total_matches > 0
                      ? Math.round((player.wins / player.total_matches) * 100)
                      : 0;

                    return (
                      <tr
                        key={player.id}
                        className="hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-slate-400">#{rank}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`}
                              alt={player.username}
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <span className="font-medium text-white">{player.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <TierBadge tier={player.tier as any} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-lg text-blue-400">
                          {player.elo}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300">
                          {winRate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredLeaderboard.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No players found matching "{searchTerm}"
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
