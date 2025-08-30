import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import GameCategories from "@/components/GameCategories";
import RecentWins from "@/components/RecentWins";
import BCOriginals from "@/components/BCOriginals";
import LiveSports from "@/components/LiveSports";
import SlotsShowcase from "@/components/SlotsShowcase";
import CryptoCurrencies from "@/components/CryptoCurrencies";
import DepositModal from "@/components/modals/DepositModal";
import WithdrawModal from "@/components/modals/WithdrawModal";
import MinesModal from "@/components/modals/MinesModal";

export default function Home() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [minesModalOpen, setMinesModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground crypto-grid">
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isAuthenticated={true}
        user={user}
      />
      
      <div className="flex pt-16">
        <Sidebar 
          isOpen={sidebarOpen}
          setDepositModalOpen={setDepositModalOpen}
          setWithdrawModalOpen={setWithdrawModalOpen}
          isAuthenticated={true}
        />
        
        <main className="flex-1 lg:ml-64 min-h-screen">
          {/* Welcome Banner */}
          <section className="relative overflow-hidden">
            <div className="relative h-80 bg-gradient-to-r from-primary via-accent to-blue-500 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 text-center px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
                  Welcome Back, {user?.firstName || 'Player'}!
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-6">
                  Ready to play? Your balance: <span className="text-yellow-400 font-bold">${user?.balance || '0.00'}</span>
                </p>
                <button 
                  onClick={() => setMinesModalOpen(true)}
                  className="px-8 py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-yellow-400 transition-colors pulse-glow"
                  data-testid="button-play-now"
                >
                  Play Mines
                </button>
              </div>
            </div>
          </section>

          <div className="p-4 md:p-6 space-y-8">
            <RecentWins />
            <GameCategories onMinesClick={() => setMinesModalOpen(true)} />
            <BCOriginals onMinesClick={() => setMinesModalOpen(true)} />
            <LiveSports />
            <SlotsShowcase />
            <CryptoCurrencies />
          </div>
        </main>
      </div>

      {/* Live Chat */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-gradient-to-r from-primary to-accent text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" data-testid="button-live-chat">
          <i className="fas fa-comments text-xl"></i>
        </button>
      </div>

      <DepositModal isOpen={depositModalOpen} onClose={() => setDepositModalOpen(false)} />
      <WithdrawModal isOpen={withdrawModalOpen} onClose={() => setWithdrawModalOpen(false)} />
      <MinesModal isOpen={minesModalOpen} onClose={() => setMinesModalOpen(false)} />
    </div>
  );
}
