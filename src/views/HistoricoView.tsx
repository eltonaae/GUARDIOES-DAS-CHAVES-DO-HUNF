import React, { useState } from 'react';
import { User, SituacaoRegistro, ChaveType, RegistroStatus, AcaoMelhoria } from '../types';
import { addTimelineEventToRegistro, getAllAcoesMelhoria, calcularDiasRestantesAcao, deleteRegistro } from '../utils/storage';
import { SolicitarCorrecaoModal } from '../components/SolicitarCorrecaoModal';
import {
  Shield,
  Search,
  Clock,
  MapPin,
  Copy,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
  PlusCircle,
  MessageSquare,
  ArrowRight,
  Send,
  Users,
  Compass,
  Target,
  ChevronRight,
  FileEdit,
  Trash2,
} from 'lucide-react';

interface HistoricoViewProps {
  currentUser: User;
  registros: SituacaoRegistro[];
  selectedItemToOpen?: SituacaoRegistro | null;
  onUpdateRegistro?: (updated: SituacaoRegistro) => void;
  onOpenNotificacaoFormal?: (reg: SituacaoRegistro) => void;
  onOpenCriarAcao?: (registroOrigem?: SituacaoRegistro | null) => void;
  onOpenAcaoDetalhesById?: (acaoId: string) => void;
}

const STATUS_OPTIONS: RegistroStatus[] = [
  'Registrado',
  'Aguardando ação',
  'Em análise',
  'Aguardando responsável',
  'Ação imediata',
  'Notificação a preparar',
  'Encaminhado',
  'Concluído',
];

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  currentUser,
  registros,
  selectedItemToOpen = null,
  onUpdateRegistro,
  onOpenNotificacaoFormal,
  onOpenCriarAcao,
  onOpenAcaoDetalhesById,
}) => {
  const [filterResultado, setFilterResultado] = useState<'TODOS' | 'OPORTUNIDADE' | 'NOTIFICACAO_FORMAL'>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterChave, setFilterChave] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  const [detailItem, setDetailItem] = useState<SituacaoRegistro | null>(selectedItemToOpen);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [showSolicitarCorrecao, setShowSolicitarCorrecao] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Timeline Event Form in Modal
  const [showAddTimeline, setShowAddTimeline] = useState(false);
  const [newTimelineAcao, setNewTimelineAcao] = useState('');
  const [newTimelineDesc, setNewTimelineDesc] = useState('');
  const [newTimelineStatus, setNewTimelineStatus] = useState<RegistroStatus | ''>('');

  // All improvement actions to link
  const allAcoes = getAllAcoesMelhoria();

  // Strictly filter records belonging to current user unless Manager
  const scopedRegistros =
    currentUser.role === 'manager'
      ? registros
      : registros.filter((r) => r.userId === currentUser.id);

  // Filter logic
  const filteredRegistros = scopedRegistros.filter((item) => {
    const matchesResultado =
      filterResultado === 'TODOS' || item.resultado === filterResultado;

    const matchesStatus =
      filterStatus === 'TODOS' || item.status === filterStatus;

    const matchesChave =
      filterChave === 'TODAS' ||
      item.chaves.includes(filterChave as ChaveType);

    const term = searchTerm.toLowerCase();
    const textSearch = `${item.oQueAconteceu} ${item.ondeAconteceu.join(' ')} ${item.id} ${item.acaoImediataFeita || ''} ${item.acaoMelhoriaProposta || ''} ${item.classificacaoPreliminar || ''}`;
    const matchesSearch = textSearch.toLowerCase().includes(term);

    return matchesResultado && matchesStatus && matchesChave && matchesSearch;
  });

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  const handleAddTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailItem || !newTimelineAcao.trim()) return;

    const updated = addTimelineEventToRegistro(
      currentUser,
      detailItem.id,
      newTimelineAcao.trim(),
      newTimelineDesc.trim() || undefined,
      newTimelineStatus ? (newTimelineStatus as RegistroStatus) : undefined
    );

    if (updated) {
      setDetailItem(updated);
      if (onUpdateRegistro) {
        onUpdateRegistro(updated);
      }
      setNewTimelineAcao('');
      setNewTimelineDesc('');
      setNewTimelineStatus('');
      setShowAddTimeline(false);
    }
  };

  const getStatusBadgeClass = (status: RegistroStatus) => {
    switch (status) {
      case 'Ação imediata':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'Notificação a preparar':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Aguardando responsável':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Em análise':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Aguardando ação':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Encaminhado':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Concluído':
        return 'bg-slate-900 text-white border-black';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-4 font-sans">
      {/* Title Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
        <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">
          Hospital Unimed Nova Friburgo
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
          {currentUser.role === 'manager' ? 'HISTÓRICO INSTITUCIONAL' : 'MEUS REGISTROS'}
        </h2>
        <p className="text-xs text-slate-500">
          {currentUser.role === 'manager'
            ? `Todos os registros institucionais (${scopedRegistros.length})`
            : `Situações registradas por você (${scopedRegistros.length})`}
        </p>
      </div>

      {/* Filter by Outcome Pill Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setFilterResultado('TODOS')}
          className={`py-2 rounded-xl transition-all ${
            filterResultado === 'TODOS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          TODOS ({scopedRegistros.length})
        </button>
        <button
          onClick={() => setFilterResultado('OPORTUNIDADE')}
          className={`py-2 rounded-xl transition-all ${
            filterResultado === 'OPORTUNIDADE'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          OPORTUNIDADES
        </button>
        <button
          onClick={() => setFilterResultado('NOTIFICACAO_FORMAL')}
          className={`py-2 rounded-xl transition-all ${
            filterResultado === 'NOTIFICACAO_FORMAL'
              ? 'bg-white text-amber-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          NOTIFICAÇÕES
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar situação, local, status ou ID..."
          className="w-full text-xs bg-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      {/* Records Feed */}
      <div className="space-y-3">
        {filteredRegistros.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-600">Nenhum registro localizado.</div>
            <div>Não há situações cadastradas correspondentes ao filtro ativo.</div>
          </div>
        ) : (
          filteredRegistros.map((item) => (
            <div
              key={item.id}
              onClick={() => setDetailItem(item)}
              className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-500 transition-colors cursor-pointer space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${getStatusBadgeClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">{item.id}</span>
              </div>

              {/* Preliminary classification badge if exists */}
              {item.classificacaoPreliminar && (
                <div className="text-[11px] font-extrabold text-emerald-900 line-clamp-1">
                  {item.classificacaoPreliminar}
                </div>
              )}

              <div className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">
                {item.oQueAconteceu}
              </div>

              <div className="flex flex-wrap gap-1">
                {item.chaves.map((ch) => (
                  <span
                    key={ch}
                    className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md"
                  >
                    {ch}
                  </span>
                ))}
              </div>

              {/* Immediate action highlight if exists */}
              {item.acaoImediataFeita && (
                <div className="text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100 text-slate-700 line-clamp-1">
                  <strong>Ação imediata:</strong> {item.acaoImediataFeita}
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[170px]">{item.ondeAconteceu.join(', ')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.quandoAconteceu}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL DETALHADO: PAINEL DO REGISTRO & LINHA DO TEMPO      */}
      {/* ========================================================= */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-emerald-800" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{detailItem.id}</h3>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Registrado por {detailItem.userName} ({detailItem.userCargo || 'Guardião'})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STATUS & CLASSIFICAÇÃO */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase">STATUS ATUAL:</span>
                <span
                  className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase border ${getStatusBadgeClass(
                    detailItem.status
                  )}`}
                >
                  {detailItem.status}
                </span>
              </div>

              {detailItem.classificacaoPreliminar && (
                <div className="text-xs font-black text-slate-900 uppercase">
                  {detailItem.classificacaoPreliminar}
                </div>
              )}

              {detailItem.motivoTriagem && (
                <div className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  {detailItem.motivoTriagem}
                </div>
              )}
            </div>

            {/* SITUAÇÃO: O QUE ACONTECEU */}
            <div className="space-y-1">
              <div className="text-[11px] font-extrabold text-slate-700 uppercase">
                SITUAÇÃO (O QUE ACONTECEU):
              </div>
              <div className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {detailItem.oQueAconteceu}
              </div>
              {detailItem.contextoSituacao && (
                <div className="text-[11px] text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <strong>Contexto:</strong> {detailItem.contextoSituacao}
                </div>
              )}
            </div>

            {/* CHAVES & IMPACTOS */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">CHAVES:</span>
                <div className="flex flex-wrap gap-1">
                  {detailItem.chaves.map((c) => (
                    <span key={c} className="text-[10px] bg-emerald-100 text-emerald-950 font-bold px-2 py-0.5 rounded-md">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase block">IMPACTO:</span>
                <div className="flex flex-wrap gap-1">
                  {detailItem.impactos.map((i) => (
                    <span key={i} className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-md">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ONDE & QUANDO */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase font-bold text-[9px]">Onde:</span>
                <span className="font-bold text-slate-800">{detailItem.ondeAconteceu.join(', ')}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase font-bold text-[9px]">Quando:</span>
                <span className="font-bold text-slate-800">{detailItem.quandoAconteceu}</span>
              </div>
            </div>

            {/* AÇÃO IMEDIATA (O QUE FOI FEITO AGORA) */}
            <div className="space-y-1.5 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200">
              <div className="text-[11px] font-black text-emerald-950 uppercase">
                AÇÃO IMEDIATA (CONTENÇÃO / CORREÇÃO):
              </div>
              {detailItem.acoesImediatasSelecionadas && detailItem.acoesImediatasSelecionadas.length > 0 && (
                <div className="space-y-1">
                  {detailItem.acoesImediatasSelecionadas.map((ac, idx) => (
                    <div key={idx} className="text-xs text-emerald-950 font-semibold flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{ac}</span>
                    </div>
                  ))}
                </div>
              )}
              {detailItem.acaoImediataFeita && (
                <div className="text-xs text-slate-700 pt-1">
                  {detailItem.acaoImediataFeita}
                </div>
              )}
              {detailItem.orientacaoRealizada && (
                <div className="text-[11px] text-slate-600 pt-1 border-t border-emerald-100">
                  <strong>Orientação ao Colega:</strong> {detailItem.orientacaoRealizada} (Resultado: {detailItem.orientacaoResultado || 'Não especificado'})
                </div>
              )}
            </div>

            {/* AÇÃO DE MELHORIA & CICLO VINCULADO */}
            <div className="space-y-2 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-black text-blue-950 uppercase flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-700" />
                  <span>Ciclo de Melhoria Vinculado</span>
                </div>
                {onOpenCriarAcao && (
                  <button
                    onClick={() => {
                      const item = detailItem;
                      setDetailItem(null);
                      onOpenCriarAcao(item);
                    }}
                    className="text-[10px] font-extrabold text-blue-800 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Nova Ação</span>
                  </button>
                )}
              </div>

              {/* Existing Actions linked to this record */}
              {(() => {
                const linkedAcoes = allAcoes.filter(
                  (a) =>
                    a.registroOrigemId === detailItem.id ||
                    a.registrosRelacionadosIds?.includes(detailItem.id)
                );

                if (linkedAcoes.length > 0) {
                  return (
                    <div className="space-y-2 pt-1">
                      {linkedAcoes.map((acao) => {
                        const prazoInfo = calcularDiasRestantesAcao(acao.prazoData);
                        return (
                          <div
                            key={acao.id}
                            className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-blue-900">{acao.id}</span>
                              <span
                                className={`font-extrabold px-2 py-0.5 rounded-full text-[9px] ${
                                  acao.status === 'CONCLUÍDA'
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                    : acao.status === 'ATRASADA'
                                    ? 'bg-red-100 text-red-900 border border-red-200'
                                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                                }`}
                              >
                                {acao.status}
                              </span>
                            </div>

                            <div className="text-xs font-bold text-slate-900 leading-snug">
                              {acao.titulo}
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                              <span>Resp: <strong className="text-slate-700">{acao.responsavelNome}</strong></span>
                              <span className="font-semibold text-amber-700">{prazoInfo.texto}</span>
                            </div>

                            {onOpenAcaoDetalhesById && (
                              <button
                                onClick={() => {
                                  setDetailItem(null);
                                  onOpenAcaoDetalhesById(acao.id);
                                }}
                                className="w-full mt-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-[10px] font-extrabold rounded-lg flex items-center justify-center space-x-1"
                              >
                                <span>Acompanhar Ciclo Completo</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {detailItem.acaoMelhoriaProposta ? (
                      <div className="text-xs text-slate-800 leading-relaxed font-medium bg-white p-2.5 rounded-xl border border-blue-100">
                        <strong>Proposta inicial:</strong> {detailItem.acaoMelhoriaProposta}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic">
                        Nenhuma ação de melhoria estruturada criada para esta situação ainda.
                      </p>
                    )}

                    {onOpenCriarAcao && (
                      <button
                        onClick={() => {
                          const item = detailItem;
                          setDetailItem(null);
                          onOpenCriarAcao(item);
                        }}
                        className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs uppercase rounded-xl flex items-center justify-center space-x-1.5 shadow-2xs"
                      >
                        <Target className="w-3.5 h-3.5 text-blue-200" />
                        <span>ESTRUTURAR AÇÃO DE MELHORIA (O QUE? QUEM? QUANDO?)</span>
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* PRÓXIMO PASSO & RESPONSÁVEL */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase font-bold text-[9px]">Próximo Passo:</span>
                <span className="font-bold text-slate-800">{detailItem.proximoPasso || 'Acompanhar'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 block uppercase font-bold text-[9px]">Responsável / Área:</span>
                <span className="font-bold text-slate-800">{detailItem.responsavelAreaDestino || 'Setor / Liderança'}</span>
              </div>
            </div>

            {/* LINHA DO TEMPO COMPLETA (HISTÓRICO INTERATIVO) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                    LINHA DO TEMPO DO CASO
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddTimeline(!showAddTimeline)}
                  className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1 hover:underline"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Atualizar Linha</span>
                </button>
              </div>

              {/* Add Timeline Event Form */}
              {showAddTimeline && (
                <form
                  onSubmit={handleAddTimelineEvent}
                  className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 animate-in fade-in"
                >
                  <div className="text-[11px] font-bold text-emerald-950 uppercase">
                    Adicionar Nova Atualização / Encaminhamento
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newTimelineAcao}
                      onChange={(e) => setNewTimelineAcao(e.target.value)}
                      placeholder="Ex: Responsável da Farmácia contatado..."
                      className="w-full text-xs p-2 bg-white rounded-xl border border-slate-300 font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      value={newTimelineDesc}
                      onChange={(e) => setNewTimelineDesc(e.target.value)}
                      placeholder="Observações complementares (opcional)..."
                      rows={2}
                      className="w-full text-xs p-2 bg-white rounded-xl border border-slate-300"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={newTimelineStatus}
                      onChange={(e) => setNewTimelineStatus(e.target.value as any)}
                      className="text-xs p-2 bg-white rounded-xl border border-slate-300 font-semibold text-slate-800 flex-1"
                    >
                      <option value="">Manter status atual ({detailItem.status})</option>
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          Mudar para: {st}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-3 py-2 rounded-xl"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              )}

              {/* Timeline Items */}
              <div className="space-y-2 border-l-2 border-emerald-700 ml-2 pl-3 pt-1">
                {(detailItem.timeline || []).map((tl) => (
                  <div key={tl.id} className="text-xs space-y-0.5">
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                      <span>{tl.timestamp}</span>
                      <span>•</span>
                      <span className="font-sans font-semibold text-slate-600">{tl.usuarioNome}</span>
                    </div>
                    <div className="font-bold text-slate-800 leading-snug">{tl.acao}</div>
                    {tl.descricao && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded-lg">
                        {tl.descricao}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Formal Report Copy Helper & Module Opener */}
            {detailItem.resultado === 'NOTIFICACAO_FORMAL' && (
              <div className="p-3.5 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-950 uppercase">
                  <span className="flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span>Módulo de Notificação Formal</span>
                  </span>
                  {detailItem.encaminhadoOficial && (
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md">
                      Encaminhado
                    </span>
                  )}
                </div>

                {onOpenNotificacaoFormal && (
                  <button
                    onClick={() => {
                      const item = detailItem;
                      setDetailItem(null);
                      onOpenNotificacaoFormal(item);
                    }}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Abrir Módulo de Notificação Formal</span>
                  </button>
                )}

                <div className="text-[11px] text-slate-700 whitespace-pre-wrap font-sans bg-white p-2.5 rounded-xl border border-amber-200 leading-relaxed max-h-36 overflow-y-auto">
                  {detailItem.relatoNotificacao || detailItem.historiaFormatada}
                </div>

                <button
                  onClick={() => handleCopyText(detailItem.relatoNotificacao || detailItem.historiaFormatada || '')}
                  className="w-full py-2 bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold text-xs uppercase rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                >
                  {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-800" /> : <Copy className="w-3.5 h-3.5 text-amber-900" />}
                  <span>{copiedSuccess ? 'Relato copiado. Realize o encaminhamento no sistema institucional.' : 'Copiar Relato'}</span>
                </button>
              </div>
            )}

            {actionFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-semibold text-center">
                {actionFeedback}
              </div>
            )}

            {/* Governance Action Row */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowSolicitarCorrecao(true)}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
              >
                <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                <span>Solicitar Correção à Gestão</span>
              </button>

              <button
                onClick={() => setDetailItem(null)}
                className="w-full py-3 bg-slate-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs"
              >
                Fechar Painel do Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Solicitar Correção Modal */}
      {showSolicitarCorrecao && detailItem && (
        <SolicitarCorrecaoModal
          currentUser={currentUser}
          registro={detailItem}
          onClose={() => setShowSolicitarCorrecao(false)}
          onSuccess={() => {
            setActionFeedback('Solicitação de correção enviada à Gestão com sucesso.');
            setTimeout(() => setActionFeedback(null), 4000);
          }}
        />
      )}
    </div>
  );
};
