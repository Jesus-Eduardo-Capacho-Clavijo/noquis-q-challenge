import React, { useState } from 'react';
import {
  Trophy,
  Plus,
  Settings,
  ShieldAlert,
  BarChart3,
  Menu,
  X,
  RefreshCw,
  Lock,
  LogOut,
  Crown,
} from 'lucide-react';

interface NavbarProps {
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenAddPlayer: () => void;
  onOpenSettings: () => void;
  onOpenRules: () => void;
  onOpenStats: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  hasApiKey: boolean;
  totalPlayers: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isAdmin,
  onOpenAdminLogin,
  onAdminLogout,
  onOpenAddPlayer,
  onOpenSettings,
  onOpenRules,
  onOpenStats,
  onRefreshAll,
  isRefreshing,
  hasApiKey,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080b11]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Nav Links */}
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-cyan-400 shadow-neon-cyan flex items-center justify-center transition-transform group-hover:scale-105 shrink-0 bg-[#0d131f]">
                <img
                  src="/logo.jpg"
                  alt="Ñoquis Q Challenge Logo"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-1.5">
                  <span className="gradient-text-cyan">ÑOQUIS</span> Q CHALLENGE
                </span>
                <span className="text-[10px] font-semibold tracking-widest text-cyan-400/80 uppercase -mt-1">
                  SoloQ Tournament Tracker
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <a
                href="#ranking"
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-slate-800/50 border border-slate-700/50 shadow-sm"
              >
                Ranking
              </a>
              <button
                onClick={onOpenRules}
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Normas
              </button>
              <button
                onClick={onOpenStats}
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-purple-400" />
                Estadísticas
              </button>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Sync all from Riot Button */}
            <button
              onClick={onRefreshAll}
              disabled={isRefreshing}
              title="Sincronizar estadísticas de todos los jugadores con Riot Games"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                isRefreshing
                  ? 'bg-slate-800/60 border-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Sincronizando...' : 'Actualizar'}</span>
            </button>

            {/* ADMIN MODE: Show Add Player, Settings & Admin badge */}
            {isAdmin ? (
              <div className="flex items-center gap-2.5 pl-1 border-l border-slate-800">
                {/* Add Player Button */}
                <button
                  onClick={onOpenAddPlayer}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 hover:from-cyan-300 hover:to-blue-300 transition-all shadow-neon-cyan flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
                  <span>Añadir Cuenta</span>
                </button>

                {/* Settings */}
                <button
                  onClick={onOpenSettings}
                  className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
                  title="Configuración de Torneo"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Admin Status Pill & Logout */}
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin</span>
                  <button
                    onClick={onAdminLogout}
                    title="Cerrar sesión de Administrador"
                    className="ml-1 p-0.5 rounded text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              /* VISITOR MODE: Simple clean button to enter admin code */
              <button
                onClick={onOpenAdminLogin}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ingresar como Admin</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {isAdmin ? (
              <button
                onClick={onOpenAddPlayer}
                className="p-2 rounded-lg bg-cyan-500 text-black font-bold shadow-neon-cyan"
                title="Añadir Cuenta"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
              </button>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="p-2 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700"
                title="Ingresar como Admin"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/50 border border-slate-700/50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0c101a] px-4 pt-3 pb-5 space-y-3 animate-in fade-in slide-in-from-top-3">
          <div className="grid grid-cols-3 gap-2">
            <a
              href="#ranking"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-2 rounded-lg text-xs font-semibold text-white bg-slate-800/60 text-center"
            >
              Ranking
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRules();
              }}
              className="px-2 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800/60 flex items-center justify-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Normas
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenStats();
              }}
              className="px-2 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800/60 flex items-center justify-center gap-1"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              Estadísticas
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onRefreshAll();
              }}
              disabled={isRefreshing}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
            </button>

            {isAdmin ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>Configurar</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ingresar Admin</span>
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
