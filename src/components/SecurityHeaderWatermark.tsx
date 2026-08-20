import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { evaluateUserAccessStatus } from '../utils/security';
import { ShieldCheck, Lock, EyeOff, AlertTriangle } from 'lucide-react';

interface SecurityHeaderWatermarkProps {
  currentUser: User;
}

export const SecurityHeaderWatermark: React.FC<SecurityHeaderWatermarkProps> = ({ currentUser }) => {
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const statusEval = evaluateUserAccessStatus(currentUser);

  useEffect(() => {
    const handleBlur = () => {
      setIsWindowBlurred(true);
    };
    const handleFocus = () => {
      setIsWindowBlurred(false);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <>
      {/* Background Tab / Window Blur Privacy Shield Overlay */}
      {isWindowBlurred && (
        <div className="fixed inset-0 z-100 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white select-none pointer-events-none transition-all">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl max-w-xs space-y-3 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">
              Proteção de Privacidade Ativa
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Os dados foram ocultados temporariamente enquanto a janela não estiver em foco para proteção institucional (LGPD).
            </p>
            <div className="text-[10px] text-emerald-400 font-mono">
              Clique na tela para restaurar a visualização.
            </div>
          </div>
        </div>
      )}

      {/* Top Advisory Privacy Banner */}
      <div className="bg-slate-900 text-slate-300 text-[10px] py-1.5 px-3 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center space-x-1.5 truncate">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-300">
            Uso Restrito • Hospital Unimed Nova Friburgo • Não compartilhe ou registre imagens da tela
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${statusEval.badgeColor}`}>
            {statusEval.badgeLabel}
          </span>
        </div>
      </div>
    </>
  );
};
