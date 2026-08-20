import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, getAllUsers } from '../utils/storage';
import { evaluateUserAccessStatus } from '../utils/security';
import { Key, ShieldCheck, Lock, AlertCircle, Info, ShieldAlert, Clock, Ban } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [matricula, setMatricula] = useState('');
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBlockedAccount, setIsBlockedAccount] = useState(false);
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const availableUsers = getAllUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsBlockedAccount(false);

    const res = loginUser(matricula, pin);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setIsBlockedAccount(!!res.isAccountBlocked);
      setErrorMessage(res.errorMessage || 'Falha na autenticação.');
    }
  };

  const handleSelectQuickAccount = (u: User) => {
    setMatricula(u.matricula);
    setPin(u.pin);
    setErrorMessage(null);
    setIsBlockedAccount(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 antialiased selection:bg-emerald-300 selection:text-emerald-950 font-sans">
      {/* Institutional App Header */}
      <div className="w-full max-w-sm text-center mb-6 space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-800 text-white shadow-xl border border-emerald-600 mb-2">
          <Key className="w-9 h-9 text-emerald-100" />
        </div>

        <h1 className="text-xl font-black uppercase tracking-wider text-white">
          Guardiões das Chaves
        </h1>
        <p className="text-xs font-bold text-emerald-400 tracking-wide">
          HOSPITAL UNIMED NOVA FRIBURGO
        </p>
        <p className="text-[11px] text-slate-400 max-w-xs mx-auto pt-1 leading-relaxed">
          Ambiente institucional seguro de acesso temporário, registro de situações e melhoria assistencial contínua.
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-tight flex items-center space-x-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Identificação Institucional</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Acesso individual e intransferível por Matrícula e PIN.
          </p>
        </div>

        {/* Error / Block Alert Box */}
        {errorMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs space-y-1.5 border animate-in fade-in duration-200 ${
              isBlockedAccount
                ? 'bg-red-950/90 border-red-700 text-red-100 shadow-md'
                : 'bg-amber-950/80 border-amber-800 text-amber-200'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold">
              {isBlockedAccount ? (
                <Ban className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span className="uppercase tracking-tight">
                {isBlockedAccount ? 'ACESSO BLOQUEADO / EXPIRADO' : 'CREDENCIAL INVÁLIDA'}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-95">
              {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Matrícula Institucional
            </label>
            <input
              id="input-matricula"
              type="text"
              required
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="Ex: UNF-20001 ou UNF-10001"
              className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all uppercase font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              PIN / Senha de Acesso
            </label>
            <input
              id="input-pin"
              type="password"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Digite seu PIN institucional"
              className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            id="btn-entrar"
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 border border-emerald-500"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Validar Identidade e Entrar</span>
          </button>
        </form>

        {/* Institutional Test Accounts Helper Accordion */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowQuickSelect(!showQuickSelect)}
            className="w-full text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-between py-1.5"
          >
            <span className="flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Perfis cadastrados para testes de segurança</span>
            </span>
            <span>{showQuickSelect ? '▲ Ocultar' : '▼ Ver Contas'}</span>
          </button>

          {showQuickSelect && (
            <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
              {availableUsers.map((u) => {
                const statusEval = evaluateUserAccessStatus(u);
                const isSelected = matricula.toUpperCase() === u.matricula.toUpperCase();
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectQuickAccount(u)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-100 truncate">{u.nome}</span>
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border uppercase shrink-0 ${statusEval.badgeColor}`}>
                        {statusEval.visualStatus}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {u.cargo} • {u.setor}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center justify-between">
                      <span>Matrícula: {u.matricula}</span>
                      <span className="text-slate-400 font-sans">
                        {u.role === 'manager' ? 'Gestor' : u.role === 'admin' ? 'Admin' : 'Guardião'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Security Notice */}
      <div className="w-full max-w-sm text-center mt-6 space-y-1">
        <div className="text-[10px] text-slate-500 font-medium">
          Acesso individual restrito e temporário aos colaboradores autorizados pelo HUNF.
        </div>
        <div className="text-[10px] text-slate-600">
          Hospital Unimed Nova Friburgo • Gestão da Qualidade e Segurança Assistencial
        </div>
      </div>
    </div>
  );
};

