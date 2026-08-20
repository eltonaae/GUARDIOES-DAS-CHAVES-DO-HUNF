import React from 'react';
import { Clock, ShieldAlert, CheckCircle2, LogOut } from 'lucide-react';

interface SessionInactivityModalProps {
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export const SessionInactivityModal: React.FC<SessionInactivityModalProps> = ({
  remainingSeconds,
  onStayLoggedIn,
  onLogoutNow,
}) => {
  return (
    <div className="fixed inset-0 z-110 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-600/40 text-amber-400 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-black text-white uppercase tracking-tight">
            Sessão Inativa por Segurança
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Por conformidade com a política de proteção de dados hospitalares, sua sessão será encerrada automaticamente em:
          </p>
        </div>

        <div className="py-3 px-4 bg-slate-950 border border-slate-800 rounded-2xl">
          <span className="text-3xl font-black text-amber-400 font-mono tracking-wider">
            {remainingSeconds}s
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
            Segundos restantes para bloqueio
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onStayLoggedIn}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-600 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 border border-emerald-500"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Continuar Conectado</span>
          </button>

          <button
            type="button"
            onClick={onLogoutNow}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-700 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão Agora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
