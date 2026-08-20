import React, { useState } from 'react';
import {
  User,
  SituacaoRegistro,
  ChaveType,
  ImpactoType,
  RegistroStatus,
  TimelineEvent,
  ComunicacaoResponsavel,
} from '../types';
import {
  classificarSituacaoInteligente,
  gerarHistoriaOcorrencia,
  gerarRelatoNarrativoNotificacao,
} from '../utils/historyGenerator';
import { detectPersonalData } from '../utils/security';
import { VoiceTextInput } from '../components/VoiceTextInput';
import {
  Check,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Lock,
  PhoneCall,
  Sparkles,
  Users,
  Compass,
  CornerDownRight,
  Clock,
  Send,
} from 'lucide-react';

interface SituacaoFormViewProps {
  currentUser: User;
  onSubmit: (item: SituacaoRegistro) => void;
  onCancel: () => void;
  onOpenNotificacaoFormal?: (reg: SituacaoRegistro) => void;
  onOpenCriarAcao?: (registroOrigem?: SituacaoRegistro) => void;
}

const LOCAIS_PADRAO = [
  'Unidade de Internação',
  'UTI Adulto',
  'Pronto Atendimento',
  'Centro Cirúrgico',
  'Farmácia Central',
  'Recepção / Acolhimento',
];

const CHAVES_PADRAO: ChaveType[] = ['Segurança', 'Humanização', 'Eficiência', 'Excelência'];

const IMPACTOS_PADRAO: ImpactoType[] = [
  'Paciente',
  'Família/Acompanhante',
  'Equipe',
  'Processo',
  'Outro',
];

// All possible immediate action options grouped by type
const ACOES_DISPONIVEIS = {
  COMUNICAR: [
    'Comunicar responsável pelo setor',
    'Comunicar liderança imediata',
    'Acionar Qualidade',
    'Acionar Núcleo de Segurança do Paciente (NSP)',
    'Acionar outro responsável',
  ],
  CONTER: [
    'Interromper ou conter situação de risco imediatamente',
    'Retirar processo/equipamento/material de uso',
    'Corrigir imediatamente o fluxo de trabalho',
  ],
  ORIENTAR: [
    'Orientar colaborador sobre o processo correto',
    'Reforçar procedimento/protocolo institucional',
    'Orientar equipe do plantão',
  ],
  REGISTRAR: [
    'Registrar evidência objetiva',
    'Registrar oportunidade de melhoria contínua',
    'Registrar boa prática para multiplicação',
  ],
  ENCAMINHAR: [
    'Preparar notificação de Segurança do Paciente',
    'Criar ação de melhoria de processo',
    'Encaminhar para responsável do processo/Qualidade',
  ],
};

export const SituacaoFormView: React.FC<SituacaoFormViewProps> = ({
  currentUser,
  onSubmit,
  onCancel,
  onOpenNotificacaoFormal,
}) => {
  const [step, setStep] = useState<number>(1);

  // =========================================================
  // FORM STATE
  // =========================================================

  // Step 1: Observar (O que, onde, quando, contexto, risco imediato)
  const [oQueAconteceu, setOQueAconteceu] = useState('');
  const [ondeAconteceu, setOndeAconteceu] = useState<string[]>([]);
  const [ondeOutroChecked, setOndeOutroChecked] = useState(false);
  const [ondeOutroTexto, setOndeOutroTexto] = useState('');
  const [quandoAconteceu, setQuandoAconteceu] = useState(() => {
    const now = new Date();
    const isoStr = now.toISOString().slice(0, 16);
    return isoStr.replace('T', ' ');
  });
  const [contextoSituacao, setContextoSituacao] = useState('');
  const [riscoImediato, setRiscoImediato] = useState<boolean>(false);
  const [showRiscoModal, setShowRiscoModal] = useState<boolean>(false);

  // Step 2: Chaves & Impactos
  const [selectedChaves, setSelectedChaves] = useState<ChaveType[]>([]);
  const [selectedImpactos, setSelectedImpactos] = useState<ImpactoType[]>([]);
  const [impactoOutroDetalhe, setImpactoOutroDetalhe] = useState('');

  // Step 3: Caracterização (Relação com Paciente / Near Miss / Processo)
  const [relacaoPaciente, setRelacaoPaciente] = useState<boolean>(false);
  const [chegouAoPaciente, setChegouAoPaciente] = useState<'SIM' | 'NÃO' | 'NÃO DETERMINADO'>('NÃO');
  const [possibilidadeAtingirPaciente, setPossibilidadeAtingirPaciente] = useState<boolean>(false);
  const [barreiraInterceptadora, setBarreiraInterceptadora] = useState('');
  const [houveImpacto, setHouveImpacto] = useState<'SIM' | 'NÃO' | 'NÃO DETERMINADO'>('NÃO');
  const [houveDano, setHouveDano] = useState<'SIM' | 'NÃO' | 'NÃO DETERMINADO'>('NÃO');
  const [faixaEtaria, setFaixaEtaria] = useState<'Recém-nascido' | 'Pediátrico' | 'Adulto' | 'Idoso'>('Adulto');
  const [grauDanoImpacto, setGrauDanoImpacto] = useState<'Nenhum' | 'Leve' | 'Moderado' | 'Grave'>('Nenhum');
  const [leitoQuarto, setLeitoQuarto] = useState('');
  const [processoEquipamentoImpactado, setProcessoEquipamentoImpactado] = useState('');

  // Step 4: Motor de Ações Imediatas & Encaminhamento
  const [acoesImediatasSelecionadas, setAcoesImediatasSelecionadas] = useState<string[]>([]);
  const [acaoImediataFeita, setAcaoImediataFeita] = useState('');
  const [acaoMelhoriaProposta, setAcaoMelhoriaProposta] = useState('');
  
  // Orientação ao colega
  const [orientacaoRealizada, setOrientacaoRealizada] = useState<'SIM' | 'NÃO' | 'NÃO FOI POSSÍVEL' | ''>('');
  const [orientacaoResultado, setOrientacaoResultado] = useState<'Corrigido' | 'Parcialmente corrigido' | 'Permanece pendente' | ''>('');

  // Comunicação ao responsável
  const [showComunicacaoForm, setShowComunicacaoForm] = useState(false);
  const [quemComunicado, setQuemComunicado] = useState<'Responsável pelo setor' | 'Liderança imediata' | 'Qualidade' | 'NSP' | 'Outro'>('Responsável pelo setor');
  const [quemComunicadoOutro, setQuemComunicadoOutro] = useState('');
  const [quandoComunicado, setQuandoComunicado] = useState(() => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [observacaoComunicacao, setObservacaoComunicacao] = useState('');

  // Encaminhamento e Próximo Passo
  const [necessitaAvaliacaoPost, setNecessitaAvaliacaoPost] = useState(false);
  const [responsavelAreaDestino, setResponsavelAreaDestino] = useState('');
  const [proximoPassoObrigatorio, setProximoPassoObrigatorio] = useState('');

  // Complementos
  const [envolvidosTestemunhas, setEnvolvidosTestemunhas] = useState('');
  const [evidenciaNome, setEvidenciaNome] = useState('');

  // Completed outcome state
  const [completedRegistro, setCompletedRegistro] = useState<SituacaoRegistro | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Dynamic preview calculation
  const previewDraft: Partial<SituacaoRegistro> = {
    oQueAconteceu,
    ondeAconteceu,
    quandoAconteceu,
    contextoSituacao,
    riscoImediato,
    chaves: selectedChaves,
    impactos: selectedImpactos,
    relacaoPaciente,
    chegouAoPaciente: relacaoPaciente ? chegouAoPaciente : undefined,
    possibilidadeAtingirPaciente: relacaoPaciente && chegouAoPaciente === 'NÃO' ? possibilidadeAtingirPaciente : false,
    barreiraInterceptadora,
    houveImpacto: relacaoPaciente ? houveImpacto : undefined,
    houveDano: relacaoPaciente ? houveDano : undefined,
    faixaEtaria: relacaoPaciente ? faixaEtaria : undefined,
    grauDanoImpacto: relacaoPaciente ? grauDanoImpacto : undefined,
  };

  const engineAnalysis = classificarSituacaoInteligente(previewDraft);

  // Handlers for Multiple Selection Checkboxes
  const toggleLocal = (local: string) => {
    setOndeAconteceu((prev) =>
      prev.includes(local) ? prev.filter((l) => l !== local) : [...prev, local]
    );
  };

  const toggleChave = (chave: ChaveType) => {
    setSelectedChaves((prev) =>
      prev.includes(chave) ? prev.filter((c) => c !== chave) : [...prev, chave]
    );
  };

  const toggleImpacto = (impacto: ImpactoType) => {
    setSelectedImpactos((prev) =>
      prev.includes(impacto) ? prev.filter((i) => i !== impacto) : [...prev, impacto]
    );
  };

  const toggleAcaoImediata = (acao: string) => {
    setAcoesImediatasSelecionadas((prev) =>
      prev.includes(acao) ? prev.filter((a) => a !== acao) : [...prev, acao]
    );
  };

  // Step Validation
  const isStep1Valid =
    oQueAconteceu.trim().length >= 8 &&
    (ondeAconteceu.length > 0 || (ondeOutroChecked && ondeOutroTexto.trim().length > 0)) &&
    quandoAconteceu.trim().length > 0;

  const isStep2Valid = selectedChaves.length > 0 && selectedImpactos.length > 0;

  const isStep3Valid = true;

  // Step 4 requires at least one immediate action or proposal + required next step
  const isStep4Valid =
    acoesImediatasSelecionadas.length > 0 ||
    acaoImediataFeita.trim().length >= 3 ||
    acaoMelhoriaProposta.trim().length >= 3;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenciaNome(e.target.files[0].name);
    }
  };

  // Immediate Risk toggle handler
  const handleToggleRisco = (isRisco: boolean) => {
    setRiscoImediato(isRisco);
    if (isRisco) {
      setShowRiscoModal(true);
      // Auto pre-select immediate containment action
      if (!acoesImediatasSelecionadas.includes('Interromper ou conter situação de risco imediatamente')) {
        setAcoesImediatasSelecionadas((prev) => [
          'Interromper ou conter situação de risco imediatamente',
          'Comunicar responsável pelo setor',
          ...prev,
        ]);
      }
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep4Valid) return;

    let finalLocais = [...ondeAconteceu];
    if (ondeOutroChecked && ondeOutroTexto.trim()) {
      finalLocais.push(`Outro: ${ondeOutroTexto.trim()}`);
    }

    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const isoTime = now.toISOString().slice(0, 16).replace('T', ' ');
    const idGen = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const comunicacaoObj: ComunicacaoResponsavel | undefined = showComunicacaoForm
      ? {
          quem: quemComunicado,
          quemOutro: quemComunicado === 'Outro' ? quemComunicadoOutro : undefined,
          quando: quandoComunicado,
          observacao: observacaoComunicacao.trim() || undefined,
        }
      : undefined;

    const initialTimeline: TimelineEvent[] = [
      {
        id: `tl-1-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        usuarioCargo: currentUser.cargo,
        usuarioRole: currentUser.role,
        acao: 'Situação identificada e registrada pelo Guardião',
        statusResultante: 'Registrado',
      },
      {
        id: `tl-2-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        acao: `Chaves mapeadas: ${selectedChaves.join(', ')}`,
      },
      {
        id: `tl-3-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        acao: `Classificação preliminar: ${engineAnalysis.classificacaoPreliminar}`,
        statusResultante: engineAnalysis.statusSugerido,
      },
    ];

    if (riscoImediato) {
      initialTimeline.push({
        id: `tl-risk-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        acao: 'Risco imediato sinalizado no setor — Ação de contenção iniciada',
        statusResultante: 'Ação imediata',
      });
    }

    if (comunicacaoObj) {
      initialTimeline.push({
        id: `tl-com-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        acao: `Responsável comunicado: ${comunicacaoObj.quem}${comunicacaoObj.observacao ? ` (${comunicacaoObj.observacao})` : ''}`,
        statusResultante: 'Aguardando responsável',
      });
    }

    if (orientacaoRealizada === 'SIM') {
      initialTimeline.push({
        id: `tl-ori-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        acao: `Orientação entre pares realizada (Resultado: ${orientacaoResultado || 'Corrigido'})`,
      });
    }

    const nextStepDeterminado =
      proximoPassoObrigatorio ||
      (engineAnalysis.resultado === 'NOTIFICACAO_FORMAL'
        ? 'Preparar notificação no sistema oficial de Segurança do Paciente'
        : 'Acompanhar oportunidade de melhoria junto à liderança');

    initialTimeline.push({
      id: `tl-next-${Date.now()}`,
      timestamp: dateFormatted,
      usuarioNome: currentUser.nome,
      acao: `Próximo passo definido: ${nextStepDeterminado}`,
      statusResultante: engineAnalysis.statusSugerido,
    });

    const newRegistro: SituacaoRegistro = {
      id: idGen,
      userId: currentUser.id,
      userName: currentUser.nome,
      userCargo: currentUser.cargo,
      userMatricula: currentUser.matricula,
      userSetor: currentUser.setor,
      oQueAconteceu: oQueAconteceu.trim(),
      ondeAconteceu: finalLocais,
      ondeAconteceuOutro: ondeOutroTexto.trim() || undefined,
      quandoAconteceu,
      contextoSituacao: contextoSituacao.trim() || undefined,
      riscoImediato,
      chaves: selectedChaves,
      impactos: selectedImpactos,
      impactoOutroDetalhe: impactoOutroDetalhe.trim() || undefined,
      relacaoPaciente,
      chegouAoPaciente: relacaoPaciente ? chegouAoPaciente : undefined,
      possibilidadeAtingirPaciente: relacaoPaciente && chegouAoPaciente === 'NÃO' ? possibilidadeAtingirPaciente : false,
      barreiraInterceptadora: barreiraInterceptadora.trim() || undefined,
      houveImpacto: relacaoPaciente ? houveImpacto : undefined,
      houveDano: relacaoPaciente ? houveDano : undefined,
      faixaEtaria: relacaoPaciente ? faixaEtaria : undefined,
      grauDanoImpacto: relacaoPaciente ? grauDanoImpacto : undefined,
      leitoQuarto: relacaoPaciente ? leitoQuarto.trim() : undefined,
      processoEquipamentoImpactado: !relacaoPaciente ? processoEquipamentoImpactado.trim() : undefined,
      classificacaoPreliminar: engineAnalysis.classificacaoPreliminar,
      acoesImediatasSelecionadas,
      acaoImediataFeita: acaoImediataFeita.trim() || undefined,
      acaoMelhoriaProposta: acaoMelhoriaProposta.trim() || undefined,
      proximoPasso: nextStepDeterminado,
      responsavelAreaDestino: responsavelAreaDestino.trim() || (showComunicacaoForm ? quemComunicado : undefined),
      orientacaoRealizada: orientacaoRealizada || undefined,
      orientacaoResultado: orientacaoResultado || undefined,
      comunicacaoResponsavel: comunicacaoObj,
      notificadoChefia: showComunicacaoForm,
      envolvidosTestemunhas: envolvidosTestemunhas.trim() || undefined,
      evidenciaNome: evidenciaNome || undefined,
      resultado: engineAnalysis.resultado,
      motivoTriagem: engineAnalysis.motivoTriagem,
      dataCriacao: isoTime,
      status: engineAnalysis.statusSugerido,
      timeline: initialTimeline,
    };

    if (engineAnalysis.resultado === 'NOTIFICACAO_FORMAL') {
      newRegistro.relatoNotificacao = gerarRelatoNarrativoNotificacao(newRegistro);
      newRegistro.relatoNotificacaoOriginal = newRegistro.relatoNotificacao;
      newRegistro.historiaFormatada = gerarHistoriaOcorrencia(newRegistro);
    }

    onSubmit(newRegistro);
    setCompletedRegistro(newRegistro);
  };

  const handleCopyHistoria = () => {
    const textToCopy = completedRegistro?.relatoNotificacao || completedRegistro?.historiaFormatada;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    }
  };

  // =========================================================
  // COMPLETED OUTCOME SCREEN (O QUE ACONTECE AGORA + CTA)
  // =========================================================
  if (completedRegistro) {
    const isFormal = completedRegistro.resultado === 'NOTIFICACAO_FORMAL';
    const dynamicCTA = engineAnalysis.ctaDinamico;
    const oQueAcontece = engineAnalysis.oQueAconteceAgora;

    return (
      <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-4 font-sans animate-in fade-in duration-200">
        {/* Banner do Resultado com Classificação Preliminar */}
        <div
          className={`rounded-3xl p-5 border text-white shadow-md space-y-2.5 ${
            isFormal
              ? 'bg-amber-900 border-amber-700'
              : 'bg-emerald-800 border-emerald-700'
          }`}
        >
          <div className="flex items-center space-x-2">
            {isFormal ? (
              <AlertTriangle className="w-6 h-6 text-amber-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
            )}
            <h2 className="text-base font-extrabold uppercase tracking-tight">
              {completedRegistro.classificacaoPreliminar}
            </h2>
          </div>

          <p className="text-xs text-slate-100 font-medium leading-relaxed">
            {completedRegistro.motivoTriagem}
          </p>

          <p className="text-[11px] text-amber-200/90 font-medium border-t border-white/20 pt-1.5">
            * A classificação oficial deverá seguir o fluxo institucional de Segurança do Paciente.
          </p>

          <div className="flex items-center justify-between text-[11px] bg-black/25 p-2.5 rounded-xl mt-2 font-mono">
            <span>ID: {completedRegistro.id}</span>
            <span className="bg-white/20 text-white font-sans font-bold px-2 py-0.5 rounded-md text-[10px] uppercase">
              Status: {completedRegistro.status}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* O QUE ACONTECE AGORA? BOX */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-emerald-800 shrink-0" />
            <h3 className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
              {oQueAcontece.titulo}
            </h3>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            O Guardião apoia, orienta e sinaliza. Veja as ações orientadas a partir deste momento:
          </p>

          <div className="space-y-2">
            {oQueAcontece.itens.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
              >
                <span className="shrink-0 text-xs">
                  {item.cor === 'red' && '🔴'}
                  {item.cor === 'amber' && '🟠'}
                  {item.cor === 'emerald' && '🟢'}
                  {item.cor === 'blue' && '🔵'}
                  {item.cor === 'purple' && '🟣'}
                </span>
                <span className="leading-snug">{item.texto}</span>
              </div>
            ))}
          </div>

          {/* Institutional reminder banner */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 font-medium leading-relaxed">
            <strong>Lembrete Guardião:</strong> Você não é responsável pela resolução integral de todos os problemas. Seu papel é observar, sinalizar, apoiar, acionar e acompanhar.
          </div>
        </div>

        {/* CTA DINÂMICO PRINCIPAL: PREPARAR NOTIFICAÇÃO (APARECE QUANDO HOUVER INDICAÇÃO FORMAL) */}
        {isFormal && onOpenNotificacaoFormal && (
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-500 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-amber-950 uppercase flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                <span>Módulo de Notificação Formal</span>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                Fluxo Oficial
              </span>
            </div>

            <p className="text-[11px] text-slate-600">
              O sistema organizou os dados fornecidos em um relato cronológico pronto para revisão e cópia para o sistema institucional.
            </p>

            <button
              onClick={() => onOpenNotificacaoFormal(completedRegistro)}
              className="w-full py-4 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 active:scale-95 border border-emerald-600"
            >
              <Send className="w-4 h-4" />
              <span>PREPARAR NOTIFICAÇÃO</span>
            </button>

            <button
              onClick={handleCopyHistoria}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-200 flex items-center justify-center space-x-1.5"
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>Relato copiado. Realize o encaminhamento no sistema institucional.</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>Copiar Relato Diretamente</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Resumo da Linha do Tempo Automática */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">
              Histórico Inicial da Linha do Tempo
            </h4>
          </div>

          <div className="space-y-2 border-l-2 border-emerald-600 ml-2 pl-3">
            {completedRegistro.timeline.map((event) => (
              <div key={event.id} className="text-xs space-y-0.5">
                <div className="text-[10px] font-mono text-slate-400">{event.timestamp}</div>
                <div className="font-bold text-slate-800">{event.acao}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Conclusão */}
        <button
          onClick={onCancel}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all"
        >
          Concluir e Voltar ao Início
        </button>
      </div>
    );
  }

  // =========================================================
  // MULTI-STEP FORM FLOW
  // =========================================================
  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-4 font-sans">
      {/* Header & Flow Indicator */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
              REGISTRO & AÇÃO IMEDIATA
            </h2>
          </div>
          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full uppercase">
            Etapa {step} de 4
          </span>
        </div>

        {/* Subtitle with Guardian Philosophy */}
        <div className="text-[11px] text-slate-500 font-medium">
          Observar → Conter / Orientar → Comunicar → Encaminhar → Registrar → Acompanhar
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-emerald-700' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: SITUAÇÃO DE RISCO IMEDIATO (ALERTA PRIORITÁRIO)    */}
      {/* ========================================================= */}
      {showRiscoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 border-2 border-red-500 space-y-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-7 h-7 shrink-0 animate-bounce" />
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-red-700">
                  🔴 AÇÃO IMEDIATA NECESSÁRIA
                </h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Intervenção prioritária
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-950 leading-relaxed font-semibold space-y-2">
              <p>“Esta situação apresenta um risco que pode exigir intervenção imediata.”</p>
              <p className="text-[11px] text-red-800 font-normal">
                <strong>Orientação:</strong> Não aguarde o fechamento deste registro para agir. O registro no aplicativo <u>NÃO</u> substitui uma ação de contenção real no setor.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowComunicacaoForm(true);
                  setShowRiscoModal(false);
                }}
                className="w-full py-3 px-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm flex items-center justify-center space-x-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>COMUNICAR RESPONSÁVEL AGORA</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuemComunicado('Qualidade');
                  setShowComunicacaoForm(true);
                  setShowRiscoModal(false);
                }}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
              >
                <Shield className="w-4 h-4 text-amber-400" />
                <span>ACIONAR QUALIDADE / NSP</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRiscoModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Continuar preenchendo o registro
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleFinalSubmit}>
        {/* ========================================================= */}
        {/* ETAPA 1: OBSERVAR (O QUE, ONDE, QUANDO & RISCO ATUAL)     */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                1. OBSERVAÇÃO DOS FATOS
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Descreva com clareza o que foi observado, sem culpabilização.
              </p>
            </div>

            {/* O QUE ACONTECEU? (COM GRAVAÇÃO POR VOZ) */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                O QUE ACONTECEU? <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Relate os fatos e a etapa do processo afetada:
              </p>
              <VoiceTextInput
                id="input-o-que-aconteceu"
                value={oQueAconteceu}
                onChange={setOQueAconteceu}
                placeholder="Ex: Durante a conferência de materiais no leito, notou-se discrepância no lote..."
                rows={4}
                required
              />

              {/* Real-time LGPD Privacy Alert Banner */}
              {(() => {
                const pii = detectPersonalData(oQueAconteceu);
                if (!pii.hasPossiblePII) return null;
                return (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1 text-amber-950 animate-in fade-in duration-200">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>Recomendação de Privacidade & LGPD</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {pii.suggestion} (Identificadores detectados: {pii.reasons.join(', ')}).
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* ALERTA DE RISCO IMEDIATO / ATUAL */}
            <div className="pt-2 border-t border-slate-100">
              <label
                className={`flex items-start space-x-3 p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  riscoImediato
                    ? 'bg-red-50 border-red-500 text-red-950 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={riscoImediato}
                  onChange={(e) => handleToggleRisco(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500"
                />
                <div>
                  <span className="block font-black text-red-700 uppercase">
                    🔴 Esta situação apresenta risco atual que exige intervenção imediata?
                  </span>
                  <span className="block text-[11px] font-normal text-slate-600 mt-0.5">
                    Marque caso haja risco em andamento que precise de contenção agora.
                  </span>
                </div>
              </label>
            </div>

            {/* ONDE ACONTECEU? (SELEÇÃO MÚLTIPLA) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                ONDE ACONTECEU? <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Selecione um ou mais setores/locais envolvidos:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {LOCAIS_PADRAO.map((local) => {
                  const isChecked = ondeAconteceu.includes(local);
                  return (
                    <label
                      key={local}
                      className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleLocal(local)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>{local}</span>
                    </label>
                  );
                })}
              </div>

              {/* OPÇÃO OUTRO LOCAL */}
              <div className="pt-1">
                <label
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    ondeOutroChecked
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={ondeOutroChecked}
                    onChange={(e) => setOndeOutroChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>Outro setor / local não listado</span>
                </label>

                {ondeOutroChecked && (
                  <div className="mt-2">
                    <VoiceTextInput
                      value={ondeOutroTexto}
                      onChange={setOndeOutroTexto}
                      placeholder="Especifique o setor ou local..."
                      isSingleLine
                    />
                  </div>
                )}
              </div>
            </div>

            {/* QUANDO ACONTECEU? */}
            <div className="space-y-1 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                QUANDO ACONTECEU? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={quandoAconteceu}
                onChange={(e) => setQuandoAconteceu(e.target.value)}
                placeholder="Ex: 2026-08-20 14:30"
                className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 text-slate-800 font-semibold"
              />
            </div>

            {/* CONTEXTO DA SITUAÇÃO */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                CONTEXTO OPERACIONAL (OPCIONAL)
              </label>
              <p className="text-[11px] text-slate-500">
                Informações de rotina (ex: passagem de plantão, pico de atendimentos):
              </p>
              <VoiceTextInput
                id="input-contexto"
                value={contextoSituacao}
                onChange={setContextoSituacao}
                placeholder="Ex: Momento de alta demanda no setor..."
                rows={2}
              />
            </div>

            {/* Ações da Etapa 1 */}
            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <span>Próxima Etapa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ETAPA 2: CHAVES E IMPACTOS (SELEÇÃO MÚLTIPLA)             */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                2. CHAVES E PÚBLICO IMPACTADO
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Classifique os pilares e as partes afetadas.
              </p>
            </div>

            {/* CHAVES RELACIONADAS (SELEÇÃO MÚLTIPLA) */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                CHAVES RELACIONADAS <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {CHAVES_PADRAO.map((chave) => {
                  const isChecked = selectedChaves.includes(chave);
                  return (
                    <label
                      key={chave}
                      className={`flex items-center space-x-2.5 p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleChave(chave)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 shrink-0"
                      />
                      <span>{chave.toUpperCase()}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* QUEM FOI OU PODERIA SER IMPACTADO? (SELEÇÃO MÚLTIPLA) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                QUEM FOI OU PODERIA SER IMPACTADO? <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 gap-2">
                {IMPACTOS_PADRAO.map((imp) => {
                  const isChecked = selectedImpactos.includes(imp);
                  return (
                    <label
                      key={imp}
                      className={`flex items-center space-x-3 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleImpacto(imp)}
                        className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>{imp}</span>
                    </label>
                  );
                })}

                {selectedImpactos.includes('Outro') && (
                  <div className="mt-1">
                    <VoiceTextInput
                      value={impactoOutroDetalhe}
                      onChange={setImpactoOutroDetalhe}
                      placeholder="Especifique o outro impacto..."
                      isSingleLine
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
              >
                <span>Próxima Etapa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ETAPA 3: CARACTERIZAÇÃO OBJETIVA / NEAR MISS / LGPD-SAFE  */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                3. CARACTERIZAÇÃO DA SITUAÇÃO
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Critérios objetivos para direcionar as ações imediatas.
              </p>
            </div>

            {/* RELAÇÃO COM PACIENTE */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                A SITUAÇÃO POSSUI RELAÇÃO COM PACIENTE? <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRelacaoPaciente(true)}
                  className={`py-3 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-2 border ${
                    relacaoPaciente
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Check className={`w-4 h-4 ${relacaoPaciente ? 'opacity-100' : 'opacity-0'}`} />
                  <span>SIM</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRelacaoPaciente(false)}
                  className={`py-3 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-2 border ${
                    !relacaoPaciente
                      ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Check className={`w-4 h-4 ${!relacaoPaciente ? 'opacity-100' : 'opacity-0'}`} />
                  <span>NÃO</span>
                </button>
              </div>
            </div>

            {/* CONDICIONAL: SE SIM (PERGUNTAS LGPD-SAFE & NEAR MISS) */}
            {relacaoPaciente ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="text-xs font-extrabold text-slate-800 uppercase">
                  DESFECHO ASSISTENCIAL E INTERCEPTAÇÃO
                </div>

                {/* Chegou ao Paciente? */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    A situação chegou a atingir o paciente?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                    {(['SIM', 'NÃO', 'NÃO DETERMINADO'] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setChegouAoPaciente(opt)}
                        className={`py-2 rounded-xl border text-[11px] transition-all ${
                          chegouAoPaciente === opt
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Se NÃO chegou ao paciente: Verificar Possível Near Miss */}
                {chegouAoPaciente === 'NÃO' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                    <label className="text-[11px] font-bold text-amber-950 block">
                      🟠 Existia possibilidade real de atingir o paciente se não houvesse intervenção?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPossibilidadeAtingirPaciente(true)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          possibilidadeAtingirPaciente
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        SIM (Possível Near Miss)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPossibilidadeAtingirPaciente(false)}
                        className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                          !possibilidadeAtingirPaciente
                            ? 'bg-slate-700 text-white border-slate-800'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        NÃO
                      </button>
                    </div>

                    {possibilidadeAtingirPaciente && (
                      <div className="space-y-1 pt-1">
                        <label className="text-[10px] font-bold text-amber-900 uppercase block">
                          Qual barreira de segurança interceptou a falha?
                        </label>
                        <VoiceTextInput
                          value={barreiraInterceptadora}
                          onChange={setBarreiraInterceptadora}
                          placeholder="Ex: Dupla checagem antes da administração, conferência na pulseira..."
                          isSingleLine
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Se SIM chegou ao paciente: Dano & Impacto */}
                {chegouAoPaciente === 'SIM' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Houve impacto ou dano ao paciente?
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                        {(['SIM', 'NÃO', 'NÃO DETERMINADO'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setHouveImpacto(opt)}
                            className={`py-2 rounded-xl border text-[11px] transition-all ${
                              houveImpacto === opt
                                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Faixa Etária:
                        </label>
                        <select
                          value={faixaEtaria}
                          onChange={(e) => setFaixaEtaria(e.target.value as any)}
                          className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-800"
                        >
                          <option value="Recém-nascido">Recém-nascido</option>
                          <option value="Pediátrico">Pediátrico</option>
                          <option value="Adulto">Adulto</option>
                          <option value="Idoso">Idoso</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Grau de Dano/Impacto:
                        </label>
                        <select
                          value={grauDanoImpacto}
                          onChange={(e) => setGrauDanoImpacto(e.target.value as any)}
                          className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold text-slate-800"
                        >
                          <option value="Nenhum">Nenhum Dano</option>
                          <option value="Leve">Dano Leve</option>
                          <option value="Moderado">Dano Moderado</option>
                          <option value="Grave">Dano Grave</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        Localização / Leito no Setor (sem nomes):
                      </label>
                      <VoiceTextInput
                        value={leitoQuarto}
                        onChange={setLeitoQuarto}
                        placeholder="Ex: Leito 204 B ou Box 3"
                        isSingleLine
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* CONDICIONAL: SE NÃO TEM RELAÇÃO COM PACIENTE */
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block">
                  Especifique o processo, equipamento, insumo ou rotina afetada:
                </label>
                <VoiceTextInput
                  value={processoEquipamentoImpactado}
                  onChange={setProcessoEquipamentoImpactado}
                  placeholder="Ex: Fluxo de conferência de estoque, equipamento X..."
                  isSingleLine
                />
              </div>
            )}

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
              <button
                type="button"
                disabled={!isStep3Valid}
                onClick={() => {
                  // Auto seed suggested actions based on classification
                  if (acoesImediatasSelecionadas.length === 0) {
                    setAcoesImediatasSelecionadas(engineAnalysis.acoesSugeridas.slice(0, 2));
                  }
                  setStep(4);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
              >
                <span>Próxima Etapa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ETAPA 4: MOTOR DE AÇÕES IMEDIATAS & ENCAMINHAMENTO        */}
        {/* ========================================================= */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                4. MOTOR DE AÇÕES IMEDIATAS & ENCAMINHAMENTO
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina o que foi feito agora e o próximo encaminhamento.
              </p>
            </div>

            {/* Preliminary Classification Guidance Badge */}
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold space-y-1 ${
                engineAnalysis.resultado === 'NOTIFICACAO_FORMAL'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center space-x-1.5 uppercase">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>{engineAnalysis.classificacaoPreliminar}</span>
              </div>
              <p className="text-[11px] font-normal text-slate-600">
                {engineAnalysis.motivoTriagem}
              </p>
            </div>

            {/* MÚLTIPLAS AÇÕES IMEDIATAS DISPONÍVEIS */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                AÇÕES IMEDIATAS ADOTADAS / RECOMENDADAS <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Selecione uma ou mais ações adotadas no momento da observação:
              </p>

              {/* Grouped Accordions/Categories */}
              <div className="space-y-3">
                {/* 1. COMUNICAR */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    📢 COMUNICAR
                  </div>
                  <div className="space-y-1.5">
                    {ACOES_DISPONIVEIS.COMUNICAR.map((acao) => {
                      const isChecked = acoesImediatasSelecionadas.includes(acao);
                      return (
                        <label
                          key={acao}
                          className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAcaoImediata(acao)}
                            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                          />
                          <span>{acao}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. CONTER */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    🛑 CONTER
                  </div>
                  <div className="space-y-1.5">
                    {ACOES_DISPONIVEIS.CONTER.map((acao) => {
                      const isChecked = acoesImediatasSelecionadas.includes(acao);
                      return (
                        <label
                          key={acao}
                          className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAcaoImediata(acao)}
                            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                          />
                          <span>{acao}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. ORIENTAR */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    🤝 ORIENTAR ENTRE PARES
                  </div>
                  <div className="space-y-1.5">
                    {ACOES_DISPONIVEIS.ORIENTAR.map((acao) => {
                      const isChecked = acoesImediatasSelecionadas.includes(acao);
                      return (
                        <label
                          key={acao}
                          className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAcaoImediata(acao)}
                            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                          />
                          <span>{acao}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 4. ENCAMINHAR & REGISTRAR */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
                    📋 ENCAMINHAR & REGISTRAR
                  </div>
                  <div className="space-y-1.5">
                    {[...ACOES_DISPONIVEIS.REGISTRAR, ...ACOES_DISPONIVEIS.ENCAMINHAR].map((acao) => {
                      const isChecked = acoesImediatasSelecionadas.includes(acao);
                      return (
                        <label
                          key={acao}
                          className={`flex items-center space-x-2.5 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-400 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAcaoImediata(acao)}
                            className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                          />
                          <span>{acao}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 1: AÇÃO IMEDIATA (O que foi feito agora para conter/corrigir/comunicar) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                AÇÃO IMEDIATA (O QUE FOI FEITO AGORA)
              </label>
              <p className="text-[11px] text-slate-500">
                Ação direta realizada para conter ou corrigir no momento (ex: "Medicação foi retirada antes da administração"):
              </p>
              <VoiceTextInput
                id="input-acao-imediata"
                value={acaoImediataFeita}
                onChange={setAcaoImediataFeita}
                placeholder="Descreva a ação imediata realizada..."
                rows={2}
              />
            </div>

            {/* SITUAÇÃO EM QUE O GUARDIÃO PODE ORIENTAR */}
            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs">
                <Users className="w-4 h-4 text-emerald-800" />
                <span>🟢 ORIENTAÇÃO ENTRE COLEGAS (SE SEGURO E APROPRIADO)</span>
              </div>
              <p className="text-[11px] text-slate-600">
                “Se for seguro e apropriado, oriente o colega sobre o processo correto.”
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Você realizou a orientação?
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                  {(['SIM', 'NÃO', 'NÃO FOI POSSÍVEL'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setOrientacaoRealizada(opt)}
                      className={`py-2 rounded-xl border text-[11px] transition-all ${
                        orientacaoRealizada === opt
                          ? 'bg-emerald-800 text-white border-emerald-900'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {orientacaoRealizada === 'SIM' && (
                <div className="pt-1 space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Qual foi o resultado da orientação?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                    {(['Corrigido', 'Parcialmente corrigido', 'Permanece pendente'] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setOrientacaoResultado(res)}
                        className={`py-2 px-1 rounded-xl border text-[10px] transition-all text-center leading-tight ${
                          orientacaoResultado === res
                            ? 'bg-emerald-700 text-white border-emerald-800 font-bold'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* COMUNICAÇÃO AO RESPONSÁVEL */}
            <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 uppercase">
                  🟡 COMUNICAÇÃO AO RESPONSÁVEL
                </span>
                <button
                  type="button"
                  onClick={() => setShowComunicacaoForm(!showComunicacaoForm)}
                  className="text-[11px] font-bold text-amber-900 underline"
                >
                  {showComunicacaoForm ? 'Ocultar' : '+ Registrar Comunicação'}
                </button>
              </div>

              {showComunicacaoForm && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Quem foi comunicado?
                    </label>
                    <select
                      value={quemComunicado}
                      onChange={(e) => setQuemComunicado(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 font-semibold text-slate-800"
                    >
                      <option value="Responsável pelo setor">Responsável pelo setor</option>
                      <option value="Liderança imediata">Liderança imediata</option>
                      <option value="Qualidade">Qualidade</option>
                      <option value="NSP">Núcleo de Segurança do Paciente (NSP)</option>
                      <option value="Outro">Outro responsável</option>
                    </select>
                  </div>

                  {quemComunicado === 'Outro' && (
                    <VoiceTextInput
                      value={quemComunicadoOutro}
                      onChange={setQuemComunicadoOutro}
                      placeholder="Especifique a área ou cargo..."
                      isSingleLine
                    />
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Quando foi comunicado?
                    </label>
                    <input
                      type="text"
                      value={quandoComunicado}
                      onChange={(e) => setQuandoComunicado(e.target.value)}
                      className="w-full text-xs p-2 bg-white rounded-xl border border-slate-300 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Observação (Opcional):
                    </label>
                    <VoiceTextInput
                      value={observacaoComunicacao}
                      onChange={setObservacaoComunicacao}
                      placeholder="Ex: Informado pessoalmente ao enfermeiro de plantão..."
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 2: AÇÃO DE MELHORIA (O que será feito para evitar recorrência) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                AÇÃO DE MELHORIA (EVITAR RECORRÊNCIA)
              </label>
              <p className="text-[11px] text-slate-500">
                Ajuste estrutural sugerido (ex: "Revisar fluxo de conferência entre Farmácia e UTI"):
              </p>
              <VoiceTextInput
                id="input-acao-melhoria"
                value={acaoMelhoriaProposta}
                onChange={setAcaoMelhoriaProposta}
                placeholder="Descreva a sugestão de melhoria para o processo..."
                rows={2}
              />
            </div>

            {/* INVESTIGAÇÃO POSTERIOR / NECESSITA AVALIAÇÃO */}
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
              <div className="flex items-center space-x-2 text-blue-950 font-bold text-xs">
                <Compass className="w-4 h-4 text-blue-800" />
                <span>🔵 NECESSITA AVALIAÇÃO / INVESTIGAÇÃO POSTERIOR</span>
              </div>
              <p className="text-[11px] text-slate-600">
                “Esta situação pode precisar de análise do responsável pelo processo/Qualidade. O Guardião não precisa realizar uma investigação sozinho.”
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Área / Responsável de Destino:
                </label>
                <VoiceTextInput
                  value={responsavelAreaDestino}
                  onChange={setResponsavelAreaDestino}
                  placeholder="Ex: Coordenação de Enfermagem / Farmácia Clínica / Qualidade"
                  isSingleLine
                />
              </div>
            </div>

            {/* PRÓXIMO PASSO OBRIGATÓRIO ANTES DE ENCERRAMENTO */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                PRÓXIMO PASSO DO REGISTRO <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Escolha o encaminhamento principal para este caso:
              </p>

              <div className="space-y-1.5">
                {[
                  'Preparar notificação de Segurança do Paciente',
                  'Comunicar responsável pelo setor',
                  'Encaminhar para Qualidade / NSP',
                  'Criar ação de melhoria de processo',
                  'Acompanhar evolução no setor',
                ].map((passo) => (
                  <label
                    key={passo}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      proximoPassoObrigatorio === passo
                        ? 'bg-slate-900 text-white border-black shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="proximoPassoRadio"
                      checked={proximoPassoObrigatorio === passo}
                      onChange={() => setProximoPassoObrigatorio(passo)}
                      className="w-4 h-4 text-emerald-700 focus:ring-emerald-600"
                    />
                    <span>{passo}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ENVOLVIDOS OU TESTEMUNHAS */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                ENVOLVIDOS / TESTEMUNHAS (OPCIONAL)
              </label>
              <VoiceTextInput
                id="input-envolvidos"
                value={envolvidosTestemunhas}
                onChange={setEnvolvidosTestemunhas}
                placeholder="Ex: Equipe de plantão matutino..."
                rows={2}
              />
            </div>

            {/* UPLOAD DE EVIDÊNCIA OU FOTO */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                ANEXAR REGISTRO OU EVIDÊNCIA (OPCIONAL)
              </label>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-200 flex items-center space-x-1.5 transition-colors">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Escolher Arquivo</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf"
                  />
                </label>
                {evidenciaNome && (
                  <span className="text-xs font-semibold text-emerald-800 truncate max-w-[180px]">
                    {evidenciaNome}
                  </span>
                )}
              </div>
            </div>

            {/* Ações da Etapa 4 */}
            <div className="pt-3 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                type="submit"
                disabled={!isStep4Valid}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold py-3 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 shadow-md transition-all border border-emerald-600 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>SALVAR REGISTRO & ENCAMINHAR</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
