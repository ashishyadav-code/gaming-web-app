import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BottomNav, NavTab } from './components/BottomNav';
import { ActionSheetModal } from './components/ActionSheetModal';
import { PermissionModal } from './components/PermissionModal';
import { AuthModal } from './components/AuthModal';
import { AddMatchModal } from './components/AddMatchModal';
import { AddTournamentModal } from './components/AddTournamentModal';
import { AddPlayerModal } from './components/AddPlayerModal';
import { ChangeRoleModal } from './components/ChangeRoleModal';
import { AddNoteModal } from './components/AddNoteModal';
import { MatchDetailModal } from './components/MatchDetailModal';
import { PlayerDetailModal } from './components/PlayerDetailModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { TeamHistoryModal } from './components/TeamHistoryModal';
import { HomeScreen } from './screens/HomeScreen';
import { MatchesScreen } from './screens/MatchesScreen';
import { PlayersScreen } from './screens/PlayersScreen';
import { InsightsScreen } from './screens/InsightsScreen';
import { AccountModal } from './components/AccountModal';
import { DesktopSidebar } from './components/DesktopSidebar';
import { DesktopHeader } from './components/DesktopHeader';

import { Player, Match } from './types';
import { api } from './api/client';

const MainAppContent: React.FC = () => {
  const {
    permissionDeniedModalOpen,
    setPermissionDeniedModalOpen,
    deniedActionName,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
  } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Modals state
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isAddMatchOpen, setIsAddMatchOpen] = useState(false);
  const [isAddTournamentOpen, setIsAddTournamentOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isTeamHistoryOpen, setIsTeamHistoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Selected entities for details
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerForRoleChange, setPlayerForRoleChange] = useState<Player | null>(null);

  // Data cache for modals
  const [players, setPlayers] = useState<Player[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchActivePlayers = async () => {
    try {
      const data = await api.getPlayers('Active');
      setPlayers(data);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchActivePlayers();
  }, [refreshKey]);

  const handleRefreshAll = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleActionSheetSelect = (action: 'match' | 'tournament' | 'player' | 'note') => {
    switch (action) {
      case 'tournament':
        setIsAddTournamentOpen(true);
        break;
      case 'player':
        setIsAddPlayerOpen(true);
        break;
      case 'note':
        setIsAddNoteOpen(true);
        break;
      case 'match':
        setIsAddMatchOpen(true);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] flex text-slate-100 antialiased font-sans selection:bg-red-600 selection:text-white relative">
      {/* iOS Liquid Glass Ambient Refraction Mesh (Vibrant colored lights behind frosted glass) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-red-600/[0.14] blur-[120px] animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-rose-600/[0.12] blur-[130px]" />
        <div className="absolute -bottom-24 left-1/3 w-[30rem] h-[30rem] rounded-full bg-red-950/[0.30] blur-[140px]" />
        <div className="absolute top-2/3 left-12 w-80 h-80 rounded-full bg-amber-600/[0.08] blur-[120px]" />
      </div>

      {/* Desktop Esports Sidebar (visible on md+, hidden on mobile) */}
      <DesktopSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAddMatch={() => setIsAddMatchOpen(true)}
        onOpenAddTournament={() => setIsAddTournamentOpen(true)}
        onOpenAddPlayer={() => setIsAddPlayerOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Main Workspace / View Area */}
      <div className="flex-1 flex flex-col min-h-screen bg-[#08080c] relative overflow-x-hidden">
        {/* Desktop Sticky Header (visible on md+, hidden on mobile) */}
        <DesktopHeader
          activeTab={activeTab}
          onSearchClick={() => {}}
          onNotificationsClick={() => {}}
          onOpenAccount={() => setIsAccountOpen(true)}
        />

        {/* Responsive Content Container */}
        <div className="flex-1 w-full max-w-md md:max-w-6xl lg:max-w-7xl mx-auto bg-[#0c0c10] md:bg-transparent shadow-2xl md:shadow-none flex flex-col relative overflow-x-hidden border-x border-[#1a1a24] md:border-none">
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-24 md:pb-10 md:pt-4" key={refreshKey}>
            {activeTab === 'home' && (
              <HomeScreen
                onNavigateTab={setActiveTab}
                onOpenAddMatch={() => setIsAddMatchOpen(true)}
                onOpenAddTournament={() => setIsAddTournamentOpen(true)}
                onSelectPlayer={(p) => setSelectedPlayer(p)}
                onSelectMatch={(m) => setSelectedMatch(m)}
                onOpenAccount={() => setIsAccountOpen(true)}
              />
            )}

            {activeTab === 'matches' && (
              <MatchesScreen
                onSelectMatch={(m) => setSelectedMatch(m)}
                onOpenAddMatch={() => setIsAddMatchOpen(true)}
              />
            )}

            {activeTab === 'players' && (
              <PlayersScreen
                onSelectPlayer={(p) => setSelectedPlayer(p)}
                onOpenAddPlayer={() => setIsAddPlayerOpen(true)}
              />
            )}

            {activeTab === 'insights' && (
              <InsightsScreen
                onBack={() => setActiveTab('home')}
              />
            )}
          </main>

          {/* Floating Bottom Navigation Bar (mobile only) */}
          <div className="md:hidden">
            <BottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onPlusClick={() => setIsActionSheetOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* ================= MODALS & ACTION SHEETS ================= */}

      {/* 1. Add New Bottom Action Sheet */}
      <ActionSheetModal
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onSelectAction={handleActionSheetSelect}
      />

      {/* 2. Permission Denied Modal */}
      <PermissionModal
        isOpen={permissionDeniedModalOpen}
        onClose={() => setPermissionDeniedModalOpen(false)}
        actionName={deniedActionName}
      />

      {/* 3. Auth Modal (Login / Register with Master ASHISH800 Support) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* 4. Add Match Modal (Kalahari Included, Damage Removed) */}
      <AddMatchModal
        isOpen={isAddMatchOpen}
        onClose={() => setIsAddMatchOpen(false)}
        onSuccess={handleRefreshAll}
        players={players}
      />

      {/* 5. Add Tournament Modal */}
      <AddTournamentModal
        isOpen={isAddTournamentOpen}
        onClose={() => setIsAddTournamentOpen(false)}
        onSuccess={handleRefreshAll}
      />

      {/* 6. Add Player Modal */}
      <AddPlayerModal
        isOpen={isAddPlayerOpen}
        onClose={() => setIsAddPlayerOpen(false)}
        onSuccess={handleRefreshAll}
      />

      {/* 8. Change Player Role Modal */}
      <ChangeRoleModal
        isOpen={isChangeRoleOpen}
        onClose={() => {
          setIsChangeRoleOpen(false);
          setPlayerForRoleChange(null);
        }}
        player={playerForRoleChange}
        onSuccess={() => {
          handleRefreshAll();
          if (selectedPlayer && playerForRoleChange && selectedPlayer.id === playerForRoleChange.id) {
            api.getPlayerDetail(selectedPlayer.id).then((d) => setSelectedPlayer(d.player)).catch(() => {});
          }
        }}
      />

      {/* 9. Add Note Modal */}
      <AddNoteModal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onSuccess={handleRefreshAll}
      />

      {/* 10. Match Detail Modal */}
      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        onDeleted={handleRefreshAll}
      />

      {/* 11. Player Detail Modal */}
      <PlayerDetailModal
        player={selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onOpenChangeRole={(p) => {
          setPlayerForRoleChange(p);
          setIsChangeRoleOpen(true);
        }}
      />

      {/* 12. Team Analytics & Deterministic Progress Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* 13. Team History & Audit Trail Modal */}
      <TeamHistoryModal
        isOpen={isTeamHistoryOpen}
        onClose={() => setIsTeamHistoryOpen(false)}
        players={players}
      />

      {/* 14. Account Profile & Switch User Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onOpenLogin={() => setIsAuthModalOpen(true)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
