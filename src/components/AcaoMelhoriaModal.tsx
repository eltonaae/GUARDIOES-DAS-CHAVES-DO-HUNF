import React, { useState } from 'react';
import {
  AcaoMelhoria,
  AcaoStatus,
  AcaoPrioridade,
  AcaoComplexidade,
  AcaoResponsavelTipo,
  TipoBarreira,
  TipoEvidencia,
  EficaciaResultado,
  User,
  SituacaoRegistro,
  ChaveType,
} from '../types';
import {
  calcularDiasRestantesAcao,
  salvarNovaAcaoMelhoria,
  adicionarAcompanhamentoAcaoMelhoria,
  submeterEvidenciaConclusaoAcao,
  validarConclusaoAcaoMelhoria,
  avaliarEficaciaAcaoMelhoria,
  atualizarConfiguracaoAcaoMelhoria,
  vincularRegistroAcaoExistente,
  getAllRegistros,
} from '../utils/storage';
import {
  X,
  PlusCircle,
  Clock,
  User as UserIcon,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  HelpCircle,
  Link as LinkIcon,
  DollarSign,
  History,
  RotateCcw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface AcaoMelhoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  registroOrigem?: SituacaoRegistro | null;
  acaoSelecionada?: AcaoMelhoria | null;
  onAcaoSalva: (acao: AcaoMelhoria) => void;
}

export const AcaoMelhoriaModal: React.FC<AcaoMelhoriaModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  registroOrigem,
  acaoSelecionada,
  onAcaoSalva,
}) => {
  const isEditingExisting = !!acaoSelecionada;

  // Active sub-tab inside detail modal
  const [modalTab, setModalTab] = useState<'detalhes' | 'acompanhar' | 'evidencia' | 'validar' | 'eficacia' | 'historico'>('detalhes');

  // Form State for Creation / Config
  const [titulo, setTitulo] = useState(acaoSelecionada?.titulo || '');
  const [problema, setProblema] = useState(
    acaoSelecionada?.problemaIdentificado || registroOrigem?.oQueAconteceu || ''
  );
  const [melhoriaProposta, setMelhoriaProposta] = useState(acaoSelecionada?.melhoriaProposta || '');
  const [resultadoEsperado, setResultadoEsperado] = useState(acaoSelecionada?.resultadoEsperado || '');

  const [responsavelTipo, setResponsavelTipo] = useState<AcaoResponsavelTipo>(
    acaoSelecionada?.responsavelTipo || 'Responsável do setor'
  );
  const [responsavelNome, setResponsavelNome] = useState(
    acaoSelecionada?.responsavelNome || (registroOrigem?.userSetor ? `Liderança - ${registroOrigem.userSetor}` : '')
  );
  const [responsavelSetor, setResponsavelSetor] = useState(
    acaoSelecionada?.responsavelSetor || registroOrigem?.ondeAconteceu?.[0] || currentUser.setor
  );

  const [prazoTipo, setPrazoTipo] = useState<'data' | 'dias' | 'sem_prazo'>(
    acaoSelecionada?.prazoTipo || 'data'
  );
  const [prazoData, setPrazoData] = useState(acaoSelecionada?.prazoData || '');
  const [prioridade, setPrioridade] = useState<AcaoPrioridade>(
    acaoSelecionada?.prioridade || 'MÉDIA'
  );
  const [complexidade, setComplexidade] = useState<AcaoComplexidade>(
    acaoSelecionada?.complexidade || 'SIMPLES'
  );
  const [exigeInvestimento, setExigeInvestimento] = useState<'SIM' | 'NÃO' | 'NÃO SEI'>(
    acaoSelecionada?.exigeInvestimento || 'NÃO'
  );

  const [chaves, setChaves] = useState<ChaveType[]>(
    acaoSelecionada?.chaves || registroOrigem?.chaves || ['Segurança']
  );

  // Form State for Progress Follow-up (Acompanhamento)
  const [acompTexto, setAcompTexto] = useState('');
  const [acompAndamento, setAcompAndamento] = useState<'Em andamento' | 'Concluído' | 'Aguardando' | 'Bloqueado'>('Em andamento');
  const [acompTemBarreira, setAcompTemBarreira] = useState(false);
  const [acompTipoBarreira, setAcompTipoBarreira] = useState<TipoBarreira>('Dependência de outro setor');
  const [acompDescBarreira, setAcompDescBarreira] = useState('');

  // Form State for Evidence & Case
  const [evidTipo, setEvidTipo] = useState<TipoEvidencia>('Processo alterado');
  const [evidDescricao, setEvidDescricao] = useState(acaoSelecionada?.evidencia?.descricao || '');
  const [antesComoEra, setAntesComoEra] = useState(acaoSelecionada?.antesDepois?.comoEra || '');
  const [antesOQueMudou, setAntesOQueMudou] = useState(acaoSelecionada?.antesDepois?.oQueFoiAlterado || '');
  const [antesComoFicou, setAntesComoFicou] = useState(acaoSelecionada?.antesDepois?.comoFicou || '');

  // Form State for Validation
  const [validacaoDecisao, setValidacaoDecisao] = useState<'VALIDADA' | 'AJUSTE_SOLICITADO'>('VALIDADA');
  const [validacaoParecer, setValidacaoParecer] = useState('');
  const [validacaoMotivoAjuste, setValidacaoMotivoAjuste] = useState('');

  // Form State for Efficacy
  const [eficaciaResultado, setEficaciaResultado] = useState<EficaciaResultado>(
    acaoSelecionada?.eficacia?.resultado || 'SIM'
  );
  const [eficaciaEvidencia, setEficaciaEvidencia] = useState(
    acaoSelecionada?.eficacia?.evidenciaDemonstrada || ''
  );

  // Form State for Linking additional records
  const [selectedRegToLink, setSelectedRegToLink] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAcao = acaoSelecionada;
  const isManager = currentUser.role === 'manager' || currentUser.isAdmin;
  const prazoCalc = currentAcao ? calcularDiasRestantesAcao(currentAcao.prazoData) : calcularDiasRestantesAcao(prazoData);

  const handleToggleChave = (chave: ChaveType) => {
    if (chaves.includes(chave)) {
      if (chaves.length > 1) {
        setChaves(chaves.filter((c) => c !== chave));
      }
    } else {
      setChaves([...chaves, chave]);
    }
  };

  const handleSetQuickDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setPrazoData(`${yyyy}-${mm}-${dd}`);
    setPrazoTipo('data');
  };

  const handleCreateAcao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('Por favor, informe o que precisa melhorar.');
      return;
    }

    const saved = salvarNovaAcaoMelhoria(
      {
        titulo: titulo.trim(),
        problemaIdentificado: problema.trim() || 'Não informado',
        melhoriaProposta: melhoriaProposta.trim(),
        resultadoEsperado: resultadoEsperado.trim(),
        responsavelTipo,
        responsavelNome: responsavelNome.trim() || 'A definir',
        responsavelSetor: responsavelSetor.trim() || currentUser.setor,
        prazoTipo,
        prazoData: prazoTipo === 'sem_prazo' ? undefined : prazoData,
        prioridade,
        complexidade,
        exigeInvestimento,
        chaves,
        setores: [responsavelSetor || currentUser.setor],
        localPrincipal: responsavelSetor || currentUser.setor,
        origemDescricao: registroOrigem ? `Registro ${registroOrigem.id}` : 'Oportunidade Direta',
      },
      currentUser,
      registroOrigem || undefined
    );

    setFeedbackSuccess('Ação de melhoria criada com sucesso!');
    onAcaoSalva(saved);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleAddAcompanhamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAcao || !acompTexto.trim()) return;

    const updated = adicionarAcompanhamentoAcaoMelhoria(
      currentAcao.id,
      {
        oQueFoiFeito: acompTexto.trim(),
        andamento: acompAndamento,
        temBarreira: acompTemBarreira,
        tipoBarreira: acompTemBarreira ? acompTipoBarreira : undefined,
        descricaoBarreira: acompTemBarreira ? acompDescBarreira.trim() : undefined,
      },
      currentUser
    );

    if (updated) {
      setAcompTexto('');
      setAcompDescBarreira('');
      setAcompTemBarreira(false);
      setFeedbackSuccess('Acompanhamento registrado com sucesso!');
      onAcaoSalva(updated);
      setTimeout(() => setFeedbackSuccess(null), 2500);
    }
  };

  const handleSubmitEvidencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAcao || !evidDescricao.trim()) {
      alert('Por favor, descreva a evidência comprobatória.');
      return;
    }

    const updated = submeterEvidenciaConclusaoAcao(
      currentAcao.id,
      {
        evidencia: {
          tipo: evidTipo,
          descricao: evidDescricao.trim(),
          dataHora: new Date().toLocaleString('pt-BR'),
          registradoPorNome: currentUser.nome,
        },
        antesDepois: {
          comoEra: antesComoEra.trim() || undefined,
          oQueFoiAlterado: antesOQueMudou.trim() || undefined,
          comoFicou: antesComoFicou.trim() || undefined,
        },
      },
      currentUser
    );

    if (updated) {
      setFeedbackSuccess('Evidência submetida! Ação enviada para validação.');
      onAcaoSalva(updated);
      setTimeout(() => {
        setFeedbackSuccess(null);
        setModalTab('detalhes');
      }, 1500);
    }
  };

  const handleValidarConclusao = (decisao: 'VALIDADA' | 'AJUSTE_SOLICITADO') => {
    if (!currentAcao) return;
    if (decisao === 'AJUSTE_SOLICITADO' && !validacaoMotivoAjuste.trim()) {
      alert('Por favor, explique o motivo do ajuste solicitado.');
      return;
    }

    const updated = validarConclusaoAcaoMelhoria(
      currentAcao.id,
      {
        decisao,
        parecer: validacaoParecer.trim() || undefined,
        motivoAjuste: validacaoMotivoAjuste.trim() || undefined,
      },
      currentUser
    );

    if (updated) {
      if (decisao === 'VALIDADA') {
        setFeedbackSuccess('Melhoria concluída. ✓ Agora precisamos observar se ela se sustenta na rotina.');
      } else {
        setFeedbackSuccess('Ajuste solicitado. Ação retornou para Em Andamento.');
      }
      onAcaoSalva(updated);
      setTimeout(() => {
        setFeedbackSuccess(null);
        setModalTab('detalhes');
      }, 2500);
    }
  };

  const handleAvaliarEficacia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAcao) return;
    if (eficaciaResultado !== 'AINDA NÃO É POSSÍVEL AVALIAR' && !eficaciaEvidencia.trim()) {
      alert('Por favor, descreva a evidência que demonstra se a melhoria funcionou.');
      return;
    }

    const updated = avaliarEficaciaAcaoMelhoria(
      currentAcao.id,
      eficaciaResultado,
      eficaciaEvidencia.trim() || 'Em observação institucional.',
      currentUser
    );

    if (updated) {
      setFeedbackSuccess('Avaliação de eficácia registrada com sucesso!');
      onAcaoSalva(updated);
      setTimeout(() => {
        setFeedbackSuccess(null);
        setModalTab('detalhes');
      }, 2000);
    }
  };

  const handleVincularOutroRegistro = () => {
    if (!currentAcao || !selectedRegToLink) return;
    const updated = vincularRegistroAcaoExistente(currentAcao.id, selectedRegToLink, currentUser);
    if (updated) {
      setFeedbackSuccess(`Registro ${selectedRegToLink} vinculado à ação!`);
      setSelectedRegToLink('');
      onAcaoSalva(updated);
      setTimeout(() => setFeedbackSuccess(null), 2500);
    }
  };

  const allSystemRegs = getAllRegistros();
  const availableToLink = allSystemRegs.filter(
    (r) => r.id !== currentAcao?.registroOrigemId && !currentAcao?.registrosRelacionadosIds?.includes(r.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-200 border border-emerald-600/40">
                {isEditingExisting ? currentAcao.id : '# NOVA AÇÃO'}
              </span>
              <span className="text-xs font-semibold text-emerald-100">
                Ciclo de Melhoria Contínua
              </span>
            </div>
            <h2 className="text-base font-black mt-0.5 text-white tracking-tight">
              {isEditingExisting ? currentAcao.titulo : 'CRIAR AÇÃO DE MELHORIA'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-700/60 text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Feedback Banner */}
        {feedbackSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 flex items-center space-x-2 text-emerald-900 text-xs font-bold animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* If Creating New Action */}
          {!isEditingExisting && (
            <form onSubmit={handleCreateAcao} className="space-y-4">
              {/* Context Origin Tag */}
              {registroOrigem && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-start space-x-2.5">
                  <LinkIcon className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-slate-700">
                      Vínculo de Origem: <span className="font-mono text-emerald-800">{registroOrigem.id}</span> ({registroOrigem.classificacaoPreliminar})
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                      "{registroOrigem.oQueAconteceu}"
                    </p>
                  </div>
                </div>
              )}

              {/* 1. O QUE PRECISA MELHORAR? */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1">
                  1. O QUE PRECISA MELHORAR? *
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Implementar alerta de dupla checagem na prescrição eletrônica"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white font-medium"
                />
              </div>

              {/* 2. QUAL É O PROBLEMA? */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1">
                  2. QUAL É O PROBLEMA? (Contexto)
                </label>
                <textarea
                  rows={2}
                  value={problema}
                  onChange={(e) => setProblema(e.target.value)}
                  placeholder="Descreva o problema identificado na rotina ou no registro original..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                />
              </div>

              {/* 3. QUAL É A MELHORIA PROPOSTA? */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1">
                  3. QUAL É A MELHORIA PROPOSTA?
                </label>
                <textarea
                  rows={2}
                  value={melhoriaProposta}
                  onChange={(e) => setMelhoriaProposta(e.target.value)}
                  placeholder="Ex: Configurar alerta pop-up no sistema MV e reforçar protocolo de enfermagem..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                />
              </div>

              {/* 4. QUAL É O RESULTADO ESPERADO? */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1">
                  4. QUAL É O RESULTADO ESPERADO?
                </label>
                <input
                  type="text"
                  value={resultadoEsperado}
                  onChange={(e) => setResultadoEsperado(e.target.value)}
                  placeholder="Ex: Reduzir divergências entre prescrição e etiqueta antes da administração."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 bg-white"
                />
              </div>

              {/* 5. RESPONSÁVEL */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                    5. QUEM PRECISA CONDUZIR ESSA AÇÃO?
                  </label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(['Responsável do setor', 'Liderança', 'Qualidade', 'Outro responsável', 'A definir'] as AcaoResponsavelTipo[]).map(
                    (tipo) => (
                      <button
                        type="button"
                        key={tipo}
                        onClick={() => setResponsavelTipo(tipo)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                          responsavelTipo === tipo
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tipo}
                      </button>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Nome / Função do Responsável
                    </label>
                    <input
                      type="text"
                      value={responsavelNome}
                      onChange={(e) => setResponsavelNome(e.target.value)}
                      placeholder="Ex: Coordenação de Enfermagem PA"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                      Setor / Área de Ação
                    </label>
                    <input
                      type="text"
                      value={responsavelSetor}
                      onChange={(e) => setResponsavelSetor(e.target.value)}
                      placeholder="Ex: Pronto Atendimento"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 italic bg-amber-50 p-2 rounded border border-amber-200">
                  ℹ️ <strong>Nota institucional:</strong> O Guardião não deve necessariamente ser o responsável pela execução. Ele pode ser o identificador e acompanhante da oportunidade.
                </p>
              </div>

              {/* 6. PRAZO & CONTAGEM */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  6. QUANDO DEVE SER CONCLUÍDO?
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetQuickDays(7)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700"
                  >
                    + 7 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDays(15)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700"
                  >
                    + 15 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetQuickDays(30)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700"
                  >
                    + 30 dias
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPrazoTipo('sem_prazo');
                      setPrazoData('');
                    }}
                    className={`px-2.5 py-1 rounded border text-[11px] font-bold ${
                      prazoTipo === 'sem_prazo'
                        ? 'bg-slate-800 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Sem prazo definido (sob avaliação)
                  </button>
                </div>

                {prazoTipo !== 'sem_prazo' && (
                  <div className="pt-1 flex items-center space-x-3">
                    <input
                      type="date"
                      value={prazoData}
                      onChange={(e) => {
                        setPrazoData(e.target.value);
                        setPrazoTipo('data');
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                    />
                    {prazoData && (
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                        ⏳ {prazoCalc.texto}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 7. PRIORIDADE & COMPLEXIDADE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                    PRIORIDADE
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['BAIXA', 'MÉDIA', 'ALTA'] as AcaoPrioridade[]).map((pri) => (
                      <button
                        type="button"
                        key={pri}
                        onClick={() => setPrioridade(pri)}
                        className={`py-1.5 rounded-lg text-[10px] font-extrabold border transition-colors ${
                          prioridade === pri
                            ? pri === 'ALTA'
                              ? 'bg-rose-700 text-white border-rose-800'
                              : pri === 'MÉDIA'
                              ? 'bg-amber-600 text-white border-amber-700'
                              : 'bg-emerald-700 text-white border-emerald-800'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pri === 'BAIXA' ? '🟢 BAIXA' : pri === 'MÉDIA' ? '🟡 MÉDIA' : '🔴 ALTA'}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Considera risco, urgência, recorrência e impacto institucional.
                  </p>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                    COMPLEXIDADE
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['SIMPLES', 'MODERADA', 'COMPLEXA'] as AcaoComplexidade[]).map((comp) => (
                      <button
                        type="button"
                        key={comp}
                        onClick={() => setComplexidade(comp)}
                        className={`py-1.5 rounded-lg text-[10px] font-extrabold border transition-colors ${
                          complexidade === comp
                            ? 'bg-slate-800 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {comp}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {complexidade === 'SIMPLES'
                      ? 'Resolvido no próprio processo.'
                      : complexidade === 'MODERADA'
                      ? 'Alinhamento intersetorial.'
                      : 'Exige mudança de sistema, investimento ou gestão.'}
                  </p>
                </div>
              </div>

              {/* 8. CUSTO & INVESTIMENTO FINANCEIRO */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                  8. ESSA MELHORIA EXIGE INVESTIMENTO FINANCEIRO?
                </label>
                <div className="flex items-center space-x-2">
                  {(['NÃO', 'SIM', 'NÃO SEI'] as const).map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setExigeInvestimento(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        exigeInvestimento === opt
                          ? opt === 'SIM'
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-slate-800 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {exigeInvestimento === 'SIM' && (
                  <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg flex items-start space-x-2 text-amber-900">
                    <DollarSign className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold">
                        Necessita avaliação de investimento
                      </p>
                      <p className="text-[10px] text-amber-800">
                        Essa ação precisará ser avaliada pela liderança e comitê gestor responsável antes da execução.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 9. CHAVES ASSOCIADAS */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wide mb-1">
                  CHAVES ASSOCIADAS
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(['Segurança', 'Humanização', 'Eficiência', 'Excelência'] as ChaveType[]).map(
                    (chave) => (
                      <button
                        type="button"
                        key={chave}
                        onClick={() => handleToggleChave(chave)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          chaves.includes(chave)
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {chave}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>SALVAR E CRIAR AÇÃO DE MELHORIA</span>
                </button>
              </div>
            </form>
          )}

          {/* If Viewing / Updating Existing Action */}
          {isEditingExisting && currentAcao && (
            <div className="space-y-4">
              {/* Top Overview Badges Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    STATUS
                  </span>
                  <span
                    className={`inline-block font-extrabold text-[11px] px-2 py-0.5 rounded-md mt-0.5 ${
                      currentAcao.status === 'CONCLUÍDA'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : currentAcao.status === 'EM VALIDAÇÃO'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300'
                        : currentAcao.status === 'ATRASADA'
                        ? 'bg-rose-100 text-rose-900 border border-rose-300'
                        : currentAcao.status === 'AGUARDANDO'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : currentAcao.status === 'EM ANDAMENTO'
                        ? 'bg-sky-100 text-sky-900 border border-sky-300'
                        : 'bg-slate-100 text-slate-800 border border-slate-300'
                    }`}
                  >
                    {currentAcao.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    PRIORIDADE
                  </span>
                  <span
                    className={`inline-block font-bold text-[11px] px-2 py-0.5 rounded-md mt-0.5 ${
                      currentAcao.prioridade === 'ALTA'
                        ? 'text-rose-700 bg-rose-50'
                        : currentAcao.prioridade === 'MÉDIA'
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-emerald-700 bg-emerald-50'
                    }`}
                  >
                    {currentAcao.prioridade === 'ALTA' ? '🔴 ALTA' : currentAcao.prioridade === 'MÉDIA' ? '🟡 MÉDIA' : '🟢 BAIXA'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    RESPONSÁVEL
                  </span>
                  <span className="font-bold text-slate-800 text-[11px] block truncate mt-0.5">
                    {currentAcao.responsavelNome || 'A definir'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    PRAZO
                  </span>
                  <span
                    className={`font-bold text-[11px] block truncate mt-0.5 ${
                      prazoCalc.statusPrazo === 'atrasada'
                        ? 'text-rose-700'
                        : prazoCalc.statusPrazo === 'vence_hoje'
                        ? 'text-amber-700'
                        : 'text-slate-800'
                    }`}
                  >
                    {currentAcao.prazoData
                      ? `${new Date(currentAcao.prazoData + 'T00:00:00').toLocaleDateString('pt-BR')} (${prazoCalc.texto})`
                      : 'Sem prazo'}
                  </span>
                </div>
              </div>

              {/* Barriers Banner if any */}
              {currentAcao.barreirasIdentificadas && currentAcao.barreirasIdentificadas.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-start space-x-2 text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wide">
                      Barreiras Sistêmicas Identificadas
                    </p>
                    <p className="text-[11px] text-rose-800 font-medium">
                      {currentAcao.barreirasIdentificadas.join(' • ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Sub-Tabs */}
              <div className="flex border-b border-slate-200 space-x-1 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setModalTab('detalhes')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 ${
                    modalTab === 'detalhes'
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Visão Geral
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('acompanhar')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 flex items-center space-x-1 ${
                    modalTab === 'acompanhar'
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>Acompanhamento</span>
                  {currentAcao.acompanhamentos?.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-200 text-slate-800">
                      {currentAcao.acompanhamentos.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('evidencia')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 ${
                    modalTab === 'evidencia'
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Evidência / Case
                </button>

                {/* Validation tab (Highlighted if manager or in validation) */}
                <button
                  type="button"
                  onClick={() => setModalTab('validar')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 flex items-center space-x-1 ${
                    modalTab === 'validar'
                      ? 'bg-purple-800 text-white'
                      : currentAcao.status === 'EM VALIDAÇÃO'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>Validação</span>
                  {currentAcao.status === 'EM VALIDAÇÃO' && (
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  )}
                </button>

                {/* Efficacy Tab */}
                <button
                  type="button"
                  onClick={() => setModalTab('eficacia')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 ${
                    modalTab === 'eficacia'
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Eficácia
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab('historico')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 ${
                    modalTab === 'historico'
                      ? 'bg-emerald-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Trilha
                </button>
              </div>

              {/* Sub-Tab 1: Detalhes & Visão Geral */}
              {modalTab === 'detalhes' && (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Problema Identificado
                      </span>
                      <p className="text-xs text-slate-800 font-medium mt-0.5">
                        {currentAcao.problemaIdentificado}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Melhoria Proposta
                      </span>
                      <p className="text-xs text-slate-800 font-medium mt-0.5">
                        {currentAcao.melhoriaProposta || 'Não especificado'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        Resultado Esperado
                      </span>
                      <p className="text-xs text-slate-800 font-medium mt-0.5">
                        {currentAcao.resultadoEsperado || 'Não especificado'}
                      </p>
                    </div>
                  </div>

                  {/* Origin & Related Records */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Registros e Recorrência Vinculados
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentAcao.registroOrigemId && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-mono font-bold text-[11px]">
                          Principal: {currentAcao.registroOrigemId}
                        </span>
                      )}
                      {currentAcao.registrosRelacionadosIds
                        ?.filter((id) => id !== currentAcao.registroOrigemId)
                        .map((relId) => (
                          <span
                            key={relId}
                            className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300 font-mono text-[11px]"
                          >
                            Recorrente: {relId}
                          </span>
                        ))}
                    </div>

                    {/* Quick Link another registration */}
                    {isManager && availableToLink.length > 0 && (
                      <div className="pt-2 flex items-center space-x-2">
                        <select
                          value={selectedRegToLink}
                          onChange={(e) => setSelectedRegToLink(e.target.value)}
                          className="px-2 py-1 text-[11px] rounded-lg border border-slate-300 bg-white"
                        >
                          <option value="">+ Vincular registro recorrente...</option>
                          {availableToLink.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.id} - {r.ondeAconteceu?.[0]} ({r.quandoAconteceu})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleVincularOutroRegistro}
                          disabled={!selectedRegToLink}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white"
                        >
                          Vincular
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary of Conclusion if Validated */}
                  {currentAcao.status === 'CONCLUÍDA' && (
                    <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl space-y-2 text-emerald-950">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span className="font-extrabold text-xs text-emerald-900">
                          AÇÃO CONCLUÍDA COM SUCESSO
                        </span>
                      </div>
                      <p className="text-[11px]">
                        <strong>Data de Conclusão:</strong> {currentAcao.dataConclusao || 'Registrada'} {currentAcao.concluidaNoPrazo ? '✓ No prazo' : '⚠️ Fora do prazo'}
                      </p>
                      {currentAcao.evidencia && (
                        <p className="text-[11px]">
                          <strong>Evidência Validada:</strong> {currentAcao.evidencia.tipo} — "{currentAcao.evidencia.descricao}"
                        </p>
                      )}
                      <p className="text-[10px] text-emerald-800 italic">
                        "Melhoria concluída. Agora precisamos observar se ela se sustenta na rotina."
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 2: Acompanhamento */}
              {modalTab === 'acompanhar' && (
                <div className="space-y-4">
                  {/* Form to add progress update */}
                  <form onSubmit={handleAddAcompanhamento} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide block">
                      Registrar Andamento
                    </span>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        O que foi feito? *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={acompTexto}
                        onChange={(e) => setAcompTexto(e.target.value)}
                        placeholder="Descreva as medidas tomadas, alinhamentos ou ações práticas..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Qual é o andamento?
                        </label>
                        <select
                          value={acompAndamento}
                          onChange={(e) => setAcompAndamento(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                        >
                          <option value="Em andamento">Em andamento</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Aguardando">Aguardando</option>
                          <option value="Bloqueado">Bloqueado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Existe alguma barreira?
                        </label>
                        <div className="flex space-x-1 pt-0.5">
                          <button
                            type="button"
                            onClick={() => setAcompTemBarreira(false)}
                            className={`px-3 py-1 text-xs rounded-lg font-bold border ${
                              !acompTemBarreira
                                ? 'bg-slate-800 text-white border-slate-900'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            NÃO
                          </button>
                          <button
                            type="button"
                            onClick={() => setAcompTemBarreira(true)}
                            className={`px-3 py-1 text-xs rounded-lg font-bold border ${
                              acompTemBarreira
                                ? 'bg-rose-700 text-white border-rose-800'
                                : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            SIM
                          </button>
                        </div>
                      </div>
                    </div>

                    {acompTemBarreira && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg space-y-2">
                        <label className="block text-[10px] font-extrabold text-rose-900 uppercase">
                          O QUE ESTÁ IMPEDINDO A CONCLUSÃO?
                        </label>
                        <select
                          value={acompTipoBarreira}
                          onChange={(e) => setAcompTipoBarreira(e.target.value as TipoBarreira)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg border border-rose-300 bg-white font-medium"
                        >
                          <option value="Falta de recurso">Falta de recurso</option>
                          <option value="Falta de aprovação">Falta de aprovação</option>
                          <option value="Dependência de outro setor">Dependência de outro setor</option>
                          <option value="Necessidade de treinamento">Necessidade de treinamento</option>
                          <option value="Necessidade de mudança de processo">Necessidade de mudança de processo</option>
                          <option value="Necessidade de sistema/tecnologia">Necessidade de sistema/tecnologia</option>
                          <option value="Necessidade de investimento">Necessidade de investimento</option>
                          <option value="Falta de definição de responsável">Falta de definição de responsável</option>
                          <option value="Outro">Outro</option>
                        </select>
                        <input
                          type="text"
                          value={acompDescBarreira}
                          onChange={(e) => setAcompDescBarreira(e.target.value)}
                          placeholder="Detalhes adicionais do impedimento..."
                          className="w-full px-2 py-1 text-xs rounded-lg border border-rose-300 bg-white"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2 px-3 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider"
                    >
                      Salvar Acompanhamento
                    </button>
                  </form>

                  {/* List of Previous updates */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide block">
                      Histórico de Andamento
                    </span>
                    {(!currentAcao.acompanhamentos || currentAcao.acompanhamentos.length === 0) && (
                      <p className="text-xs text-slate-500 italic p-3 text-center">
                        Nenhum apontamento de andamento registrado ainda.
                      </p>
                    )}
                    {currentAcao.acompanhamentos?.map((acomp) => (
                      <div key={acomp.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-bold text-slate-700">{acomp.autorNome}</span>
                          <span>{acomp.dataHora}</span>
                        </div>
                        <p className="text-xs text-slate-800 font-medium">{acomp.oQueFoiFeito}</p>
                        <div className="flex items-center space-x-2 pt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {acomp.andamento}
                          </span>
                          {acomp.temBarreira && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-200">
                              ⚠️ Barreira: {acomp.tipoBarreira}
                            </span>
                          )}
                        </div>
                        {acomp.descricaoBarreira && (
                          <p className="text-[10px] text-rose-800 italic mt-0.5">
                            "{acomp.descricaoBarreira}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Evidência / Case (Como sabemos que foi feito?) */}
              {modalTab === 'evidencia' && (
                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide block">
                        COMO SABEMOS QUE FOI FEITO? *
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Ações institucionais exigem evidência mínima para comprovação antes da conclusão.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Tipo de Evidência
                      </label>
                      <select
                        value={evidTipo}
                        onChange={(e) => setEvidTipo(e.target.value as TipoEvidencia)}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                      >
                        <option value="Processo alterado">Processo alterado</option>
                        <option value="Orientação realizada">Orientação realizada</option>
                        <option value="Treinamento realizado">Treinamento realizado</option>
                        <option value="Documento atualizado">Documento atualizado</option>
                        <option value="Checklist implementado">Checklist implementado</option>
                        <option value="Fluxo alterado">Fluxo alterado</option>
                        <option value="Comunicação realizada">Comunicação realizada</option>
                        <option value="Indicador acompanhado">Indicador acompanhado</option>
                        <option value="Evidência anexada">Evidência anexada</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Descreva a Evidência *
                      </label>
                      <textarea
                        rows={2}
                        value={evidDescricao}
                        onChange={(e) => setEvidDescricao(e.target.value)}
                        placeholder="Ex: Treinamento ministrado para 100% da equipe e checklist de checagem fixado no posto..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {/* Antes e Depois (Transformar em Case de Melhoria) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide block">
                      ANTES E DEPOIS (Case de Melhoria)
                    </span>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Como era?
                      </label>
                      <input
                        type="text"
                        value={antesComoEra}
                        onChange={(e) => setAntesComoEra(e.target.value)}
                        placeholder="Ex: Materiais dispersos sem identificação visual clara..."
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        O que foi alterado?
                      </label>
                      <input
                        type="text"
                        value={antesOQueMudou}
                        onChange={(e) => setAntesOQueMudou(e.target.value)}
                        placeholder="Ex: Implantação de etiquetas Kanban e demarcação de gavetas..."
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Como ficou?
                      </label>
                      <input
                        type="text"
                        value={antesComoFicou}
                        onChange={(e) => setAntesComoFicou(e.target.value)}
                        placeholder="Ex: Acesso em menos de 10 segundos e controle visual imediato..."
                        className="w-full px-2 py-1 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {currentAcao.status !== 'CONCLUÍDA' && (
                    <button
                      type="button"
                      onClick={handleSubmitEvidencia}
                      className="w-full py-2.5 px-4 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                    >
                      Submeter Evidência para Validação
                    </button>
                  )}
                </div>
              )}

              {/* Sub-Tab 4: Validação pela Gestão */}
              {modalTab === 'validar' && (
                <div className="space-y-3">
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-xl space-y-2 text-purple-950">
                    <span className="text-xs font-extrabold uppercase tracking-wide block text-purple-900">
                      PARECER DA GESTÃO & VALIDAÇÃO
                    </span>
                    <p className="text-[11px] text-purple-900">
                      O Gestor ou responsável autorizado avalia as evidências apresentadas para validar o encerramento da ação.
                    </p>

                    {currentAcao.evidencia && (
                      <div className="bg-white p-2.5 rounded-lg border border-purple-200 space-y-1 text-slate-800">
                        <span className="text-[10px] font-bold text-purple-800 uppercase block">
                          Evidência Apresentada ({currentAcao.evidencia.tipo}):
                        </span>
                        <p className="text-xs font-medium">{currentAcao.evidencia.descricao}</p>
                        <span className="text-[10px] text-slate-400 block">
                          Enviado por {currentAcao.evidencia.registradoPorNome} em {currentAcao.evidencia.dataHora}
                        </span>
                      </div>
                    )}
                  </div>

                  {isManager ? (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                          Parecer do Gestor (Opcional)
                        </label>
                        <textarea
                          rows={2}
                          value={validacaoParecer}
                          onChange={(e) => setValidacaoParecer(e.target.value)}
                          placeholder="Ex: Ação validada com êxito e evidência documental consistente..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleValidarConclusao('VALIDADA')}
                          className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>✓ VALIDAR CONCLUSÃO</span>
                        </button>

                        <div className="space-y-1">
                          <input
                            type="text"
                            value={validacaoMotivoAjuste}
                            onChange={(e) => setValidacaoMotivoAjuste(e.target.value)}
                            placeholder="Motivo do ajuste necessário..."
                            className="w-full px-2 py-1 text-xs rounded-lg border border-rose-300 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleValidarConclusao('AJUSTE_SOLICITADO')}
                            className="w-full py-1.5 px-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 font-bold text-[11px] uppercase flex items-center justify-center space-x-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>↩ Solicitar Ajuste</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg">
                      🔒 A validação formal de conclusão é reservada aos gestores e lideranças autorizadas.
                    </p>
                  )}
                </div>
              )}

              {/* Sub-Tab 5: Avaliação de Eficácia */}
              {modalTab === 'eficacia' && (
                <form onSubmit={handleAvaliarEficacia} className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide block">
                        A MELHORIA FUNCIONOU? (EFICÁCIA)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Concluir uma ação não significa necessariamente que ela produziu o efeito esperado.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      {(['SIM', 'PARCIALMENTE', 'NÃO', 'AINDA NÃO É POSSÍVEL AVALIAR'] as EficaciaResultado[]).map(
                        (res) => (
                          <button
                            type="button"
                            key={res}
                            onClick={() => setEficaciaResultado(res)}
                            className={`p-2 rounded-lg text-[11px] font-bold border transition-colors ${
                              eficaciaResultado === res
                                ? res === 'SIM'
                                  ? 'bg-emerald-800 text-white border-emerald-900'
                                  : res === 'PARCIALMENTE'
                                  ? 'bg-amber-600 text-white border-amber-700'
                                  : res === 'NÃO'
                                  ? 'bg-rose-700 text-white border-rose-800'
                                  : 'bg-slate-800 text-white border-slate-900'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {res}
                          </button>
                        )
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                        Qual evidência demonstra isso?
                      </label>
                      <textarea
                        rows={2}
                        value={eficaciaEvidencia}
                        onChange={(e) => setEficaciaEvidencia(e.target.value)}
                        placeholder="Ex: Não houve registro de divergência nos últimos 30 dias na unidade..."
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  {isManager ? (
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider"
                    >
                      Salvar Avaliação de Eficácia
                    </button>
                  ) : (
                    <p className="text-xs text-slate-500 italic p-2 bg-slate-50 rounded-lg">
                      🔒 A avaliação de eficácia institucional é realizada periodicamente pela Qualidade/Gestão.
                    </p>
                  )}
                </form>
              )}

              {/* Sub-Tab 6: Trilha de Auditoria */}
              {modalTab === 'historico' && (
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide block">
                    Linha do Tempo Imutável
                  </span>
                  <div className="space-y-1.5">
                    {currentAcao.timeline?.map((ev) => (
                      <div key={ev.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-bold text-slate-700">{ev.usuarioNome}</span>
                          <span>{ev.timestamp}</span>
                        </div>
                        <p className="font-semibold text-slate-800 mt-0.5">{ev.acao}</p>
                        {ev.descricao && <p className="text-[11px] text-slate-600 mt-0.5">{ev.descricao}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
