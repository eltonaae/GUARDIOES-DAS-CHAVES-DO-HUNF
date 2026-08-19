import React, { useState } from 'react';
import { User, SituacaoRegistro, ChaveType, ImpactoType } from '../types';
import { triarSituacao, gerarHistoriaOcorrencia } from '../utils/historyGenerator';
import { Check, Shield, CheckCircle2, AlertTriangle, Copy, ArrowRight, ArrowLeft, Upload, FileText } from 'lucide-react';

interface SituacaoFormViewProps {
  currentUser: User;
  onSubmit: (item: SituacaoRegistro) => void;
  onCancel: () => void;
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

export const SituacaoFormView: React.FC<SituacaoFormViewProps> = ({
  currentUser,
  onSubmit,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
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

  // Step 2: Chaves & Impactos
  const [selectedChaves, setSelectedChaves] = useState<ChaveType[]>([]);
  const [selectedImpactos, setSelectedImpactos] = useState<ImpactoType[]>([]);
  const [impactoOutroDetalhe, setImpactoOutroDetalhe] = useState('');

  // Step 3: Relação Paciente
  const [relacaoPaciente, setRelacaoPaciente] = useState<boolean>(false);
  const [identificacaoPaciente, setIdentificacaoPaciente] = useState('');
  const [leitoQuarto, setLeitoQuarto] = useState('');
  const [faixaEtaria, setFaixaEtaria] = useState<'Recém-nascido' | 'Pediátrico' | 'Adulto' | 'Idoso'>('Adulto');
  const [grauDanoImpacto, setGrauDanoImpacto] = useState<'Nenhum' | 'Leve' | 'Moderado' | 'Grave'>('Nenhum');
  const [processoEquipamentoImpactado, setProcessoEquipamentoImpactado] = useState('');

  // Step 4: Proposta, Ações & Chefia
  const [propostaAjusteAcoes, setPropostaAjusteAcoes] = useState('');
  const [notificadoChefia, setNotificadoChefia] = useState<boolean>(false);
  const [envolvidosTestemunhas, setEnvolvidosTestemunhas] = useState('');
  const [evidenciaNome, setEvidenciaNome] = useState('');

  // Completed outcome state
  const [completedRegistro, setCompletedRegistro] = useState<SituacaoRegistro | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

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

  // Step Validation
  const isStep1Valid =
    oQueAconteceu.trim().length >= 10 &&
    (ondeAconteceu.length > 0 || (ondeOutroChecked && ondeOutroTexto.trim().length > 0)) &&
    quandoAconteceu.trim().length > 0;

  const isStep2Valid = selectedChaves.length > 0 && selectedImpactos.length > 0;

  const isStep3Valid = relacaoPaciente
    ? identificacaoPaciente.trim().length > 0 || leitoQuarto.trim().length > 0
    : true;

  const isStep4Valid = propostaAjusteAcoes.trim().length >= 5;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenciaNome(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare final locations list
    const finalLocais = [...ondeAconteceu];
    if (ondeOutroChecked && ondeOutroTexto.trim()) {
      finalLocais.push(`Outro: ${ondeOutroTexto.trim()}`);
    }

    const draftData: Partial<SituacaoRegistro> = {
      oQueAconteceu: oQueAconteceu.trim(),
      ondeAconteceu: finalLocais,
      ondeAconteceuOutro: ondeOutroTexto.trim() || undefined,
      quandoAconteceu,
      contextoSituacao: contextoSituacao.trim() || undefined,
      chaves: selectedChaves,
      impactos: selectedImpactos,
      impactoOutroDetalhe: impactoOutroDetalhe.trim() || undefined,
      relacaoPaciente,
      identificacaoPaciente: relacaoPaciente ? identificacaoPaciente.trim() : undefined,
      leitoQuarto: relacaoPaciente ? leitoQuarto.trim() : undefined,
      faixaEtaria: relacaoPaciente ? faixaEtaria : undefined,
      grauDanoImpacto: relacaoPaciente ? grauDanoImpacto : undefined,
      processoEquipamentoImpactado: !relacaoPaciente ? processoEquipamentoImpactado.trim() : undefined,
      propostaAjusteAcoes: propostaAjusteAcoes.trim(),
      notificadoChefia,
      envolvidosTestemunhas: envolvidosTestemunhas.trim() || undefined,
      evidenciaNome: evidenciaNome || undefined,
      userName: currentUser.nome,
      userCargo: currentUser.cargo,
      userMatricula: currentUser.matricula,
      userSetor: currentUser.setor,
    };

    // Perform objective triagem
    const triagem = triarSituacao(draftData);

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const idGen = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRegistro: SituacaoRegistro = {
      ...(draftData as SituacaoRegistro),
      id: idGen,
      userId: currentUser.id,
      resultado: triagem.resultado,
      motivoTriagem: triagem.motivo,
      dataCriacao: nowStr,
      status: 'Registrado',
    };

    if (triagem.resultado === 'NOTIFICACAO_FORMAL') {
      newRegistro.historiaFormatada = gerarHistoriaOcorrencia(newRegistro);
    }

    onSubmit(newRegistro);
    setCompletedRegistro(newRegistro);
  };

  const handleCopyHistoria = () => {
    if (completedRegistro?.historiaFormatada) {
      navigator.clipboard.writeText(completedRegistro.historiaFormatada);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    }
  };

  // If submitted, show RESULTADO DO REGISTRO screen
  if (completedRegistro) {
    return (
      <div className="space-y-5 pb-20 max-w-md mx-auto px-4 pt-4">
        {/* Header */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            HOSPITAL UNIMED NOVA FRIBURGO
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight mt-0.5">
            RESULTADO DO REGISTRO
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Código: {completedRegistro.id}
          </span>
        </div>

        {/* OUTCOME A: OPORTUNIDADE DE MELHORIA */}
        {completedRegistro.resultado === 'OPORTUNIDADE' ? (
          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-600 shadow-md space-y-4">
            <div className="flex items-center space-x-3 bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-7 h-7 text-emerald-700 shrink-0" />
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                  OPORTUNIDADE DE MELHORIA
                </span>
                <h3 className="text-sm font-extrabold mt-1">
                  Esta situação foi registrada como uma oportunidade de melhoria.
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {completedRegistro.motivoTriagem ||
                'O registro foi armazenado no seu histórico e servirá para aperfeiçoar os processos operacionais.'}
            </p>

            {/* Summary details */}
            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div>
                <span className="font-bold text-slate-800">Chaves Relacionadas:</span>
                <div className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 mt-1">
                  {completedRegistro.chaves.join(' • ')}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800">Locais Envolvidos:</span>
                <div className="text-slate-700 font-medium">
                  {completedRegistro.ondeAconteceu.join(' • ')}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800">Impactos Identificados:</span>
                <div className="text-slate-700 font-medium">
                  {completedRegistro.impactos.join(' • ')}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={onCancel}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl text-xs shadow-xs transition-all text-center"
              >
                CONCLUIR E IR PARA HOME
              </button>
            </div>
          </div>
        ) : (
          /* OUTCOME B: NECESSIDADE DE NOTIFICAÇÃO FORMAL */
          <div className="bg-white rounded-2xl p-5 border-2 border-amber-500 shadow-md space-y-4">
            <div className="flex items-center space-x-3 bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-200">
              <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  NECESSIDADE DE NOTIFICAÇÃO FORMAL
                </span>
                <h3 className="text-sm font-extrabold mt-1">
                  Esta situação apresenta características que indicam necessidade de notificação formal.
                </h3>
              </div>
            </div>

            <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed space-y-1">
              <div className="font-bold text-slate-800">Orientação Institucional:</div>
              <p>
                O registro deve ser encaminhado para o **SISTEMA OFICIAL DE NOTIFICAÇÃO** de eventos, conforme o fluxo institucional do Hospital Unimed Nova Friburgo.
              </p>
            </div>

            {/* Generated Historia box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800">
                  HISTÓRIA DA OCORRÊNCIA ESTRUTURADA:
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Pronta para envio</span>
              </div>
              <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-slate-800">
                {completedRegistro.historiaFormatada}
              </div>
            </div>

            {/* COPY BUTTON */}
            <button
              id="btn-copiar-historia-resultado"
              type="button"
              onClick={handleCopyHistoria}
              className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm ${
                copiedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>HISTÓRIA COPIADA COM SUCESSO!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPIAR HISTÓRIA PARA NOTIFICAÇÃO</span>
                </>
              )}
            </button>

            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={onCancel}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs transition-colors text-center"
              >
                VOLTAR PARA A HOME
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-4">
      {/* Title Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
            Hospital Unimed Nova Friburgo
          </span>
          <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-tight">
            REGISTRAR SITUAÇÃO
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Etapa {step} de 4
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-emerald-700 h-full transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ================================================== */}
        {/* ETAPA 1: O QUE, ONDE, QUANDO & CONTEXTO           */}
        {/* ================================================== */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                1. DETALHES DA SITUAÇÃO
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Descreva livremente a situação observada na rotina.
              </p>
            </div>

            {/* O QUE ACONTECEU? */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                O QUE ACONTECEU? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={oQueAconteceu}
                onChange={(e) => setOQueAconteceu(e.target.value)}
                rows={4}
                placeholder="Descreva detalhadamente o fato observado na rotina hospitalar..."
                className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                required
              />
            </div>

            {/* ONDE A SITUAÇÃO OCORREU OU TEVE IMPACTO? (SELEÇÃO MÚLTIPLA) */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                ONDE A SITUAÇÃO OCORREU OU TEVE IMPACTO? <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Selecione um ou mais locais/setores envolvidos:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {LOCAIS_PADRAO.map((local) => {
                  const isChecked = ondeAconteceu.includes(local);
                  return (
                    <label
                      key={local}
                      className={`flex items-center space-x-3 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-600 text-emerald-900'
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

                {/* Outro local */}
                <label
                  className={`flex items-center space-x-3 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    ondeOutroChecked
                      ? 'bg-emerald-50/70 border-emerald-600 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={ondeOutroChecked}
                    onChange={(e) => setOndeOutroChecked(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>Outro setor / local</span>
                </label>

                {ondeOutroChecked && (
                  <input
                    type="text"
                    value={ondeOutroTexto}
                    onChange={(e) => setOndeOutroTexto(e.target.value)}
                    placeholder="Especifique o outro setor ou local..."
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                )}
              </div>
            </div>

            {/* QUANDO ACONTECEU? */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                QUANDO ACONTECEU? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={quandoAconteceu}
                onChange={(e) => setQuandoAconteceu(e.target.value)}
                placeholder="Ex: 2026-08-12 14:30"
                className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
                required
              />
            </div>

            {/* CONTEXTO DA SITUAÇÃO */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                CONTEXTO DA SITUAÇÃO <span className="text-slate-400 font-normal">(OPCIONAL)</span>
              </label>
              <textarea
                value={contextoSituacao}
                onChange={(e) => setContextoSituacao(e.target.value)}
                rows={2}
                placeholder="Explique o contexto se necessário (ex: durante passagem de plantão, visita familiar, troca de turno)..."
                className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
              >
                <span>Próxima Etapa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* ETAPA 2: CHAVES & IMPACTOS (SELEÇÃO MÚLTIPLA)      */}
        {/* ================================================== */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                2. CHAVES RELACIONADAS E IMPACTOS
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Uma situação pode envolver mais de uma Chave e afetar múltiplos públicos.
              </p>
            </div>

            {/* QUAL(IS) CHAVE(S) ESTÁ(ÃO) RELACIONADA(S)? */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                QUAL(IS) CHAVE(S) ESTÁ(ÃO) RELACIONADA(S) A ESTA SITUAÇÃO? <span className="text-red-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Selecione uma, duas, três ou as quatro Chaves:
              </p>

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
              <p className="text-[11px] text-slate-500">
                Selecione todos os públicos ou áreas impactadas:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {IMPACTOS_PADRAO.map((imp) => {
                  const isChecked = selectedImpactos.includes(imp);
                  return (
                    <label
                      key={imp}
                      className={`flex items-center space-x-3 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
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
                  <input
                    type="text"
                    value={impactoOutroDetalhe}
                    onChange={(e) => setImpactoOutroDetalhe(e.target.value)}
                    placeholder="Especifique o outro impacto..."
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 mt-1"
                  />
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

        {/* ================================================== */}
        {/* ETAPA 3: CARACTERIZAÇÃO DA SITUAÇÃO / PACIENTE     */}
        {/* ================================================== */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                3. CARACTERIZAÇÃO DA SITUAÇÃO
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Responda às perguntas para que o aplicativo determine o encaminhamento institucional.
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

            {/* CONDICIONAL: SE SIM */}
            {relacaoPaciente ? (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="text-xs font-extrabold text-slate-800 uppercase">
                  DADOS DO PACIENTE E IMPACTO
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Identificação do Paciente / Prontuário / Iniciais:
                  </label>
                  <input
                    type="text"
                    value={identificacaoPaciente}
                    onChange={(e) => setIdentificacaoPaciente(e.target.value)}
                    placeholder="Ex: A.B.C. ou Prontuário 123456"
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Leito / Quarto:
                  </label>
                  <input
                    type="text"
                    value={leitoQuarto}
                    onChange={(e) => setLeitoQuarto(e.target.value)}
                    placeholder="Ex: Leito 204 B"
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
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
                      Grau de Dano / Impacto:
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
              </div>
            ) : (
              /* CONDICIONAL: SE NÃO */
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="text-xs font-bold text-slate-800 block">
                  Especifique o processo, equipamento, insumo ou área de infraestrutura impactada:
                </label>
                <input
                  type="text"
                  value={processoEquipamentoImpactado}
                  onChange={(e) => setProcessoEquipamentoImpactado(e.target.value)}
                  placeholder="Ex: Bomba de infusão modelo X, fluxo de farmácia, etc."
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
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
                onClick={() => setStep(4)}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold py-2.5 px-5 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
              >
                <span>Próxima Etapa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* ETAPA 4: PROPOSTA DE AJUSTE, AÇÕES & FINALIZAÇÃO   */}
        {/* ================================================== */}
        {step === 4 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                4. PROPOSTA DE AJUSTE E CONCLUIR
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Informe a proposta simples de melhoria ou as ações imediatas adotadas.
              </p>
            </div>

            {/* PROPOSTA DE AJUSTE OU AÇÃO IMEDIATA */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                QUAL AJUSTE SIMPLES OU AÇÃO IMEDIATA PODE AJUDAR? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={propostaAjusteAcoes}
                onChange={(e) => setPropostaAjusteAcoes(e.target.value)}
                rows={3}
                placeholder="Descreva a solução proposta ou ação imediata tomada para conter/melhorar a situação..."
                className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                required
              />
            </div>

            {/* CHEFIA NOTIFICADA? */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                A CHEFIA / SUPERVISÃO IMEDIATA FOI NOTIFICADA?
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="notificadoChefia"
                    checked={notificadoChefia === true}
                    onChange={() => setNotificadoChefia(true)}
                    className="w-4 h-4 text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>SIM</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="notificadoChefia"
                    checked={notificadoChefia === false}
                    onChange={() => setNotificadoChefia(false)}
                    className="w-4 h-4 text-emerald-700 focus:ring-emerald-600"
                  />
                  <span>NÃO</span>
                </label>
              </div>
            </div>

            {/* ENVOLVIDOS / TESTEMUNHAS */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                ENVOLVIDOS / TESTEMUNHAS <span className="text-slate-400 font-normal">(OPCIONAL)</span>
              </label>
              <input
                type="text"
                value={envolvidosTestemunhas}
                onChange={(e) => setEnvolvidosTestemunhas(e.target.value)}
                placeholder="Ex: Equipe de Enfermagem do turno, Farmácia..."
                className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* EVIDÊNCIA ANEXA */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-extrabold text-slate-800 uppercase block">
                ANEXAR EVIDÊNCIA / DOCUMENTO <span className="text-slate-400 font-normal">(OPCIONAL)</span>
              </label>
              <div className="flex items-center space-x-2">
                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 transition-colors flex items-center space-x-1.5 shrink-0">
                  <Upload className="w-4 h-4 text-slate-600" />
                  <span>Escolher Arquivo</span>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-500 truncate">
                  {evidenciaNome || 'Nenhum arquivo selecionado'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>

              <button
                id="btn-enviar-situacao"
                type="submit"
                disabled={!isStep4Valid}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold py-3 px-6 rounded-xl text-xs shadow-md transition-all flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>ENVIAR REGISTRO</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
