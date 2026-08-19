import React from 'react';
import { Home, PlusCircle, History, User, ShieldCheck } from 'lucide-react';
import { ActiveTab, User as UserType } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  currentUser: UserType;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab, currentUser }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-30">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-1">
        <button
          id="nav-home"
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'home'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">HOME</span>
        </button>

        <button
          id="nav-registrar-situacao"
          onClick={() => onChangeTab('registrar_situacao')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'registrar_situacao'
              ? 'text-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-5 h-5 mb-0.5 text-emerald-700" />
          <span className="text-[11px] font-extrabold text-emerald-800">REGISTRAR</span>
        </button>

        <button
          id="nav-historico"
          onClick={() => onChangeTab('historico')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'historico'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">HISTÓRICO</span>
        </button>

        <button
          id="nav-perfil"
          onClick={() => onChangeTab('perfil')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === 'perfil'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">PERFIL</span>
        </button>

        {currentUser.isAdmin && (
          <button
            id="nav-admin"
            onClick={() => onChangeTab('admin')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
              activeTab === 'admin'
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">ADM</span>
          </button>
        )}
      </div>
    </nav>
  );
};
