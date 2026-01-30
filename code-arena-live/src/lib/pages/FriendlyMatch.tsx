import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users, Code, Zap, Trophy, Plus, LogIn, Loader2 } from 'lucide-react';

export default function FriendlyMatch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [selectedMode, setSelectedMode] = useState<'1v1' | '2v2'>('1v1');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  // Get token from localStorage or auth context
  const getAuthToken = () => {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
  };

  // Handle create room
  const handleCreateRoom = async () => {
    try {
      setIsCreating(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        setError('You must be logged in to create a room');
        navigate('/login');
        return;
      }

      const response = await api.post('/api/match/room/create', {
        matchType: selectedMode,
        problemId: null
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create room');
        return;
      }

      // Navigate to room lobby with the room ID
      navigate(`/match/${data.roomId}`, { state: { isHost: true } });
      setCreateOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle join room
  const handleJoinRoom = async () => {
    try {
      setIsJoining(true);
      setError('');

      if (!/^\d{4}$/.test(roomCode)) {
        setError('Room code must be 4 digits');
        setIsJoining(false);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        setError('You must be logged in to join a room');
        navigate('/login');
        return;
      }

      const response = await api.post('/api/match/room/join', { roomCode });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join room');
        return;
      }

      // Navigate to room lobby
      navigate(`/match/${data.roomId}`, { state: { isHost: false } });
      setJoinOpen(false);
      setRoomCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Friendly Coding Match
            </h1>
            <p className="text-xl text-slate-400 mb-2">
              Challenge your friends in real-time coding competitions
            </p>
            <p className="text-slate-500">
              Create a room or join using a 4-digit code. Code together and see who solves it first!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center hover:border-blue-500/50 transition">
              <Zap className="w-12 h-12 mx-auto mb-3 text-blue-400" />
              <h3 className="font-semibold mb-2">Real-Time</h3>
              <p className="text-sm text-slate-400">Live updates and instant feedback</p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center hover:border-purple-500/50 transition">
              <Users className="w-12 h-12 mx-auto mb-3 text-purple-400" />
              <h3 className="font-semibold mb-2">Multiplayer</h3>
              <p className="text-sm text-slate-400">1v1 or 2v2 team competitions</p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center hover:border-green-500/50 transition">
              <Code className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <h3 className="font-semibold mb-2">Multi-Language</h3>
              <p className="text-sm text-slate-400">Support for 7+ programming languages</p>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-6 text-center hover:border-yellow-500/50 transition">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
              <h3 className="font-semibold mb-2">Compete</h3>
              <p className="text-sm text-slate-400">Instant leaderboard and rankings</p>
            </Card>
          </div>

          {/* Main Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Create Room Card */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30 p-8 cursor-pointer hover:border-blue-400/50 transition">
                <DialogTrigger asChild>
                  <div className="text-center">
                    <Plus className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                    <h2 className="text-2xl font-bold mb-2">Create Room</h2>
                    <p className="text-slate-400 mb-4">
                      Start a new match and invite your friend
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Room
                    </Button>
                  </div>
                </DialogTrigger>
              </Card>

              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                  <DialogDescription>
                    Choose a match type and create a room to share with your friend
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Mode Selection */}
                  <div>
                    <label className="text-sm font-semibold mb-3 block">Match Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedMode('1v1')}
                        className={`p-4 rounded-lg border transition ${selectedMode === '1v1'
                            ? 'bg-blue-600 border-blue-500'
                            : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                          }`}
                      >
                        <Users className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">1v1</div>
                        <div className="text-xs text-slate-300">One on One</div>
                      </button>
                      <button
                        onClick={() => setSelectedMode('2v2')}
                        className={`p-4 rounded-lg border transition ${selectedMode === '2v2'
                            ? 'bg-purple-600 border-purple-500'
                            : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                          }`}
                      >
                        <Users className="w-6 h-6 mx-auto mb-2" />
                        <div className="font-semibold">2v2</div>
                        <div className="text-xs text-slate-300">Team Battle</div>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleCreateRoom}
                    disabled={isCreating}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Room...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Room
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Join Room Card */}
            <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
              <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30 p-8 cursor-pointer hover:border-purple-400/50 transition">
                <DialogTrigger asChild>
                  <div className="text-center">
                    <LogIn className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                    <h2 className="text-2xl font-bold mb-2">Join Room</h2>
                    <p className="text-slate-400 mb-4">
                      Enter a 4-digit code to join your friend's room
                    </p>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      Join Room
                    </Button>
                  </div>
                </DialogTrigger>
              </Card>

              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Join Room</DialogTitle>
                  <DialogDescription>
                    Ask your friend for the 4-digit room code and enter it below
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Room Code</label>
                    <Input
                      placeholder="0000"
                      maxLength={4}
                      value={roomCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setRoomCode(val);
                      }}
                      className="bg-slate-700 border-slate-600 text-center text-2xl font-mono tracking-widest"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    onClick={handleJoinRoom}
                    disabled={isJoining || roomCode.length !== 4}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Join Room
                      </>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info Section */}
          <Card className="bg-slate-800/50 border-slate-700 p-8 mb-8">
            <h3 className="text-xl font-bold mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold mr-3">
                    1
                  </div>
                  <h4 className="font-semibold">Create or Join</h4>
                </div>
                <p className="text-sm text-slate-400 ml-11">
                  Host creates a room or join friend's room with a code
                </p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold mr-3">
                    2
                  </div>
                  <h4 className="font-semibold">Wait for Players</h4>
                </div>
                <p className="text-sm text-slate-400 ml-11">
                  Host waits for opponents to join the room
                </p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold mr-3">
                    3
                  </div>
                  <h4 className="font-semibold">Code & Compete</h4>
                </div>
                <p className="text-sm text-slate-400 ml-11">
                  Code the same problem and see the live leaderboard
                </p>
              </div>
            </div>
          </Card>

          {/* Rules Section */}
          <Card className="bg-slate-800/50 border-slate-700 p-8">
            <h3 className="text-xl font-bold mb-4">Match Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
              <div>
                <h4 className="font-semibold text-white mb-2">1v1 Mode</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Exactly 2 participants required</li>
                  <li>Same problem for both players</li>
                  <li>Real-time code execution</li>
                  <li>Leaderboard based on speed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">2v2 Mode</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Exactly 4 participants required</li>
                  <li>Two equal teams</li>
                  <li>Same problem for all</li>
                  <li>Team-based leaderboard</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
