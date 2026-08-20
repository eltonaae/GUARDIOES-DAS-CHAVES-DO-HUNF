import React, { useState } from 'react';
import { User, SituacaoRegistro, ActiveTab, RegistroStatus, ChaveType, AcaoMelhoria } from '../types';
import {
  getDaysUntilExpiration,
  concluirAcaoMelhoriaStorage,
  getAcoesMelhoriaForUser,
  calcularDiasRestantesAcao,
  getAllAcoesMelhoria,
} from '../utils/storage';
import {
  PlusCircle,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  Share2,
  Check,
  Eye,
  Activity,
  Layers,
  AlertCircle,
  ThumbsUp,
  X,
  Copy,
  ChevronRight,
  Flame,
  Target,
} from 'lucide-react';

interface HomeViewProps {
  currentUser: User;
  registros: SituacaoRegistro[];
  onNavigate: (tab: ActiveTab) => void;
  onSelectRegistro: (item: SituacaoRegistro) => void;
  onOpenNotificacaoFormal?: (item: SituacaoRegistro) => void;
  onUpdateRegistro?: (updated: SituacaoRegistro) => void;
  onOpenCriarAcao?: (registroOrigem?: SituacaoRegistro | null) => void;
  onOpenAcaoDetalhes?: (acao: AcaoMelhoria) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentUser,
  registros,
  onNavigate,
  onSelectRegistro,
  onOpenNotificacaoFormal,
  onUpdateRegistro,
  onOpenCriarAcao,
  onOpenAcaoDetalhes,
}) => {
  // Scoped activity strictly for current user if Guardian, or full scope if Manager
  const myRegistros =
    currentUser.role === 'manager'
      ? registros
      : registros.filter((r) => r.userId === currentUser.id);

  // Improvement actions relevant for current user/sector
  const myAcoes = getAcoesMelhoriaForUser(currentUser);
  const activeAcoes = myAcoes.filter((a) => a.status !== 'CONCLUÍDA');

  // Dynamic metrics from DB
  const registrosRealizados = myRegistros.length;
  
  const pendenciasCount = myRegistros.filter(
    (r) =>
      r.status !== 'Concluído' &&
      (r.status === 'Aguardando ação' ||
        r.status === 'Aguardando responsável' ||
        r.status === 'Notificação a preparar' ||
        (r.resultado === 'NOTIFICACAO_FORMAL' && !r.encaminhadoOficial))
  ).length + activeAcoes.length;

  const acoesPrioritariasCount = myAcoes.filter(
    (a) => a.prioridade === 'ALTA' || a.status === 'ATRASADA'
  ).length + myRegistros.filter((r) => r.riscoImediato || r.grauDanoImpacto === 'Grave').length;

  const acoesConcluidasCount = myAcoes.filter((a) => a.status === 'CONCLUÍDA').length +
    myRegistros.filter((r) => r.status === 'Concluído').length;

  // Meus Registros breakdown
  const oportunidadesCount = myRegistros.filter((r) => r.resultado === 'OPORTUNIDADE').length;
  const notificacoesCount = myRegistros.filter((r) => r.resultado === 'NOTIFICACAO_FORMAL').length;
  const boasPraticasCount = myRegistros.filter((r) => r.isBoaPratica || r.classificacaoPreliminar.toLowerCase().includes('boa prática')).length;
  const emAcompanhamentoCount = myRegistros.filter(
    (r) => r.status === 'Em análise' || r.status === 'Aguardando ação' || r.status === 'Aguardando responsável'
  ).length;

  // Recent activity (most recent first)
  const recentRecords = [...myRegistros]
    .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
    .slice(0, 4);

  // Temporary access expiration check (<= 15 days)
  const daysUntilExp = getDaysUntilExpiration(currentUser);
  const showExpWarning =
    currentUser.role === 'guardian' &&
    daysUntilExp !== null &&
    daysUntilExp <= 15 &&
    daysUntilExp >= 0;

  // Intelligent alerts detection
  const pendingNotif = myRegistros.find(
    (r) => r.resultado === 'NOTIFICACAO_FORMAL' && !r.encaminhadoOficial
  );
  
  // Urgent action alert (overdue, due today or in <= 7 days)
  const urgentAcao = myAcoes.find((a) => {
    if (a.status === 'CONCLUÍDA') return false;
    const calc = calcularDiasRestantesAcao(a.prazoData);
    return calc.statusPrazo === 'atrasada' || calc.statusPrazo === 'vence_hoje' || (calc.dias !== null && calc.dias <= 7);
  });

  // Actions needing attention list
  const actionsNeedingMe = activeAcoes.slice(0, 3);

  // Good practices for multiplying across the hospital
  const allBoasPraticas = registros.filter(
    (r) => r.isBoaPratica || r.classificacaoPreliminar.toLowerCase().includes('boa prática')
  );
  const boaPraticaDestaque = allBoasPraticas[0] || null;

  // 4 Keys Distribution (for current Guardian)
  const chavesContagem: Record<ChaveType, number> = {
    Segurança: myRegistros.filter((r) => r.chaves.includes('Segurança')).length,
    Humanização: myRegistros.filter((r) => r.chaves.includes('Humanização')).length,
    Eficiência: myRegistros.filter((r) => r.chaves.includes('Eficiência')).length,
    Excelência: myRegistros.filter((r) => r.chaves.includes('Excelência')).length,
  };
  const totalChaves = Object.values(chavesContagem).reduce((a, b) => a + b, 0) || 1;

  // Positive feedback banner state
  const [positiveToast, setPositiveToast] = useState<string | null>(null);

  // Modal: Share Good Practice
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const getStatusBadge = (status: RegistroStatus) => {
    switch (status) {
      case 'Concluído':
        return <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">🟢 CONCLUÍDO</span>;
      case 'Registrado':
        return <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">🔵 REGISTRADO</span>;
      case 'Aguardando ação':
      case 'Ação imediata':
        return <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">🟡 AGUARDANDO AÇÃO</span>;
      case 'Em análise':
      case 'Aguardando responsável':
        return <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200">🟠 EM ANÁLISE</span>;
      case 'Notificação a preparar':
        return <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">🟣 NOTIFICAÇÃO</span>;
      case 'Encaminhado':
        return <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">🟢 ENCAMINHADO</span>;
      default:
        return <span className="inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">🔵 {String(status || 'REGISTRADO').toUpperCase()}</span>;
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-4 font-sans">
      {/* Positive Feedback Toast */}
      {positiveToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-600 flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200 max-w-xs text-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{positiveToast}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TOPO INSTITUCIONAL DO GUARDIÃO */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-emerald-700 inline" />
            <span>GUARDIÕES DAS CHAVES</span>
          </div>
          <span
            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
              currentUser.role === 'manager'
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
            }`}
          >
            {currentUser.role === 'manager' ? 'GESTOR' : 'GUARDIÃO'}
          </span>
        </div>

        <div className="text-[11px] font-medium text-slate-400">
          Hospital Unimed Nova Friburgo
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 pt-1 leading-tight">
          Olá, {currentUser.nome.split(' ')[0]}
        </h2>

        <p className="text-xs text-slate-500 font-medium">
          {currentUser.cargo} • {currentUser.setor}
        </p>
      </div>

      {/* ======================================================== */}
      {/* 2. SEU RADAR DE HOJE (DADOS DINÂMICOS DO BANCO) */}
      {/* ======================================================== */}
      <div className="space-y-2">
        <div className="text-xs font-black text-slate-800 uppercase tracking-wider px-1 flex items-center justify-between">
          <span>SEU RADAR DE HOJE</span>
          <span className="text-[10px] text-slate-400 font-semibold lowercase">atualizado em tempo real</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* 🔵 Registros realizados */}
          <div className="bg-white p-3 rounded-2xl border border-blue-200/80 shadow-2xs text-center space-y-0.5">
            <div className="text-[9px] font-bold text-blue-800 uppercase leading-tight">Registros</div>
            <div className="text-lg font-black text-blue-900">{registrosRealizados}</div>
            <div className="text-[9px] text-blue-600 font-medium">🔵 total</div>
          </div>

          {/* 🟡 Pendências */}
          <div className="bg-white p-3 rounded-2xl border border-amber-200/80 shadow-2xs text-center space-y-0.5">
            <div className="text-[9px] font-bold text-amber-800 uppercase leading-tight">Pendências</div>
            <div className="text-lg font-black text-amber-900">{pendenciasCount}</div>
            <div className="text-[9px] text-amber-600 font-medium">🟡 ativas</div>
          </div>

          {/* 🔴 Ações prioritárias */}
          <div className="bg-white p-3 rounded-2xl border border-red-200/80 shadow-2xs text-center space-y-0.5">
            <div className="text-[9px] font-bold text-red-800 uppercase leading-tight">Prioritárias</div>
            <div className="text-lg font-black text-red-900">{acoesPrioritariasCount}</div>
            <div className="text-[9px] text-red-600 font-medium">🔴 atenção</div>
          </div>

          {/* 🟢 Ações concluídas */}
          <div className="bg-white p-3 rounded-2xl border border-emerald-200/80 shadow-2xs text-center space-y-0.5">
            <div className="text-[9px] font-bold text-emerald-800 uppercase leading-tight">Concluídas</div>
            <div className="text-lg font-black text-emerald-900">{acoesConcluidasCount}</div>
            <div className="text-[9px] text-emerald-600 font-medium">🟢 feitas</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CTA PRINCIPAL: REGISTRAR & CRIAR AÇÃO */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-5 border-2 border-emerald-700 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-emerald-950">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-tight text-slate-900 leading-tight">
              REGISTRAR UMA SITUAÇÃO
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Viu algo que merece atenção ou um exemplo que merece ser repetido?
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            id="btn-registrar-situacao-home"
            onClick={() => onNavigate('registrar_situacao')}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl py-3 px-3 font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-1.5 active:scale-[0.99] border border-emerald-600 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>REGISTRAR SITUAÇÃO</span>
          </button>

          <button
            onClick={() => onOpenCriarAcao && onOpenCriarAcao(null)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-3 px-3 font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-1.5 active:scale-[0.99] cursor-pointer"
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>CRIAR AÇÃO DIRETA</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. ALERTAS INTELIGENTES: PRECISA DE ATENÇÃO */}
      {/* ======================================================== */}
      <div className="space-y-2">
        <div className="text-xs font-black text-slate-800 uppercase tracking-wider px-1">
          PRECISA DE ATENÇÃO
        </div>

        {/* Dynamic Alerts List */}
        {pendingNotif || urgentAcao || showExpWarning ? (
          <div className="space-y-2">
            {/* 🔴 Notificação Formal Requer Encaminhamento */}
            {pendingNotif && (
              <div className="bg-red-50/90 border border-red-200 text-red-950 p-4 rounded-2xl flex items-start justify-between space-x-3 text-xs shadow-2xs">
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-700 shrink-0 mt-0.5">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-red-900">
                      Situação que requer encaminhamento
                    </div>
                    <div className="text-[11px] text-red-800 mt-0.5 leading-snug line-clamp-2">
                      {pendingNotif.id}: {pendingNotif.oQueAconteceu}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenNotificacaoFormal) {
                      onOpenNotificacaoFormal(pendingNotif);
                    } else {
                      onSelectRegistro(pendingNotif);
                    }
                  }}
                  className="bg-red-700 hover:bg-red-800 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shrink-0 transition-colors shadow-2xs"
                >
                  VER AGORA
                </button>
              </div>
            )}

            {/* 🟠 Ação de melhoria com contagem regressiva de prazo */}
            {urgentAcao && (
              <div className="bg-amber-50/90 border border-amber-200 text-amber-950 p-4 rounded-2xl flex items-start justify-between space-x-3 text-xs shadow-2xs">
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-amber-900 flex items-center space-x-1.5">
                      <span>{urgentAcao.id}: {calcularDiasRestantesAcao(urgentAcao.prazoData).texto}</span>
                    </div>
                    <div className="text-[11px] text-amber-800 mt-0.5 leading-snug line-clamp-2">
                      {urgentAcao.titulo}
                    </div>
                    <div className="text-[10px] text-amber-700 mt-1">
                      Resp: <strong>{urgentAcao.responsavelNome}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenAcaoDetalhes && onOpenAcaoDetalhes(urgentAcao)}
                  className="bg-amber-800 hover:bg-amber-900 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shrink-0 transition-colors shadow-2xs"
                >
                  ACOMPANHAR
                </button>
              </div>
            )}

            {/* 🟡 Aviso de expiração de acesso */}
            {showExpWarning && (
              <div className="bg-amber-50 border border-amber-200 text-amber-950 p-3.5 rounded-2xl flex items-center justify-between space-x-2.5 text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                  <div className="text-[11px]">
                    Seu acesso ao projeto expira em <strong>{daysUntilExp} dias</strong>.
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('perfil')}
                  className="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg shrink-0"
                >
                  VER ACESSO
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200 text-emerald-950 p-4 rounded-2xl flex items-center space-x-3 text-xs">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-emerald-900">Tudo em dia por aqui. 👌</div>
              <div className="text-[11px] text-emerald-700">
                Nenhuma pendência crítica ou ação atrasada no momento.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 5. MEUS REGISTROS (RESUMO) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-emerald-800" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              MEUS REGISTROS
            </h3>
          </div>
          <button
            onClick={() => onNavigate('historico')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1"
          >
            <span>Ver Histórico</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-0.5">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Oportunidades</div>
            <div className="text-base font-black text-slate-900">{oportunidadesCount}</div>
            <div className="text-[10px] text-slate-400">melhorias de processo</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-0.5">
            <div className="text-[10px] text-amber-800 font-bold uppercase">Notificações</div>
            <div className="text-base font-black text-amber-900">{notificacoesCount}</div>
            <div className="text-[10px] text-slate-400">sistema oficial</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-0.5">
            <div className="text-[10px] text-emerald-800 font-bold uppercase">Boas Práticas</div>
            <div className="text-base font-black text-emerald-900">{boasPraticasCount}</div>
            <div className="text-[10px] text-slate-400">exemplos multiplicados</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-0.5">
            <div className="text-[10px] text-orange-800 font-bold uppercase">Em Acompanhamento</div>
            <div className="text-base font-black text-orange-900">{emAcompanhamentoCount}</div>
            <div className="text-[10px] text-slate-400">ações em andamento</div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('historico')}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1"
        >
          <span>VER HISTÓRICO COMPLETO</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 6. O QUE PRECISA DE VOCÊ? (AÇÕES DE MELHORIA ATIVAS) */}
      {/* ======================================================== */}
      {actionsNeedingMe.length > 0 && (
        <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                O QUE PRECISA DE VOCÊ?
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Ritmo & Ação</span>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Você identificou a oportunidade. A execução pertence ao responsável definido.
          </p>

          <div className="space-y-2.5">
            {actionsNeedingMe.map((item) => {
              const prazoCalc = calcularDiasRestantesAcao(item.prazoData);
              return (
                <div
                  key={item.id}
                  className="bg-slate-800/90 rounded-2xl p-3.5 border border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono text-emerald-300 font-bold">{item.id}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-bold">
                      {item.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-100 leading-snug">
                    {item.titulo}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-700 text-[11px]">
                    <div className="space-y-0.5">
                      <div className="text-slate-400">
                        Resp: <strong className="text-slate-200">{item.responsavelNome}</strong>
                      </div>
                      <div className="text-[10px] text-amber-400 font-bold">
                        ⏳ {prazoCalc.texto}
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenAcaoDetalhes && onOpenAcaoDetalhes(item)}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center space-x-1"
                    >
                      <span>Acompanhar</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. REGISTROS RECENTES (ÚLTIMOS DO USUÁRIO) */}
      {/* ======================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            REGISTROS RECENTES
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">
            {myRegistros.length} no total
          </span>
        </div>

        {recentRecords.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
            Você ainda não possui registros. Clique em "Registrar uma Situação" para iniciar.
          </div>
        ) : (
          <div className="space-y-2">
            {recentRecords.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-500 transition-colors space-y-2"
              >
                {/* Header: Código, Tipo, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-slate-400">
                      {rec.id}
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 leading-tight">
                      {rec.classificacaoPreliminar || (rec.resultado === 'NOTIFICACAO_FORMAL' ? 'Notificação Formal' : 'Oportunidade de Melhoria')}
                    </div>
                  </div>
                  <div>{getStatusBadge(rec.status)}</div>
                </div>

                {/* Resumo */}
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                  {rec.oQueAconteceu}
                </p>

                {/* Footer: Chaves, Data e CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-slate-500">
                    <span className="font-semibold text-emerald-800">
                      {rec.chaves.join(' • ')}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{rec.quandoAconteceu.split(' ')[0]}</span>
                  </div>

                  <button
                    onClick={() => onSelectRegistro(rec)}
                    className="text-xs font-extrabold text-emerald-800 hover:text-emerald-950 flex items-center space-x-0.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    <span>Abrir</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 8. BOA PRÁTICA EM DESTAQUE (MULTIPLICAÇÃO) */}
      {/* ======================================================== */}
      {boaPraticaDestaque && (
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>BOA PRÁTICA EM DESTAQUE</span>
            </div>
            <span className="text-[10px] text-emerald-300/80 font-medium">Exemplo Positivo</span>
          </div>

          <div className="text-sm font-black text-white leading-snug">
            "{boaPraticaDestaque.oQueAconteceu}"
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-200/80 pt-1 border-t border-emerald-800/60">
            <span>
              Setor: <strong>{boaPraticaDestaque.ondeAconteceu.join(', ')}</strong>
            </span>
            <span className="font-semibold">{boaPraticaDestaque.chaves.join(' • ')}</span>
          </div>

          <button
            onClick={() => setShareModalOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>MULTIPLICAR ESSE EXEMPLO</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. DISTRIBUIÇÃO PELAS 4 CHAVES (VISÃO DO GUARDIÃO) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            SEU ENGAJAMENTO PELAS 4 CHAVES
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">Proporção</span>
        </div>

        <div className="space-y-2">
          {(['Segurança', 'Humanização', 'Eficiência', 'Excelência'] as ChaveType[]).map((key) => {
            const count = chavesContagem[key];
            const pct = Math.round((count / totalChaves) * 100);
            const colorClass =
              key === 'Segurança'
                ? 'bg-blue-600'
                : key === 'Humanização'
                ? 'bg-pink-600'
                : key === 'Eficiência'
                ? 'bg-amber-500'
                : 'bg-emerald-600';

            return (
              <div key={key} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{key}</span>
                  <span className="font-bold text-slate-900">{count} ({pct}%)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorClass} rounded-full`}
                    style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: COMPARTILHAR BOA PRÁTICA */}
      {/* ======================================================== */}
      {shareModalOpen && boaPraticaDestaque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-800 font-black uppercase">
                <Sparkles className="w-4 h-4" />
                <span>Multiplicar Boa Prática</span>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl space-y-2 text-slate-700 font-mono text-[11px] leading-relaxed">
              <p>🌟 <strong>BOA PRÁTICA INSTITUCIONAL — HUNF</strong></p>
              <p>📍 <strong>Setor:</strong> {boaPraticaDestaque.ondeAconteceu.join(', ')}</p>
              <p>🔑 <strong>Chaves:</strong> {boaPraticaDestaque.chaves.join(' • ')}</p>
              <p>💡 <strong>O que foi observado:</strong> "{boaPraticaDestaque.oQueAconteceu}"</p>
              <p className="text-[10px] text-slate-500 italic">"Pequenas atitudes constroem grandes padrões de excelência e segurança."</p>
            </div>

            <button
              onClick={() => {
                const text = `🌟 BOA PRÁTICA INSTITUCIONAL — HUNF\n📍 Setor: ${boaPraticaDestaque.ondeAconteceu.join(', ')}\n🔑 Chaves: ${boaPraticaDestaque.chaves.join(' • ')}\n💡 Observação: "${boaPraticaDestaque.oQueAconteceu}"\n\nGuardiões das Chaves — Hospital Unimed Nova Friburgo`;
                navigator.clipboard.writeText(text);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 3000);
              }}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-black py-3 rounded-2xl flex items-center justify-center space-x-2 transition-colors uppercase tracking-wider text-xs shadow-xs"
            >
              {shareCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>MENSAGEM COPIADA! ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPIAR TEXTO PARA COMPARTILHAMENTO</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
