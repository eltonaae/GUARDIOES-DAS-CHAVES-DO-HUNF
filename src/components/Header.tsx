import React from 'react';
import { Key, User as UserIcon, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onOpenLogin }) => {
  return (
    <header className="bg-emerald-800 text-white shadow-md sticky top-0 z-30 font-sans">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-white text-emerald-800 p-2 rounded-xl shadow-sm flex items-center justify-center">
            <Key className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-wide uppercase leading-tight text-white">
              GUARDIÕES DAS CHAVES
            </h1>
            <p className="text-[11px] text-emerald-100 font-medium">
              Hospital Unimed Nova Friburgo
            </p>
          </div>
        </div>

        <button
          onClick={onOpenLogin}
          className="flex items-center space-x-1.5 bg-emerald-900/80 hover:bg-emerald-900 text-emerald-50 text-xs px-3 py-1.5 rounded-full border border-emerald-600/50 transition-colors shadow-xs"
          title="Alternar Usuário"
          id="btn-switch-user"
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span className="max-w-[80px] truncate font-semibold">
            {currentUser.nome.split(' ')[0]}
          </span>
        </button>
      </div>
    </header>
  );
};
