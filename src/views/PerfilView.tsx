import React from 'react';
import { User } from '../types';
import { getDaysUntilExpiration } from '../utils/storage';
import { UserCheck, Mail, Shield, Building2, IdCard, LogOut, ArrowRightLeft, Calendar, ShieldCheck, Clock } from 'lucide-react';

interface PerfilViewProps {
  currentUser: User;
  onOpenSwitchAccount: () => void;
  onLogout: () => void;
}

export const PerfilView: React.FC<PerfilViewProps> = ({
  currentUser,
  onOpenSwitchAccount,
  onLogout,
}) => {
  const daysRemaining = getDaysUntilExpiration(currentUser);

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-4 font-sans">
      {/* Title */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
          PERFIL DO COLABORADOR
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Hospital Unimed Nova Friburgo
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
            {currentUser.nome.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base leading-tight">
              {currentUser.nome}
            </h3>
            <div className="text-xs font-semibold text-emerald-800 mt-0.5">
              {currentUser.cargo}
            </div>
            <span
              className={`inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                currentUser.role === 'manager'
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}
            >
              {currentUser.role === 'manager' ? 'GESTOR DO PROJETO' : 'GUARDIÃO DAS CHAVES'}
            </span>
          </div>
        </div>

        {/* Account & Institutional Details */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <IdCard className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Matrícula Institucional
              </div>
              <div className="font-bold text-slate-800">{currentUser.matricula}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                Setor / Unidade
              </div>
              <div className="font-bold text-slate-800">{currentUser.setor}</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <Mail className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                E-mail Institucional
              </div>
              <div className="font-bold text-slate-800">{currentUser.email}</div>
            </div>
          </div>

          {/* Access Expiration */}
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
            <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <div className="text-[10px] text-emerald-800 uppercase font-bold">
                Vigência do Acesso ao Projeto
              </div>
              <div className="font-bold text-slate-800">
                Até {currentUser.dataExpiracaoAcesso || '31/12/2026'}{' '}
                {daysRemaining !== null && daysRemaining >= 0 && (
                  <span className="text-[11px] font-normal text-emerald-800">
                    ({daysRemaining} dias restantes)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <button
            onClick={onOpenSwitchAccount}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowRightLeft className="w-4 h-4 text-slate-600" />
            <span>Trocar Usuário / Conta</span>
          </button>

          <button
            id="btn-logout"
            onClick={onLogout}
            className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center space-x-2 border border-red-200"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Sair do Aplicativo</span>
          </button>
        </div>

        {/* Footer Credit & Version */}
        <div className="pt-3 border-t border-slate-100 text-center space-y-0.5">
          <div className="text-[11px] font-semibold text-slate-500">
            Guardiões das Chaves • Hospital Unimed Nova Friburgo
          </div>
          <div className="text-[10px] text-slate-400">
            Desenvolvido por <span className="font-semibold text-slate-600">Elton Paulino Laranjeiras</span>
          </div>
        </div>
      </div>
    </div>
  );
};
