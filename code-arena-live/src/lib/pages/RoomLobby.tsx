import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle2, Circle, Copy, LogOut, Play, Loader2, AlertCircle } from 'lucide-react';

interface Participant {
  id: string;
  user_id: string;
  username?: string;
  avatar?: string;
  team_number?: number;
  status: 'joined' | 'ready' | 'coding' | 'submitted' | 'completed';
  joined_at: string;
}

interface RoomState {
  id: string;
  room_code: string;
  host_id: string;
  match_type: '1v1' | '2v2';
  status: 'waiting' | 'in_progress' | 'completed' | 'expired';
  max_participants: number;
  participantCount: number;
  isFull: boolean;
  participants: Participant[];
}

import { useAuth } from '@/contexts/AuthContext';

export default function RoomLobby() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [leftParticipants, setLeftParticipants] = useState<Participant[]>([]);

  // Get userId from AuthContext first, then localStorage as backup
  const userId = user ? user.id : (localStorage.getItem('userId') || '0');
  const userToken = localStorage.getItem('auth_token') || localStorage.getItem('token');

  // Determine host status from room state (server truth) or fallback to navigation state
  const isHost = roomState ? (roomState.host_id === userId) : (location.state?.isHost || false);

  // Debug host detection
  useEffect(() => {
    if (roomState) {
      console.log('Room Host Debug:', {
        roomId,
        hostId: roomState.host_id,
        userId,
        isHost,
        participants: roomState.participants
      });
    }
  }, [roomState, userId, isHost]);

  // Fetch room state
  useEffect(() => {
    const fetchRoomState = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/api/match/room/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${userToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch room state');
        }

        const data = await response.json();

        setRoomState((prev) => {
          // 1. Detect users who left
          if (prev) {
            const currentIds = new Set(data.room.participants.map((p: Participant) => p.id));
            const newlyLeft = prev.participants.filter((p) => !currentIds.has(p.id));

            if (newlyLeft.length > 0) {
              setLeftParticipants((prevLeft) => {
                // Avoid duplicates
                const existingIds = new Set(prevLeft.map((p) => p.id));
                const uniqueNewLeft = newlyLeft.filter((p) => !existingIds.has(p.id));

                // Set timeout to remove them after 5 seconds
                uniqueNewLeft.forEach((p) => {
                  setTimeout(() => {
                    setLeftParticipants((current) =>
                      current.filter((lp) => lp.id !== p.id)
                    );
                  }, 5000);
                });

                return [...prevLeft, ...uniqueNewLeft];
              });
            }
          }

          // 2. Prevent unnecessary re-renders (fixes "reloading" feeling)
          if (prev && JSON.stringify(prev) === JSON.stringify(data.room)) {
            return prev;
          }

          return data.room;
        });

        setError('');
      } catch (err) {
        // Only set error if it's different to prevent flicker
        setError((prevErr) => {
          const newErr = err instanceof Error ? err.message : 'Failed to load room';
          return prevErr === newErr ? prevErr : newErr;
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId && userToken) {
      fetchRoomState();

      // Poll for updates every 2 seconds
      const interval = setInterval(fetchRoomState, 2000);
      return () => clearInterval(interval);
    }
  }, [roomId, userToken]);

  // Navigate when match starts (for non-host participants)
  useEffect(() => {
    if (roomState?.status === 'in_progress' || roomState?.status === 'completed') {
      navigate(`/friendly-battle/${roomId}`, { state: { matchType: roomState?.match_type } });
    }
  }, [roomState?.status, roomId, navigate, roomState?.match_type]);

  // Handle start match
  const handleStartMatch = async () => {
    try {
      setIsStarting(true);
      setError('');

      const response = await api.post(`/api/match/room/${roomId}/start`, { problemId: null });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to start match');
        return;
      }

      // Navigate to match session
      navigate(`/friendly-battle/${roomId}`, { state: { matchType: roomState?.match_type } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start match');
    } finally {
      setIsStarting(false);
    }
  };

  // Handle leave room
  const handleLeaveRoom = async () => {
    try {
      await api.post(`/api/match/room/${roomId}/leave`, {}, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });

      navigate('/compete');
    } catch (err) {
      console.error('Error leaving room:', err);
      navigate('/compete');
    }
  };

  // Copy room code
  const handleCopyCode = () => {
    if (roomState?.room_code) {
      navigator.clipboard.writeText(roomState.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-xl">Loading room...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="bg-slate-800 border-slate-700 p-8 max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold mb-2 text-center">Room Not Found</h2>
            <p className="text-slate-400 text-center mb-4">
              The room you're looking for doesn't exist or has expired.
            </p>
            <Button
              onClick={() => navigate('/compete')}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Back to Compete
            </Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const requiredPlayers = roomState.match_type === '1v1' ? 2 : 4;
  const canStart = isHost && roomState.participantCount >= requiredPlayers && roomState.status === 'waiting';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mt-[70px]">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Room Lobby</h1>
            <p className="text-slate-400">
              Waiting for {requiredPlayers - roomState.participantCount} more player{requiredPlayers - roomState.participantCount !== 1 ? 's' : ''}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
              {error}
            </div>
          )}

          {/* Room Info Card */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-slate-400 text-sm mb-1">Room Code</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-mono font-bold text-blue-400">{roomState.room_code}</p>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-slate-700 rounded transition"
                    title="Copy room code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                {copied && <p className="text-xs text-green-400 mt-1">Copied!</p>}
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-1">Match Type</p>
                <Badge className="bg-blue-600">
                  {roomState.match_type === '1v1' ? 'One vs One' : 'Team Battle'}
                </Badge>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-1">Players</p>
                <p className="text-2xl font-bold">
                  <span className="text-green-400">{roomState.participantCount}</span>
                  <span className="text-slate-500">/{requiredPlayers}</span>
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-1">Your Role</p>
                <Badge className={isHost ? 'bg-purple-600' : 'bg-slate-600'}>
                  {isHost ? 'Host' : 'Participant'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Participants Section */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Participants ({roomState.participantCount}/{requiredPlayers})
            </h2>

            {roomState.match_type === '1v1' ? (
              // 1v1 display
              <div className="space-y-3">
                {/* Active Participants */}
                {roomState.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                  >
                    <div className="flex items-center gap-3">
                      {p.status === 'ready' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
                      )}
                      <span className="font-semibold">
                        {p.user_id === userId ? 'You' : `Player ${p.user_id}`}
                      </span>
                    </div>
                    <Badge variant={p.status === 'ready' ? 'default' : 'secondary'}>
                      {p.status}
                    </Badge>
                  </div>
                ))}

                {/* Left Participants */}
                {leftParticipants.map((p) => (
                  <div
                    key={`left-${p.id}`}
                    className="flex items-center justify-between p-4 bg-red-900/10 rounded-lg border border-red-900/30 opacity-75"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-red-400" />
                      <span className="font-semibold text-slate-400">
                        {p.user_id === userId ? 'You' : `Player ${p.user_id}`}
                      </span>
                    </div>
                    <Badge variant="destructive" className="bg-red-900/50 text-red-200 hover:bg-red-900/50">
                      Left Room
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              // 2v2 display with teams
              <div className="grid grid-cols-2 gap-6">
                {[1, 2].map((team) => (
                  <div key={team}>
                    <h3 className="font-semibold mb-3 flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${team === 1 ? 'bg-blue-400' : 'bg-red-400'
                          }`}
                      />
                      Team {team}
                    </h3>
                    <div className="space-y-2">
                      {roomState.participants
                        .filter((p) => p.team_number === team)
                        .map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                          >
                            <div className="flex items-center gap-2">
                              {p.status === 'ready' ? (
                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-500" />
                              )}
                              <span className="text-sm">
                                {p.user_id === userId ? 'You' : `Player ${p.user_id}`}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {p.status}
                            </Badge>
                          </div>
                        ))}

                      {/* Left Participants for this team */}
                      {leftParticipants
                        .filter((p) => p.team_number === team)
                        .map((p) => (
                          <div
                            key={`left-${p.id}`}
                            className="flex items-center justify-between p-3 bg-red-900/10 rounded-lg border border-red-900/30 opacity-75"
                          >
                            <div className="flex items-center gap-2">
                              <LogOut className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-slate-400">
                                {p.user_id === userId ? 'You' : `Player ${p.user_id}`}
                              </span>
                            </div>
                            <Badge variant="destructive" className="text-xs bg-red-900/20 text-red-200">
                              Left
                            </Badge>
                          </div>
                        ))}
                      {roomState.participants.filter((p) => p.team_number === team).length === 0 && (
                        <div className="p-3 bg-slate-700/30 rounded-lg border border-dashed border-slate-600 text-center text-slate-500 text-sm">
                          Waiting for player...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            {canStart ? (
              <Button
                onClick={handleStartMatch}
                disabled={isStarting}
                className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-lg"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Match
                  </>
                )}
              </Button>
            ) : (
              <div className="flex-1 bg-slate-700 rounded-lg p-4 text-center text-slate-300">
                {roomState.participantCount < requiredPlayers
                  ? `Waiting for ${requiredPlayers - roomState.participantCount} more player${requiredPlayers - roomState.participantCount !== 1 ? 's' : ''}`
                  : 'Host will start the match'}
              </div>
            )}

            <Button
              onClick={handleLeaveRoom}
              variant="outline"
              className="border-slate-600 hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>

          {/* Tips */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 mt-8">
            <h3 className="font-semibold mb-3">💡 Tips</h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li>• Share the room code <strong className="text-white">{roomState.room_code}</strong> with your friend to join</li>
              <li>• The match will start when all players have joined</li>
              <li>• You can change your status to "ready" once you're prepared</li>
              <li>• All participants will code the same problem</li>
              {roomState.match_type === '2v2' && <li>• Players are automatically divided into two equal teams</li>}
            </ul>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
