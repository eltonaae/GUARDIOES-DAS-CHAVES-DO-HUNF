import React, { useState } from 'react';
import { User } from '../types';
import { DEFAULT_USERS } from '../data/mockData';
import { UserCheck, ShieldAlert, LogIn, Lock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: User;
  onSelectUser: (user: User) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  onSelectUser,
  onClose,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customNome, setCustomNome] = useState('');
  const [customCargo, setCustomCargo] = useState('');
  const [customMatricula, setCustomMatricula] = useState('');
  const [customSetor, setCustomSetor] = useState('Pronto Atendimento');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNome || !customCargo) return;

    const newUser: User = {
      id: `user-custom-${Date.now()}`,
      nome: customNome.trim(),
      cargo: customCargo.trim(),
      matricula: customMatricula.trim() || `UNF-${Math.floor(10000 + Math.random() * 90000)}`,
      pin: '1234',
      setor: customSetor.trim() || 'Geral',
      email: customEmail.trim() || `${customNome.toLowerCase().replace(/\s+/g, '.')}@unimednf.com.br`,
      role: 'guardian',
      status: 'ATIVO',
      dataInicioAcesso: '2026-08-01',
      dataExpiracaoAcesso: '2026-11-30',
      dataCriacao: new Date().toISOString(),
      isAdmin: false,
    };

    onSelectUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
          <UserCheck className="w-6 h-6 text-emerald-700" />
          <div>
            <h2 className="font-bold text-slate-800 text-lg leading-tight">
              Acesso do Colaborador
            </h2>
            <p className="text-xs text-slate-500">
              Hospital Unimed Nova Friburgo
            </p>
          </div>
        </div>

        {!isCustomMode ? (
          <div>
            <p className="text-xs text-slate-600 mb-3 font-medium">
              Selecione um perfil de teste ou cadastre suas credenciais:
            </p>

            <div className="space-y-2 mb-4">
              {DEFAULT_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    currentUser.id === user.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold leading-tight">{user.nome}</div>
                    <div className="text-xs text-slate-500">{user.cargo} • {user.setor}</div>
                    <div className="text-[11px] text-slate-400">Matrícula: {user.matricula}</div>
                  </div>
                  {currentUser.id === user.id && (
                    <span className="text-xs bg-emerald-700 text-white px-2 py-0.5 rounded-full font-medium">
                      Ativo
                    </span>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsCustomMode(true)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors text-center border border-slate-200"
            >
              + Entrar com Outro Nome / Cargo
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                required
                value={customNome}
                onChange={(e) => setCustomNome(e.target.value)}
                placeholder="Ex: Dra. Mariana Costa"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo / Função *
              </label>
              <input
                type="text"
                required
                value={customCargo}
                onChange={(e) => setCustomCargo(e.target.value)}
                placeholder="Ex: Fisioterapeuta / Farmacêutico"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Matrícula / ID Institucional
              </label>
              <input
                type="text"
                value={customMatricula}
                onChange={(e) => setCustomMatricula(e.target.value)}
                placeholder="Ex: UNF-12345"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Setor / Unidade Habituais
              </label>
              <input
                type="text"
                value={customSetor}
                onChange={(e) => setCustomSetor(e.target.value)}
                placeholder="Ex: Centro Cirúrgico"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="w-1/2 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 shadow-sm flex items-center justify-center space-x-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
