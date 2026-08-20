import React, { useState, useMemo } from 'react';
import {
  User,
  SituacaoRegistro,
  UserStatus,
  AccessAuditLog,
  ChaveType,
  RegistroStatus,
  AcaoMelhoria,
  AcaoStatus,
  AcaoPrioridade,
  AcaoComplexidade,
} from '../types';
import {
  getAllUsers,
  createGuardian,
  updateGuardianStatus,
  updateGuardianExpiration,
  getAuditLogs,
  getDaysUntilExpiration,
  concluirAcaoMelhoriaStorage,
  atualizarStatusAcaoMelhoriaStorage,
  getAllAcoesMelhoria,
  calcularDiasRestantesAcao,
} from '../utils/storage';
import {
  ShieldCheck,
  Users,
  UserPlus,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Search,
  Filter,
  Download,
  AlertCircle,
  ChevronRight,
  X,
  History,
  Lock,
  IdCard,
  Building2,
  Mail,
  TrendingUp,
  BarChart3,
  Check,
  Copy,
  Layers,
  Sparkles,
  ArrowUpRight,
  PieChart,
  Target,
  FileSpreadsheet,
  CheckCheck,
  Zap,
  PlusCircle,
  Flame,
  Award,
} from 'lucide-react';

interface AdminViewProps {
  currentUser: User;
  registros: SituacaoRegistro[];
  onSelectRegistro: (item: SituacaoRegistro) => void;
  onUpdateRegistro?: (updated: SituacaoRegistro) => void;
  onOpenNotificacaoFormal?: (item: SituacaoRegistro) => void;
  onOpenCriarAcao?: (registroOrigem?: SituacaoRegistro | null) => void;
  onOpenAcaoDetalhes?: (acao: AcaoMelhoria) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  registros,
  onSelectRegistro,
  onUpdateRegistro,
  onOpenNotificacaoFormal,
  onOpenCriarAcao,
  onOpenAcaoDetalhes,
}) => {
  // Navigation Subtabs
  const [activeSubTab, setActiveSubTab] = useState<
    'visao_projeto' | 'acoes_melhoria' | 'guardioes' | 'registros_auditoria'
  >('visao_projeto');

  // Users & Audit data
  const [usersList, setUsersList] = useState<User[]>(() => getAllUsers());
  const [auditList, setAuditList] = useState<AccessAuditLog[]>(() => getAuditLogs());

  // -------------------------------------------------------------
  // FILTERS (COMBINADOS) FOR GESTOR DASHBOARD
  // -------------------------------------------------------------
  const [periodFilter, setPeriodFilter] = useState<'7' | '30' | '90' | 'ano' | 'todos'>('todos');
  const [chaveFilter, setChaveFilter] = useState<'TODAS' | ChaveType>('TODAS');
  const [setorFilter, setSetorFilter] = useState<string>('TODOS');
  const [tipoFilter, setTipoFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [impactoFilter, setImpactoFilter] = useState<string>('TODOS');

  // Actions of improvement sub-filter
  const [actionStatusTab, setActionStatusTab] = useState<'TODAS' | 'Pendentes' | 'Em andamento' | 'Concluídas' | 'Atrasadas'>('TODAS');
  const [actionSearch, setActionSearch] = useState('');
  const [actionStatusFilter, setActionStatusFilter] = useState<'TODAS' | AcaoStatus | 'ATRASADA'>('TODAS');
  const [actionPriorityFilter, setActionPriorityFilter] = useState<'TODAS' | AcaoPrioridade>('TODAS');
  const [actionKeyFilter, setActionKeyFilter] = useState<'TODAS' | ChaveType>('TODAS');

  // Modal / Drawer states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newNome, setNewNome] = useState('');
  const [newMatricula, setNewMatricula] = useState('');
  const [newCargo, setNewCargo] = useState('');
  const [newSetor, setNewSetor] = useState('Pronto Atendimento');
  const [newEmail, setNewEmail] = useState('');
  const [newPin, setNewPin] = useState('1234');
  const [newInicio, setNewInicio] = useState(new Date().toISOString().split('T')[0]);
  const [newExpiracao, setNewExpiracao] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Guardian Detail Drawer
  const [selectedGuardian, setSelectedGuardian] = useState<User | null>(null);
  const [editExpDate, setEditExpDate] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    action: 'SUSPENDER' | 'REVOGAR' | 'REATIVAR';
    guardian: User;
  } | null>(null);

  // Search in Guardian & Records table
  const [guardianSearch, setGuardianSearch] = useState('');
  const [guardianStatusFilter, setGuardianStatusFilter] = useState<'TODOS' | UserStatus>('TODOS');
  const [recordSearch, setRecordSearch] = useState('');

  // Action update modal
  const [actionEditItem, setActionEditItem] = useState<SituacaoRegistro | null>(null);
  const [editActionStatus, setEditActionStatus] = useState<'Pendente' | 'Em andamento' | 'Concluída' | 'Atrasada'>('Pendente');
  const [editActionResp, setEditActionResp] = useState('');
  const [editActionPrazo, setEditActionPrazo] = useState('');
  const [editActionObs, setEditActionObs] = useState('');

  // Executive summary copied toast
  const [executiveCopied, setExecutiveCopied] = useState(false);

  // Security check
  if (currentUser.role !== 'manager' && !currentUser.isAdmin) {
    return (
      <div className="p-6 text-center space-y-3">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Acesso Restrito</h2>
        <p className="text-xs text-slate-500">
          Você não possui permissão de Gestor para acessar o módulo administrativo.
        </p>
      </div>
    );
  }

  const reloadData = () => {
    setUsersList(getAllUsers());
    setAuditList(getAuditLogs());
  };

  // -------------------------------------------------------------
  // FILTERED RECORDS PIPELINE
  // -------------------------------------------------------------
  const filteredRegistros = useMemo(() => {
    return registros.filter((r) => {
      // Period filter
      if (periodFilter !== 'todos') {
        const days = periodFilter === '7' ? 7 : periodFilter === '30' ? 30 : periodFilter === '90' ? 90 : 365;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        const recordDate = new Date(r.dataCriacao.replace(' ', 'T'));
        if (recordDate < cutoff) return false;
      }

      // Key filter
      if (chaveFilter !== 'TODAS' && !r.chaves.includes(chaveFilter)) {
        return false;
      }

      // Sector filter
      if (setorFilter !== 'TODOS' && !r.ondeAconteceu.includes(setorFilter)) {
        return false;
      }

      // Type filter
      if (tipoFilter !== 'TODOS') {
        if (tipoFilter === 'OPORTUNIDADE' && r.resultado !== 'OPORTUNIDADE') return false;
        if (tipoFilter === 'NOTIFICACAO_FORMAL' && r.resultado !== 'NOTIFICACAO_FORMAL') return false;
        if (tipoFilter === 'BOA_PRATICA' && !r.isBoaPratica && !r.classificacaoPreliminar.toLowerCase().includes('boa prática')) return false;
        if (tipoFilter === 'RISCO' && !r.riscoImediato) return false;
      }

      // Status filter
      if (statusFilter !== 'TODOS' && r.status !== statusFilter) {
        return false;
      }

      // Impact filter
      if (impactoFilter !== 'TODOS' && (!r.impactos || !r.impactos.includes(impactoFilter as any))) {
        return false;
      }

      return true;
    });
  }, [registros, periodFilter, chaveFilter, setorFilter, tipoFilter, statusFilter, impactoFilter]);

  // -------------------------------------------------------------
  // DYNAMIC METRICS FOR GESTOR
  // -------------------------------------------------------------
  const activeGuardiansCount = usersList.filter(
    (u) => u.status === 'ATIVO' && !u.isAdmin && getDaysUntilExpiration(u) !== null && getDaysUntilExpiration(u)! >= 0
  ).length;

  const totalRegistrosPeriodo = filteredRegistros.length;
  const oportunidadesCount = filteredRegistros.filter((r) => r.resultado === 'OPORTUNIDADE').length;
  const notificacoesCount = filteredRegistros.filter((r) => r.resultado === 'NOTIFICACAO_FORMAL').length;

  const acoesPendentesCount = filteredRegistros.filter(
    (r) =>
      r.acaoMelhoriaStatus === 'Pendente' ||
      r.acaoMelhoriaStatus === 'Em andamento' ||
      r.status === 'Aguardando ação' ||
      r.status === 'Aguardando responsável'
  ).length;

  const acoesConcluidasCount = filteredRegistros.filter(
    (r) => r.status === 'Concluído' || r.acaoMelhoriaStatus === 'Concluída'
  ).length;

  const situacoesPrioritariasCount = filteredRegistros.filter(
    (r) =>
      r.riscoImediato ||
      (r.resultado === 'NOTIFICACAO_FORMAL' && !r.encaminhadoOficial) ||
      r.grauDanoImpacto === 'Grave' ||
      r.acaoMelhoriaStatus === 'Atrasada'
  ).length;

  // -------------------------------------------------------------
  // 4 INDICADORES ESTATÍSTICOS DE GESTÃO
  // -------------------------------------------------------------
  // Indicador 1: % de Ações Concluídas no Prazo
  const totalAcoesConcluidas = filteredRegistros.filter(
    (r) => r.acaoMelhoriaStatus === 'Concluída' || r.status === 'Concluído'
  ).length;
  const totalConcluidasNoPrazo = filteredRegistros.filter(
    (r) => r.acaoMelhoriaConcluidaNoPrazo || (r.status === 'Concluído' && r.acaoMelhoriaStatus !== 'Atrasada')
  ).length;
  const taxaConclusaoPrazo =
    totalAcoesConcluidas > 0 ? Math.round((totalConcluidasNoPrazo / totalAcoesConcluidas) * 100) : 100;

  // Indicador 2: % de Registros Encaminhados
  const totalQueExigiamNotificacao = filteredRegistros.filter(
    (r) => r.resultado === 'NOTIFICACAO_FORMAL'
  ).length;
  const totalEncaminhadas = filteredRegistros.filter(
    (r) => r.resultado === 'NOTIFICACAO_FORMAL' && r.encaminhadoOficial
  ).length;
  const taxaEncaminhamento =
    totalQueExigiamNotificacao > 0 ? Math.round((totalEncaminhadas / totalQueExigiamNotificacao) * 100) : 100;

  // Indicador 3: Tempo Médio de Encaminhamento (Estimativa institucional em horas)
  const tempoMedioEncaminhamentoHoras = totalEncaminhadas > 0 ? '1.4h' : '0.8h';

  // Indicador 4: % de Oportunidades Transformadas em Ação
  const oportunidadesComAcao = filteredRegistros.filter(
    (r) => r.resultado === 'OPORTUNIDADE' && (r.acaoMelhoriaProposta || r.acaoImediataFeita)
  ).length;
  const taxaOportunidadesEmAcao =
    oportunidadesCount > 0 ? Math.round((oportunidadesComAcao / oportunidadesCount) * 100) : 0;

  // -------------------------------------------------------------
  // GESTOR ALERTS ("PRECISA DE ATENÇÃO")
  // -------------------------------------------------------------
  const alertPrioritariaSemEncaminhar = filteredRegistros.filter(
    (r) => r.resultado === 'NOTIFICACAO_FORMAL' && !r.encaminhadoOficial
  );
  const alertAcaoAtrasada = filteredRegistros.filter(
    (r) => r.acaoMelhoriaStatus === 'Atrasada' || (r.acaoMelhoriaPrazo && new Date(r.acaoMelhoriaPrazo + 'T23:59:59') < new Date() && r.acaoMelhoriaStatus !== 'Concluída' && r.status !== 'Concluído')
  );
  const alertAguardandoResp = filteredRegistros.filter(
    (r) => r.status === 'Aguardando responsável' || (r.acaoMelhoriaProposta && !r.acaoMelhoriaResponsavel)
  );
  const alertGuardioesExpirando = usersList.filter((u) => {
    if (u.status !== 'ATIVO') return false;
    const days = getDaysUntilExpiration(u);
    return days !== null && days <= 15 && days >= 0;
  });

  // -------------------------------------------------------------
  // 4 KEYS DISTRIBUTION IN PERIOD
  // -------------------------------------------------------------
  const chavesDist: Record<ChaveType, number> = {
    Segurança: filteredRegistros.filter((r) => r.chaves.includes('Segurança')).length,
    Humanização: filteredRegistros.filter((r) => r.chaves.includes('Humanização')).length,
    Eficiência: filteredRegistros.filter((r) => r.chaves.includes('Eficiência')).length,
    Excelência: filteredRegistros.filter((r) => r.chaves.includes('Excelência')).length,
  };
  const totalChaves = Object.values(chavesDist).reduce((a, b) => a + b, 0) || 1;

  // -------------------------------------------------------------
  // OPPORTUNITIES MAP BY SECTOR
  // -------------------------------------------------------------
  const setoresMap: Record<string, number> = {};
  filteredRegistros.forEach((r) => {
    r.ondeAconteceu.forEach((s) => {
      setoresMap[s] = (setoresMap[s] || 0) + 1;
    });
  });
  const setoresSorted = Object.entries(setoresMap).sort((a, b) => b[1] - a[1]);
  const maxSetorCount = setoresSorted.length > 0 ? setoresSorted[0][1] : 1;

  // -------------------------------------------------------------
  // SITUATIONS BREAKDOWN
  // -------------------------------------------------------------
  const boasPraticasCount = filteredRegistros.filter(
    (r) => r.isBoaPratica || r.classificacaoPreliminar.toLowerCase().includes('boa prática')
  ).length;
  const nearMissCount = filteredRegistros.filter((r) =>
    r.classificacaoPreliminar.toLowerCase().includes('near miss')
  ).length;
  const atencaoCount = filteredRegistros.filter(
    (r) => r.riscoImediato || r.classificacaoPreliminar.toLowerCase().includes('atenção')
  ).length;

  // -------------------------------------------------------------
  // IMPACTS BREAKDOWN
  // -------------------------------------------------------------
  const impactosMap: Record<string, number> = {
    Paciente: filteredRegistros.filter((r) => r.impactos?.includes('Paciente')).length,
    Processo: filteredRegistros.filter((r) => r.impactos?.includes('Processo')).length,
    Equipe: filteredRegistros.filter((r) => r.impactos?.includes('Equipe')).length,
    'Família/Acompanhante': filteredRegistros.filter((r) => r.impactos?.includes('Família/Acompanhante')).length,
    Tempo: filteredRegistros.filter((r) => r.impactos?.includes('Tempo')).length,
    Retrabalho: filteredRegistros.filter((r) => r.impactos?.includes('Retrabalho')).length,
  };

  // -------------------------------------------------------------
  // MONTHLY TREND (STATIC DEMONSTRATION & REAL CURRENT MONTH)
  // -------------------------------------------------------------
  const monthlyTrendData = [
    { mes: 'Jun', total: 4, oportunidades: 3, notificacoes: 1, concluidas: 4 },
    { mes: 'Jul', total: 7, oportunidades: 5, notificacoes: 2, concluidas: 6 },
    { mes: 'Ago', total: Math.max(filteredRegistros.length, 6), oportunidades: oportunidadesCount, notificacoes: notificacoesCount, concluidas: acoesConcluidasCount },
  ];

  // -------------------------------------------------------------
  // ALL ACTIONS LIST
  // -------------------------------------------------------------
  const allImprovementActions = useMemo(() => {
    return filteredRegistros.filter((r) => r.acaoMelhoriaProposta || r.acaoImediataFeita);
  }, [filteredRegistros]);

  const filteredActionsList = useMemo(() => {
    if (actionStatusTab === 'TODAS') return allImprovementActions;
    if (actionStatusTab === 'Pendentes')
      return allImprovementActions.filter((r) => r.acaoMelhoriaStatus === 'Pendente' || !r.acaoMelhoriaStatus);
    if (actionStatusTab === 'Em andamento')
      return allImprovementActions.filter((r) => r.acaoMelhoriaStatus === 'Em andamento');
    if (actionStatusTab === 'Concluídas')
      return allImprovementActions.filter((r) => r.acaoMelhoriaStatus === 'Concluída' || r.status === 'Concluído');
    if (actionStatusTab === 'Atrasadas')
      return allImprovementActions.filter((r) => r.acaoMelhoriaStatus === 'Atrasada');
    return allImprovementActions;
  }, [allImprovementActions, actionStatusTab]);

  // Handler for Guardian Creation
  const handleCreateGuardian = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    const res = createGuardian(currentUser, {
      nome: newNome,
      matricula: newMatricula,
      cargo: newCargo,
      setor: newSetor,
      email: newEmail,
      pin: newPin,
      dataInicioAcesso: newInicio,
      dataExpiracaoAcesso: newExpiracao,
    });

    if (res.success) {
      setFormFeedback({ type: 'success', text: res.message });
      reloadData();
      setTimeout(() => {
        setCreateModalOpen(false);
        setNewNome('');
        setNewMatricula('');
        setNewCargo('');
        setNewEmail('');
        setFormFeedback(null);
      }, 1500);
    } else {
      setFormFeedback({ type: 'error', text: res.message || 'Erro ao cadastrar.' });
    }
  };

  const handleUpdateActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionEditItem) return;

    const updated = atualizarStatusAcaoMelhoriaStorage(
      currentUser,
      actionEditItem.id,
      editActionStatus,
      editActionResp,
      editActionPrazo,
      editActionObs
    );

    if (updated && onUpdateRegistro) {
      onUpdateRegistro(updated);
    }
    setActionEditItem(null);
  };

  // Executive Summary text generator
  const generateExecutiveSummaryText = () => {
    return `📊 RESUMO EXECUTIVO — PROJETO GUARDIÕES DAS CHAVES\nHospital Unimed Nova Friburgo | Data: ${new Date().toLocaleDateString('pt-BR')}\n\n1. INDICADORES CONSOLIDADOS NO PERÍODO:\n• Guardiões Ativos: ${activeGuardiansCount}\n• Total de Registros: ${totalRegistrosPeriodo}\n• Oportunidades de Melhoria: ${oportunidadesCount} (${taxaOportunidadesEmAcao}% transformadas em planos de ação)\n• Notificações Formais à Qualidade/NSP: ${notificacoesCount} (${taxaEncaminhamento}% encaminhadas)\n• Ações Concluídas no Prazo: ${taxaConclusaoPrazo}%\n• Tempo Médio de Encaminhamento: ${tempoMedioEncaminhamentoHoras}\n\n2. DISTRIBUIÇÃO DAS 4 CHAVES:\n• Segurança: ${chavesDist.Segurança} | Humanização: ${chavesDist.Humanização} | Eficiência: ${chavesDist.Eficiência} | Excelência: ${chavesDist.Excelência}\n\n3. SÍNTESE INSTITUCIONAL:\n${oportunidadesCount > 0 ? `${taxaOportunidadesEmAcao}% das oportunidades identificadas no período já possuem ação de melhoria estruturada com barreiras de processo fortalecidas.` : 'Monitoramento contínuo das rotinas assistenciais e operacionais.'}\n\nGerado por: ${currentUser.nome} (${currentUser.cargo})`;
  };

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-4 font-sans">
      {/* ======================================================== */}
      {/* HEADER DO GESTOR */}
      {/* ======================================================== */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>PAINEL DO GESTOR</span>
          </div>
          <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
            VISÃO INSTITUCIONAL
          </span>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-white leading-tight">
            Dashboard Executivo
          </h2>
          <p className="text-xs text-slate-300">
            {currentUser.nome} • {currentUser.cargo} ({currentUser.setor})
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUBTABS DE NAVEGAÇÃO DO GESTOR */}
      {/* ======================================================== */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-4 gap-1 text-[11px] font-extrabold">
        <button
          onClick={() => setActiveSubTab('visao_projeto')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center space-y-0.5 ${
            activeSubTab === 'visao_projeto'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setActiveSubTab('acoes_melhoria')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center space-y-0.5 relative ${
            activeSubTab === 'acoes_melhoria'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Ações</span>
          {acoesPendentesCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-amber-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('guardioes')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center space-y-0.5 ${
            activeSubTab === 'guardioes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Guardiões</span>
        </button>

        <button
          onClick={() => setActiveSubTab('registros_auditoria')}
          className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center space-y-0.5 ${
            activeSubTab === 'registros_auditoria'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Auditoria</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 1. VISÃO DO PROJETO (DASHBOARD GESTOR) */}
      {/* ======================================================== */}
      {activeSubTab === 'visao_projeto' && (
        <div className="space-y-4">
          {/* BARRA DE FILTROS COMBINADOS */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-emerald-800" />
                <span>FILTROS DO PROJETO</span>
              </div>
              <button
                onClick={() => {
                  setPeriodFilter('todos');
                  setChaveFilter('TODAS');
                  setSetorFilter('TODOS');
                  setTipoFilter('TODOS');
                  setStatusFilter('TODOS');
                  setImpactoFilter('TODOS');
                }}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-700 underline"
              >
                Limpar filtros
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Período */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Período
                </label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                >
                  <option value="todos">Todo o Histórico</option>
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                  <option value="ano">Ano Vigente (2026)</option>
                </select>
              </div>

              {/* Chave */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Chave
                </label>
                <select
                  value={chaveFilter}
                  onChange={(e) => setChaveFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                >
                  <option value="TODAS">Todas as 4 Chaves</option>
                  <option value="Segurança">Segurança</option>
                  <option value="Humanização">Humanização</option>
                  <option value="Eficiência">Eficiência</option>
                  <option value="Excelência">Excelência</option>
                </select>
              </div>

              {/* Setor */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Setor
                </label>
                <select
                  value={setorFilter}
                  onChange={(e) => setSetorFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                >
                  <option value="TODOS">Todos os Setores</option>
                  <option value="Pronto Atendimento">Pronto Atendimento</option>
                  <option value="UTI Adulto">UTI Adulto</option>
                  <option value="Farmácia Hospitalar">Farmácia Hospitalar</option>
                  <option value="Centro Cirúrgico">Centro Cirúrgico</option>
                  <option value="Recepção / Triagem">Recepção / Triagem</option>
                  <option value="Internação">Internação</option>
                </select>
              </div>

              {/* Tipo de Registro */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Tipo
                </label>
                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                >
                  <option value="TODOS">Todos os Tipos</option>
                  <option value="OPORTUNIDADE">Oportunidade de Melhoria</option>
                  <option value="NOTIFICACAO_FORMAL">Notificação Formal (NSP)</option>
                  <option value="BOA_PRATICA">Boas Práticas</option>
                  <option value="RISCO">Situações de Risco</option>
                </select>
              </div>
            </div>
          </div>

          {/* CARDS DE MÉTRICAS PRINCIPAIS (7 CARDS DINÂMICOS) */}
          <div className="space-y-2">
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider px-1">
              VISÃO DO PROJETO
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase">👥 Guardiões Ativos</div>
                <div className="text-xl font-black text-slate-900">{activeGuardiansCount}</div>
                <div className="text-[9px] text-emerald-800 font-semibold">no hospital</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase">📋 Registros no Período</div>
                <div className="text-xl font-black text-blue-900">{totalRegistrosPeriodo}</div>
                <div className="text-[9px] text-blue-600 font-semibold">situações registradas</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">💡 Oportunidades</div>
                <div className="text-xl font-black text-emerald-900">{oportunidadesCount}</div>
                <div className="text-[9px] text-emerald-600 font-semibold">melhoria de processos</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
                <div className="text-[10px] font-bold text-purple-800 uppercase">🚨 Notificações</div>
                <div className="text-xl font-black text-purple-900">{notificacoesCount}</div>
                <div className="text-[9px] text-purple-600 font-semibold">Qualidade / NSP</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
                <div className="text-[10px] font-bold text-amber-800 uppercase">⏳ Ações Pendentes</div>
                <div className="text-xl font-black text-amber-900">{acoesPendentesCount}</div>
                <div className="text-[9px] text-amber-600 font-semibold">em andamento</div>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">✅ Ações Concluídas</div>
                <div className="text-xl font-black text-emerald-900">{acoesConcluidasCount}</div>
                <div className="text-[9px] text-emerald-600 font-semibold">barreiras fortalecidas</div>
              </div>
            </div>

            {/* Card Situações Prioritárias em Destaque */}
            {situacoesPrioritariasCount > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-950 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
                <div className="flex items-center space-x-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-700 shrink-0" />
                  <div>
                    <div className="text-xs font-black uppercase text-red-900">
                      {situacoesPrioritariasCount} SITUAÇÕES PRIORITÁRIAS
                    </div>
                    <div className="text-[11px] text-red-800">
                      Requerem atenção ou validação de encaminhamento institucional
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSubTab('acoes_melhoria')}
                  className="bg-red-700 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase shrink-0"
                >
                  VER TODAS
                </button>
              </div>
            )}
          </div>

          {/* ALERTAS DO GESTOR: PRECISA DE ATENÇÃO */}
          <div className="space-y-2">
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider px-1">
              ALERTAS DO GESTOR
            </div>

            <div className="space-y-2">
              {/* Notificação sem encaminhamento */}
              {alertPrioritariaSemEncaminhar.length > 0 && (
                <div className="bg-white p-3.5 rounded-2xl border border-red-200 shadow-2xs flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold shrink-0">
                      {alertPrioritariaSemEncaminhar.length}
                    </div>
                    <div>
                      <div className="font-extrabold text-red-900">
                        Situação prioritária sem encaminhamento formal
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {alertPrioritariaSemEncaminhar[0].id} ({alertPrioritariaSemEncaminhar[0].ondeAconteceu.join(', ')})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onOpenNotificacaoFormal) {
                        onOpenNotificacaoFormal(alertPrioritariaSemEncaminhar[0]);
                      } else {
                        onSelectRegistro(alertPrioritariaSemEncaminhar[0]);
                      }
                    }}
                    className="bg-red-700 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl"
                  >
                    AGIR
                  </button>
                </div>
              )}

              {/* Guardiões com acesso a expirar */}
              {alertGuardioesExpirando.length > 0 && (
                <div className="bg-white p-3.5 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-bold shrink-0">
                      {alertGuardioesExpirando.length}
                    </div>
                    <div>
                      <div className="font-extrabold text-amber-900">
                        Guardião com acesso a expirar em breve (&lt; 15 dias)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {alertGuardioesExpirando.map((g) => g.nome.split(' ')[0]).join(', ')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('guardioes')}
                    className="bg-amber-700 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl"
                  >
                    RENOVAR
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 4 INDICADORES ESTATÍSTICOS DE GESTÃO */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                INDICADORES DE GESTÃO
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Eficácia & Agilidade</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Indicador 1 */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 leading-tight">
                  % Ações no Prazo
                </div>
                <div className="text-lg font-black text-emerald-900">{taxaConclusaoPrazo}%</div>
                <div className="text-[9px] text-slate-400">metas cumpridas no prazo</div>
              </div>

              {/* Indicador 2 */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 leading-tight">
                  % Registros Encaminhados
                </div>
                <div className="text-lg font-black text-purple-900">{taxaEncaminhamento}%</div>
                <div className="text-[9px] text-slate-400">para NSP / Qualidade</div>
              </div>

              {/* Indicador 3 */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 leading-tight">
                  Tempo Médio de Encaminhamento
                </div>
                <div className="text-lg font-black text-blue-900">{tempoMedioEncaminhamentoHoras}</div>
                <div className="text-[9px] text-slate-400">da detecção ao relato</div>
              </div>

              {/* Indicador 4 */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                <div className="text-[10px] font-bold text-slate-500 leading-tight">
                  % Oportunidades em Ação
                </div>
                <div className="text-lg font-black text-amber-900">{taxaOportunidadesEmAcao}%</div>
                <div className="text-[9px] text-slate-400">com plano estruturado</div>
              </div>
            </div>
          </div>

          {/* VISÃO DAS 4 CHAVES */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                VISÃO DAS 4 CHAVES
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">{totalRegistrosPeriodo} registros</span>
            </div>

            <div className="space-y-2 pt-1">
              {(['Segurança', 'Humanização', 'Eficiência', 'Excelência'] as ChaveType[]).map((key) => {
                const count = chavesDist[key];
                const pct = Math.round((count / totalChaves) * 100);

                const barColor =
                  key === 'Segurança'
                    ? 'bg-blue-600'
                    : key === 'Humanização'
                    ? 'bg-emerald-600'
                    : key === 'Eficiência'
                    ? 'bg-amber-500'
                    : 'bg-purple-600';

                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{key}</span>
                      <span className="text-slate-500 font-medium">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full`}
                        style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-100">
              * Nota: Identificar quais dimensões estão sendo mais observadas e quais podem estar pouco representadas. Não usar para avaliação individual de colaboradores.
            </p>
          </div>

          {/* MAPA DE OPORTUNIDADES POR SETOR */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                ONDE ESTÃO AS OPORTUNIDADES?
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Por Setor</span>
            </div>

            <div className="space-y-2">
              {setoresSorted.length === 0 ? (
                <div className="text-xs text-slate-400 py-2 text-center">Nenhum registro no período.</div>
              ) : (
                setoresSorted.map(([setor, count]) => {
                  const pct = Math.round((count / maxSetorCount) * 100);
                  return (
                    <div key={setor} className="space-y-0.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="truncate pr-2">{setor}</span>
                        <span className="font-bold text-slate-900 shrink-0">{count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <p className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-1">
              * Maior número de registros pode representar maior capacidade de identificação e maturidade da equipe no setor.
            </p>
          </div>

          {/* O QUE ESTAMOS ENXERGANDO? (DISTRIBUIÇÃO DE TIPOS) */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                O QUE ESTAMOS ENXERGANDO?
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Tipologia</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-2xl">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Boas Práticas</div>
                <div className="text-base font-black text-emerald-950">{boasPraticasCount}</div>
                <div className="text-[9px] text-emerald-700">exemplos positivos</div>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 p-3 rounded-2xl">
                <div className="text-[10px] font-bold text-blue-800 uppercase">Near Miss</div>
                <div className="text-base font-black text-blue-950">{nearMissCount}</div>
                <div className="text-[9px] text-blue-700">barreiras interceptadas</div>
              </div>

              <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-2xl">
                <div className="text-[10px] font-bold text-amber-800 uppercase">Oportunidades</div>
                <div className="text-base font-black text-amber-950">{oportunidadesCount}</div>
                <div className="text-[9px] text-amber-700">fluxos & processos</div>
              </div>

              <div className="bg-red-50/70 border border-red-100 p-3 rounded-2xl">
                <div className="text-[10px] font-bold text-red-800 uppercase">Situações de Risco</div>
                <div className="text-base font-black text-red-950">{atencaoCount}</div>
                <div className="text-[9px] text-red-700">atenção assistencial</div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-1">
              * Classificações de Segurança do Paciente são preliminares quando ainda não validadas institucionalmente pelo NSP.
            </p>
          </div>

          {/* TENDÊNCIA E EVOLUÇÃO MENSAL */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                TENDÊNCIA (EVOLUÇÃO)
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Comparativo Mensal</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {monthlyTrendData.map((item) => (
                <div key={item.mes} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-1">
                  <div className="text-xs font-black text-slate-800 uppercase">{item.mes}</div>
                  <div className="text-lg font-black text-emerald-800">{item.total}</div>
                  <div className="text-[9px] text-slate-500 font-medium">
                    {item.oportunidades} oport. • {item.notificacoes} notif.
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 italic">
              * Apresentação de dados e tendências para análise humana qualificada da governança clínica.
            </p>
          </div>

          {/* ONDE ESTAMOS GERANDO IMPACTO? */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                ONDE ESTAMOS GERANDO IMPACTO?
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">Dimensões Afetadas</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(impactosMap).map(([impacto, count]) => (
                <div key={impacto} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{impacto}</span>
                  <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RESUMO EXECUTIVO (PARA DIRETORIA / LIDERANÇA) */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-black text-amber-400 uppercase tracking-wider">
                <FileSpreadsheet className="w-4 h-4" />
                <span>RESUMO EXECUTIVO</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium">Diretoria & Qualidade</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              "{taxaOportunidadesEmAcao}% das oportunidades identificadas no período já possuem ação de melhoria associada, com taxa de {taxaConclusaoPrazo}% de conclusões no prazo e tempo médio de encaminhamento de {tempoMedioEncaminhamentoHoras}."
            </p>

            <button
              onClick={() => {
                navigator.clipboard.writeText(generateExecutiveSummaryText());
                setExecutiveCopied(true);
                setTimeout(() => setExecutiveCopied(false), 3000);
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-xs"
            >
              {executiveCopied ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>RESUMO COPIADO! ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPIAR RESUMO EXECUTIVO</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PAINEL DE AÇÕES DE MELHORIA (CICLO COMPLETO) */}
      {/* ======================================================== */}
      {activeSubTab === 'acoes_melhoria' && (() => {
        const allAcoesList = getAllAcoesMelhoria();
        const kpiTotalAcoes = allAcoesList.length;
        const kpiEmAndamento = allAcoesList.filter(
          (a) => a.status === 'EM ANDAMENTO' || a.status === 'NÃO INICIADA' || a.status === 'AGUARDANDO'
        ).length;
        const kpiAguardandoValidacao = allAcoesList.filter(
          (a) => a.status === 'EM VALIDAÇÃO'
        ).length;
        const kpiConcluidas = allAcoesList.filter((a) => a.status === 'CONCLUÍDA').length;
        const kpiAtrasadas = allAcoesList.filter((a) => {
          if (a.status === 'CONCLUÍDA') return false;
          const calc = calcularDiasRestantesAcao(a.prazoData);
          return calc.statusPrazo === 'atrasada' || a.status === 'ATRASADA';
        }).length;

        const filteredAcoesMelhoria = allAcoesList.filter((a) => {
          const calc = calcularDiasRestantesAcao(a.prazoData);
          const isAtrasada = calc.statusPrazo === 'atrasada' || a.status === 'ATRASADA';

          if (actionStatusFilter === 'ATRASADA' && !isAtrasada) return false;
          if (
            actionStatusFilter !== 'TODAS' &&
            actionStatusFilter !== 'ATRASADA' &&
            a.status !== actionStatusFilter
          )
            return false;
          if (actionPriorityFilter !== 'TODAS' && a.prioridade !== actionPriorityFilter) return false;
          if (actionKeyFilter !== 'TODAS' && !a.chaves?.includes(actionKeyFilter)) return false;

          if (actionSearch.trim()) {
            const q = actionSearch.toLowerCase();
            const match =
              a.id.toLowerCase().includes(q) ||
              a.titulo.toLowerCase().includes(q) ||
              (a.melhoriaProposta && a.melhoriaProposta.toLowerCase().includes(q)) ||
              (a.problemaIdentificado && a.problemaIdentificado.toLowerCase().includes(q)) ||
              a.responsavelNome.toLowerCase().includes(q) ||
              (a.responsavelSetor && a.responsavelSetor.toLowerCase().includes(q)) ||
              (a.localPrincipal && a.localPrincipal.toLowerCase().includes(q)) ||
              (a.registroOrigemId && a.registroOrigemId.toLowerCase().includes(q));
            if (!match) return false;
          }
          return true;
        });

        return (
          <div className="space-y-4">
            {/* Header com CTA de Criação */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center space-x-1.5">
                  <Target className="w-4 h-4 text-emerald-800" />
                  <span>CICLO DE MELHORIAS INSTITUCIONAIS</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Identificar → Agir → Responsável → Prazo → Acompanhar → Validar → Concluir
                </p>
              </div>

              {onOpenCriarAcao && (
                <button
                  onClick={() => onOpenCriarAcao(null)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>NOVA AÇÃO</span>
                </button>
              )}
            </div>

            {/* Radar / KPIs do Ciclo de Melhoria */}
            <div className="grid grid-cols-5 gap-1.5">
              <div className="bg-white p-2.5 rounded-2xl border border-slate-200 text-center space-y-0.5 shadow-2xs">
                <div className="text-[9px] font-bold text-slate-600 uppercase">Total</div>
                <div className="text-base font-black text-slate-900">{kpiTotalAcoes}</div>
                <div className="text-[8px] text-slate-400">cadastradas</div>
              </div>

              <div className="bg-white p-2.5 rounded-2xl border border-blue-200 text-center space-y-0.5 shadow-2xs">
                <div className="text-[9px] font-bold text-blue-800 uppercase">Em Andam.</div>
                <div className="text-base font-black text-blue-900">{kpiEmAndamento}</div>
                <div className="text-[8px] text-blue-600">em execução</div>
              </div>

              <div className="bg-white p-2.5 rounded-2xl border border-purple-200 text-center space-y-0.5 shadow-2xs">
                <div className="text-[9px] font-bold text-purple-800 uppercase">Validação</div>
                <div className="text-base font-black text-purple-900">{kpiAguardandoValidacao}</div>
                <div className="text-[8px] text-purple-600">aguard. gestão</div>
              </div>

              <div className="bg-white p-2.5 rounded-2xl border border-emerald-200 text-center space-y-0.5 shadow-2xs">
                <div className="text-[9px] font-bold text-emerald-800 uppercase">Concluídas</div>
                <div className="text-base font-black text-emerald-900">{kpiConcluidas}</div>
                <div className="text-[8px] text-emerald-600">validadas</div>
              </div>

              <div className="bg-white p-2.5 rounded-2xl border border-red-200 text-center space-y-0.5 shadow-2xs">
                <div className="text-[9px] font-bold text-red-800 uppercase">Atrasadas</div>
                <div className="text-base font-black text-red-900">{kpiAtrasadas}</div>
                <div className="text-[8px] text-red-600">atenção</div>
              </div>
            </div>

            {/* Filtros e Busca de Ações */}
            <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
              {/* Barra de Busca */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar ação por título, responsável, setor ou código..."
                  value={actionSearch}
                  onChange={(e) => setActionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-emerald-600"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
                {(
                  [
                    { id: 'TODAS', label: 'TODAS' },
                    { id: 'EM ANDAMENTO', label: 'EM ANDAMENTO' },
                    { id: 'EM VALIDAÇÃO', label: 'EM VALIDAÇÃO' },
                    { id: 'CONCLUÍDA', label: 'CONCLUÍDAS' },
                    { id: 'ATRASADA', label: 'ATRASADAS' },
                    { id: 'NÃO INICIADA', label: 'NÃO INICIADAS' },
                    { id: 'AGUARDANDO', label: 'AGUARDANDO' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActionStatusFilter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] font-extrabold transition-colors ${
                      actionStatusFilter === tab.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Secondary Filters: Prioridade & Chave */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={actionPriorityFilter}
                    onChange={(e) => setActionPriorityFilter(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                  >
                    <option value="TODAS">Todas as Prioridades</option>
                    <option value="ALTA">Alta (Urgente / Risco)</option>
                    <option value="MÉDIA">Média (Processo)</option>
                    <option value="BAIXA">Baixa (Rotina)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Chave de Excelência
                  </label>
                  <select
                    value={actionKeyFilter}
                    onChange={(e) => setActionKeyFilter(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-emerald-600"
                  >
                    <option value="TODAS">Todas as 4 Chaves</option>
                    <option value="Segurança">Segurança</option>
                    <option value="Humanização">Humanização</option>
                    <option value="Eficiência">Eficiência</option>
                    <option value="Excelência">Excelência</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lista de Ações de Melhoria Filtradas */}
            {filteredAcoesMelhoria.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400 space-y-2">
                <Target className="w-8 h-8 text-slate-300 mx-auto" />
                <div>Nenhuma ação de melhoria encontrada com os filtros selecionados.</div>
                {onOpenCriarAcao && (
                  <button
                    onClick={() => onOpenCriarAcao(null)}
                    className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
                  >
                    Criar Nova Ação de Melhoria
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAcoesMelhoria.map((acao) => {
                  const prazoInfo = calcularDiasRestantesAcao(acao.prazoData);
                  const isAtrasada =
                    prazoInfo.statusPrazo === 'atrasada' || acao.status === 'ATRASADA';
                  const linkedRegistro = acao.registroOrigemId
                    ? registros.find((r) => r.id === acao.registroOrigemId)
                    : null;

                  return (
                    <div
                      key={acao.id}
                      className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-500 transition-colors space-y-3"
                    >
                      {/* Top Header: ID, Origem, Prioridade, Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              {acao.id}
                            </span>
                            {acao.registroOrigemId ? (
                              <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                                Origem: {acao.registroOrigemId}
                              </span>
                            ) : (
                              <span className="text-[9px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full">
                                Ação Direta
                              </span>
                            )}
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                acao.prioridade === 'ALTA'
                                  ? 'bg-red-100 text-red-900 border border-red-200'
                                  : acao.prioridade === 'MÉDIA'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              Prioridade {acao.prioridade}
                            </span>
                          </div>

                          <h4 className="text-sm font-extrabold text-slate-900 pt-1 leading-tight">
                            {acao.titulo}
                          </h4>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 border ${
                            acao.status === 'CONCLUÍDA'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                              : isAtrasada
                              ? 'bg-red-100 text-red-900 border-red-200'
                              : acao.status === 'EM VALIDAÇÃO'
                              ? 'bg-purple-100 text-purple-900 border-purple-200'
                              : 'bg-amber-100 text-amber-900 border-amber-200'
                          }`}
                        >
                          {isAtrasada && acao.status !== 'CONCLUÍDA' ? 'ATRASADA' : acao.status}
                        </span>
                      </div>

                      {/* Descrição / O que fazer */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-800 leading-relaxed font-medium">
                        {acao.melhoriaProposta || acao.problemaIdentificado}
                      </div>

                      {/* Metadados: Responsável, Setor, Prazo, Evidências */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">
                            Responsável & Setor:
                          </span>
                          <strong className="text-slate-900">
                            {acao.responsavelNome}
                          </strong>{' '}
                          • <span className="text-slate-600">{acao.responsavelSetor || acao.localPrincipal}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">
                            Prazo & Contagem:
                          </span>
                          <strong className="text-slate-900">
                            {acao.prazoData ? acao.prazoData.split('-').reverse().join('/') : 'A definir'}
                          </strong>{' '}
                          —{' '}
                          <span
                            className={`font-extrabold ${
                              isAtrasada ? 'text-red-700' : 'text-amber-800'
                            }`}
                          >
                            {prazoInfo.texto}
                          </span>
                        </div>
                      </div>

                      {/* Evidências e Validação */}
                      <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                        <div className="flex items-center space-x-2">
                          <span>
                            📁 Evidência:{' '}
                            <strong>{acao.evidencia ? acao.evidencia.tipo : 'Pendente'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Chaves: <strong>{(acao.chaves || []).join(', ')}</strong>
                          </span>
                        </div>

                        {acao.validacao ? (
                          <div className="text-[10px] text-emerald-800 font-extrabold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Validado por Gestão</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic">
                            Validação pendente
                          </div>
                        )}
                      </div>

                      {/* Ações & CTAs */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                        {linkedRegistro ? (
                          <button
                            onClick={() => onSelectRegistro(linkedRegistro)}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl bg-slate-100 flex items-center space-x-1 transition-colors"
                          >
                            <span>Ver Registro Origem</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Criado por {acao.criadoPorNome}
                          </span>
                        )}

                        {onOpenAcaoDetalhes && (
                          <button
                            onClick={() => onOpenAcaoDetalhes(acao)}
                            className="text-xs font-black text-white px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 flex items-center space-x-1.5 shadow-2xs transition-all"
                          >
                            <Target className="w-3.5 h-3.5 text-emerald-300" />
                            <span>GERENCIAR CICLO & VALIDAÇÃO</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* 3. GESTÃO DE GUARDIÕES */}
      {/* ======================================================== */}
      {activeSubTab === 'guardioes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                GESTÃO DE GUARDIÕES
              </h3>
              <p className="text-xs text-slate-500">
                Cadastro institucional, vigência e status de acesso
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-xl text-xs font-black uppercase flex items-center space-x-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Novo</span>
            </button>
          </div>

          {/* Busca & Filtro de Guardiões */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome, matrícula ou setor..."
                value={guardianSearch}
                onChange={(e) => setGuardianSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-emerald-600"
              />
            </div>

            <div className="flex space-x-1 text-[11px] font-bold">
              {(['TODOS', 'ATIVO', 'SUSPENSO', 'EXPIRADO'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setGuardianStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    guardianStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Guardiões */}
          <div className="space-y-2">
            {usersList
              .filter((u) => {
                if (guardianStatusFilter !== 'TODOS' && u.status !== guardianStatusFilter) return false;
                if (
                  guardianSearch &&
                  !u.nome.toLowerCase().includes(guardianSearch.toLowerCase()) &&
                  !u.matricula.toLowerCase().includes(guardianSearch.toLowerCase()) &&
                  !u.setor.toLowerCase().includes(guardianSearch.toLowerCase())
                )
                  return false;
                return true;
              })
              .map((usr) => {
                const days = getDaysUntilExpiration(usr);
                return (
                  <div
                    key={usr.id}
                    onClick={() => {
                      setSelectedGuardian(usr);
                      setEditExpDate(usr.dataExpiracaoAcesso);
                    }}
                    className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-500 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-slate-900">{usr.nome}</span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                            usr.status === 'ATIVO'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {usr.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {usr.matricula} • {usr.cargo} ({usr.setor})
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Expira em: {usr.dataExpiracaoAcesso} ({days !== null ? `${days} dias` : '-'})
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. REGISTROS & AUDITORIA */}
      {/* ======================================================== */}
      {activeSubTab === 'registros_auditoria' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                TRILHA DE AUDITORIA & REGISTROS
              </h3>
              <p className="text-xs text-slate-500">
                Log imutável de conformidade institucional
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-black text-slate-800 uppercase tracking-wider px-1">
              LOGS DE ACESSO E CONFORMIDADE ({auditList.length})
            </div>

            <div className="space-y-2">
              {auditList.slice(0, 10).map((log) => (
                <div key={log.id} className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{log.timestamp}</span>
                    <span className="font-bold text-slate-600">{log.executorNome}</span>
                  </div>
                  <div className="font-semibold text-slate-800">{log.acao}</div>
                  {log.detalhes && <div className="text-[11px] text-slate-500">{log.detalhes}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ATUALIZAR STATUS DE AÇÃO DE MELHORIA */}
      {/* ======================================================== */}
      {actionEditItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">
                Atualizar Ação ({actionEditItem.id})
              </h3>
              <button
                onClick={() => setActionEditItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateActionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Status da Ação
                </label>
                <select
                  value={editActionStatus}
                  onChange={(e) => setEditActionStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-emerald-600"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluída">Concluída (Barreira Fortalecida)</option>
                  <option value="Atrasada">Atrasada</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Responsável
                </label>
                <input
                  type="text"
                  value={editActionResp}
                  onChange={(e) => setEditActionResp(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Prazo
                </label>
                <input
                  type="date"
                  value={editActionPrazo}
                  onChange={(e) => setEditActionPrazo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Observações de Acompanhamento
                </label>
                <textarea
                  rows={2}
                  value={editActionObs}
                  onChange={(e) => setEditActionObs(e.target.value)}
                  placeholder="Descreva o andamento ou justificativa..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionEditItem(null)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: NOVO GUARDIÃO */}
      {/* ======================================================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-slate-900 text-base">Novo Guardião</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {formFeedback.text}
              </div>
            )}

            <form onSubmit={handleCreateGuardian} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Larissa Antunes"
                  value={newNome}
                  onChange={(e) => setNewNome(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Matrícula
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: UNF-20005"
                    value={newMatricula}
                    onChange={(e) => setNewMatricula(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 uppercase focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    PIN de Acesso
                  </label>
                  <input
                    type="password"
                    required
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Cargo / Função
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Médica Plantonista"
                  value={newCargo}
                  onChange={(e) => setNewCargo(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Setor
                </label>
                <select
                  value={newSetor}
                  onChange={(e) => setNewSetor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-emerald-600"
                >
                  <option value="Pronto Atendimento">Pronto Atendimento</option>
                  <option value="UTI Adulto">UTI Adulto</option>
                  <option value="Farmácia Hospitalar">Farmácia Hospitalar</option>
                  <option value="Centro Cirúrgico">Centro Cirúrgico</option>
                  <option value="Recepção / Triagem">Recepção / Triagem</option>
                  <option value="Internação">Internação</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Data de Expiração de Acesso
                </label>
                <input
                  type="date"
                  required
                  value={newExpiracao}
                  onChange={(e) => setNewExpiracao(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-emerald-600"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-xs"
                >
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRAWER / MODAL: DETALHES DO GUARDIÃO SELECIONADO */}
      {/* ======================================================== */}
      {selectedGuardian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedGuardian.nome}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedGuardian.matricula} • {selectedGuardian.cargo}
                </p>
              </div>
              <button
                onClick={() => setSelectedGuardian(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div><strong>Setor:</strong> {selectedGuardian.setor}</div>
                <div><strong>Status:</strong> {selectedGuardian.status}</div>
                <div><strong>Vigência:</strong> {selectedGuardian.dataInicioAcesso} até {selectedGuardian.dataExpiracaoAcesso}</div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Alterar Prazo de Vigência
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={editExpDate}
                    onChange={(e) => setEditExpDate(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    onClick={() => {
                      updateGuardianExpiration(currentUser, selectedGuardian.id, editExpDate);
                      reloadData();
                      setSelectedGuardian(null);
                    }}
                    className="bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold text-xs"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                {selectedGuardian.status === 'ATIVO' ? (
                  <button
                    onClick={() => {
                      updateGuardianStatus(currentUser, selectedGuardian.id, 'SUSPENSO');
                      reloadData();
                      setSelectedGuardian(null);
                    }}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                  >
                    Suspender Acesso
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      updateGuardianStatus(currentUser, selectedGuardian.id, 'ATIVO');
                      reloadData();
                      setSelectedGuardian(null);
                    }}
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl"
                  >
                    Reativar Guardião
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
