import React from 'react';
import { User, SituacaoRegistro, ActiveTab } from '../types';
import { PlusCircle, Shield, ArrowRight, Clock, MapPin, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

interface HomeViewProps {
  currentUser: User;
  registros: SituacaoRegistro[];
  onNavigate: (tab: ActiveTab) => void;
  onSelectRegistro: (item: SituacaoRegistro) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  registros,
  onNavigate,
  onSelectRegistro,
}) => {
  // Filter user's activity
  const myRegistros = registros.filter((r) => r.userId === currentUser.id);

  const oportunidadesCount = myRegistros.filter((r) => r.resultado === 'OPORTUNIDADE').length;
  const notificacoesCount = myRegistros.filter((r) => r.resultado === 'NOTIFICACAO_FORMAL').length;

  const recentActivity = [...myRegistros].sort(
    (a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
  );

  return (
    <div className="space-y-5 pb-20 max-w-md mx-auto px-4 pt-4">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-0.5">
          GUARDIÕES DAS CHAVES
        </div>
        <div className="text-[11px] font-medium text-slate-500 mb-2">
          Hospital Unimed Nova Friburgo
        </div>
        <h2 className="text-xl font-extrabold text-slate-800">
          Olá, {currentUser.nome.split(' ')[0]}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {currentUser.cargo} • {currentUser.setor}
        </p>
      </div>

      {/* Main Single Registration Card */}
      <div className="bg-white rounded-2xl p-5 border-2 border-emerald-700 shadow-md space-y-3">
        <div className="flex items-center space-x-2 text-emerald-900">
          <Shield className="w-5 h-5 text-emerald-700 shrink-0" />
          <h3 className="text-base font-extrabold uppercase tracking-tight">
            REGISTRAR UMA SITUAÇÃO
          </h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-normal">
          Registre uma situação observada na rotina. O aplicativo ajudará a organizar as informações e orientar o encaminhamento adequado.
        </p>

        <button
          id="btn-registrar-situacao-home"
          onClick={() => onNavigate('registrar_situacao')}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3.5 px-4 font-extrabold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 active:scale-[0.99] border border-emerald-600"
        >
          <PlusCircle className="w-5 h-5" />
          <span>REGISTRAR SITUAÇÃO</span>
        </button>
      </div>

      {/* MEUS REGISTROS */}
      <div className="space-y-3 pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            MEUS REGISTROS
          </h3>
          <button
            onClick={() => onNavigate('historico')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
          >
            <span>Ver Histórico Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('historico')}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-500 transition-colors text-left space-y-1"
          >
            <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{oportunidadesCount}</span>
            </div>
            <div className="text-xs font-bold text-slate-800 leading-tight">
              Oportunidades de Melhoria
            </div>
            <div className="text-[11px] text-slate-500">
              {oportunidadesCount === 1 ? '1 registrada' : `${oportunidadesCount} registradas`}
            </div>
          </button>

          <button
            onClick={() => onNavigate('historico')}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-500 transition-colors text-left space-y-1"
          >
            <div className="flex items-center space-x-2 text-amber-700 font-extrabold text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>{notificacoesCount}</span>
            </div>
            <div className="text-xs font-bold text-slate-800 leading-tight">
              Notificação Formal
            </div>
            <div className="text-[11px] text-slate-500">
              {notificacoesCount === 1 ? '1 para sistema oficial' : `${notificacoesCount} para sistema oficial`}
            </div>
          </button>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 space-y-2">
          <div className="text-xs font-bold text-slate-700 mb-2">
            Registros Recentes
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-xs text-slate-400 py-3 text-center italic">
              Nenhuma situação registrada até o momento.
            </div>
          ) : (
            recentActivity.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectRegistro(item)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      item.resultado === 'NOTIFICACAO_FORMAL'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                    }`}
                  >
                    {item.resultado === 'NOTIFICACAO_FORMAL'
                      ? 'NOTIFICAÇÃO FORMAL'
                      : 'OPORTUNIDADE DE MELHORIA'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">{item.id}</span>
                </div>

                <div className="text-xs text-slate-900 font-semibold line-clamp-2 leading-relaxed">
                  {item.oQueAconteceu}
                </div>

                <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1 border-t border-slate-100 pt-1.5">
                  <span className="font-medium text-emerald-800">
                    Chaves: {item.chaves.join(' • ')}
                  </span>
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{item.quandoAconteceu}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
