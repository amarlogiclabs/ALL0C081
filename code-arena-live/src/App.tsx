import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./lib/pages/Login";
import Index from "./lib/pages/Index";
import Dashboard from "./lib/pages/Dashboard";
import Compete from "./lib/pages/Compete";
import Battles from "./lib/pages/Battles";
import BattleArena from "./lib/pages/BattleArena";
import BattleResult from "./lib/pages/BattleResult";
import Practice from "./lib/pages/Practice";
import Leaderboard from "./lib/pages/Leaderboard";
import Aptitude from "./lib/pages/Aptitude";
import Profile from "./lib/pages/Profile";
import FriendlyMatch from "./lib/pages/FriendlyMatch";
import FriendlyMatchBattle from "./lib/pages/FriendlyMatchBattle";
import RoomLobby from "./lib/pages/RoomLobby";
import MatchSession from "./lib/pages/MatchSession";
import NotFound from "./lib/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Login initialTab="signup" />} />
            <Route path="/" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compete"
              element={
                <ProtectedRoute>
                  <Compete />
                </ProtectedRoute>
              }
            />
            <Route
              path="/battles"
              element={
                <ProtectedRoute>
                  <Compete />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friendly-match"
              element={
                <ProtectedRoute>
                  <Compete />
                </ProtectedRoute>
              }
            />
            <Route
              path="/battle/:id"
              element={
                <ProtectedRoute>
                  <BattleArena />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <Practice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/battle/results/:roomId"
              element={
                <ProtectedRoute>
                  <BattleResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/aptitude"
              element={
                <ProtectedRoute>
                  <Aptitude />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:roomId"
              element={
                <ProtectedRoute>
                  <RoomLobby />
                </ProtectedRoute>
              }
            />
            <Route
              path="/friendly-battle/:roomId"
              element={
                <ProtectedRoute>
                  <FriendlyMatchBattle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:roomId/session"
              element={
                <ProtectedRoute>
                  <MatchSession />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
