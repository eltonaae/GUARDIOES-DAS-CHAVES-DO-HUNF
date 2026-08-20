import React, { useState, useEffect } from 'react';
import {
  User,
  SituacaoRegistro,
} from '../types';
import {
  gerarRelatoNarrativoNotificacao,
} from '../utils/historyGenerator';
import {
  atualizarRelatoNotificacao,
  registrarCopiaRelatoStorage,
  registrarEncaminhamentoOficialStorage,
  adicionarEvidenciaAoRegistro,
} from '../utils/storage';
import { detectarDadosPessoais } from '../utils/privacyDetector';
import { VoiceTextInput } from '../components/VoiceTextInput';
import {
  Shield,
  Check,
  Copy,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
  Clock,
  MapPin,
  Sparkles,
  ArrowLeft,
  Upload,
  RefreshCw,
  Send,
  HelpCircle,
  X,
  Compass,
  Building2,
  UserCheck,
} from 'lucide-react';

interface NotificacaoFormalViewProps {
  currentUser: User;
  registro: SituacaoRegistro;
  onBack: () => void;
  onUpdateRegistro: (updated: SituacaoRegistro) => void;
  onFinishAndGoHome?: () => void;
}

export const NotificacaoFormalView: React.FC<NotificacaoFormalViewProps> = ({
  currentUser,
  registro,
  onBack,
  onUpdateRegistro,
  onFinishAndGoHome,
}) => {
  // Access control check
  const isAuthorized =
    currentUser.role === 'manager' || registro.userId === currentUser.id;

  // Local state for notification draft text
  const initialRelato =
    registro.relatoNotificacao ||
    registro.historiaFormatada ||
    gerarRelatoNarrativoNotificacao(registro);

  const [currentRegistro, setCurrentRegistro] = useState<SituacaoRegistro>(registro);
  const [relatoTexto, setRelatoTexto] = useState<string>(initialRelato);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [showEncaminhamentoModal, setShowEncaminhamentoModal] = useState<boolean>(false);
  const [showFinalPreparedScreen, setShowFinalPreparedScreen] = useState<boolean>(
    Boolean(registro.encaminhadoOficial)
  );

  // Encaminhamento Form
  const [canalEncaminhamento, setCanalEncaminhamento] = useState<string>(
    'Sistema Oficial de Notificação Institucional'
  );
  const [observacaoEncaminhamento, setObservacaoEncaminhamento] = useState<string>('');

  // Evidence state
  const [evidenciaUploadName, setEvidenciaUploadName] = useState<string>('');
  const [showEvidencePrivacyWarning, setShowEvidencePrivacyWarning] = useState<boolean>(false);

  // Privacy / LGPD check on draft text
  const privacyCheck = detectarDadosPessoais(relatoTexto);

  useEffect(() => {
    // If the record was updated externally, keep sync
    setCurrentRegistro(registro);
  }, [registro]);

  // Handle saving revised report text
  const handleSaveRelatoEdits = () => {
    if (privacyCheck.hasSensitiveData) {
      return;
    }
    const updated = atualizarRelatoNotificacao(
      currentUser,
      currentRegistro.id,
      relatoTexto.trim(),
      true
    );
    if (updated) {
      setCurrentRegistro(updated);
      onUpdateRegistro(updated);
      setIsEditing(false);
    }
  };

  // Reset to auto-generated narrative
  const handleResetRelato = () => {
    const autoGen = gerarRelatoNarrativoNotificacao(currentRegistro);
    setRelatoTexto(autoGen);
    const updated = atualizarRelatoNotificacao(
      currentUser,
      currentRegistro.id,
      autoGen,
      false
    );
    if (updated) {
      setCurrentRegistro(updated);
      onUpdateRegistro(updated);
      setIsEditing(false);
    }
  };

  // Copy to clipboard with institutional disclaimer
  const handleCopyRelato = () => {
    navigator.clipboard.writeText(relatoTexto);
    setCopiedSuccess(true);
    const updated = registrarCopiaRelatoStorage(currentUser, currentRegistro.id);
    if (updated) {
      setCurrentRegistro(updated);
      onUpdateRegistro(updated);
    }
    setTimeout(() => {
      setCopiedSuccess(false);
      setShowEncaminhamentoModal(true);
    }, 1500);
  };

  // Confirm official routing
  const handleConfirmEncaminhamento = (resposta: 'SIM' | 'AINDA_NAO' | 'NAO_SEI') => {
    if (resposta === 'SIM') {
      const updated = registrarEncaminhamentoOficialStorage(
        currentUser,
        currentRegistro.id,
        canalEncaminhamento,
        observacaoEncaminhamento.trim() || undefined
      );
      if (updated) {
        setCurrentRegistro(updated);
        onUpdateRegistro(updated);
        setShowEncaminhamentoModal(false);
        setShowFinalPreparedScreen(true);
      }
    } else {
      setShowEncaminhamentoModal(false);
    }
  };

  // Handle evidence attachment with explicit safety warning
  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileSize = `${Math.round(file.size / 1024)} KB`;
      const updated = adicionarEvidenciaAoRegistro(
        currentUser,
        currentRegistro.id,
        file.name,
        fileSize
      );
      if (updated) {
        setCurrentRegistro(updated);
        onUpdateRegistro(updated);
        setEvidenciaUploadName(file.name);
      }
    }
  };

  // Access check fallback
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto p-6 space-y-4 text-center font-sans">
        <div className="bg-red-50 text-red-900 border border-red-200 p-6 rounded-3xl space-y-2">
          <Lock className="w-8 h-8 mx-auto text-red-700" />
          <h2 className="text-base font-extrabold uppercase">Acesso Restrito</h2>
          <p className="text-xs text-red-800">
            Você não possui autorização para visualizar a notificação formal deste registro.
          </p>
          <button
            onClick={onBack}
            className="mt-3 bg-red-800 hover:bg-red-900 text-white text-xs font-bold py-2 px-4 rounded-xl"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW: NOTIFICAÇÃO PREPARADA ✓ (TELA DE SUCESSO & RASTREABILIDADE)
  // =========================================================
  if (showFinalPreparedScreen) {
    return (
      <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-4 font-sans animate-in fade-in duration-200">
        {/* Success Card Header */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-lg text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="text-[10px] font-mono tracking-widest text-emerald-400 font-extrabold uppercase">
            Hospital Unimed Nova Friburgo
          </div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            NOTIFICAÇÃO PREPARADA ✓
          </h1>
          <p className="text-xs text-slate-300">
            Relato estruturado e encaminhamento formal registrados com sucesso.
          </p>

          <div className="bg-white/10 rounded-2xl p-3 text-left space-y-1.5 border border-white/10 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 font-bold">REGISTRO:</span>
              <span className="font-mono text-emerald-300 font-bold">{currentRegistro.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Classificação Preliminar:</span>
              <span className="font-extrabold text-amber-300">{currentRegistro.classificacaoPreliminar}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Status:</span>
              <span className="font-bold bg-emerald-600/60 text-white px-2 py-0.5 rounded-md text-[10px] uppercase">
                {currentRegistro.status}
              </span>
            </div>
            {currentRegistro.encaminhadoTipo && (
              <div className="text-[11px] text-slate-300 pt-1 border-t border-white/10">
                <strong>Canal de Encaminhamento:</strong> {currentRegistro.encaminhadoTipo}
              </div>
            )}
          </div>
        </div>

        {/* Institutional reminder */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 space-y-1 text-xs text-amber-950">
          <div className="font-extrabold uppercase flex items-center space-x-1.5 text-amber-900 text-[11px]">
            <Compass className="w-4 h-4 text-amber-700" />
            <span>Próximo Passo Institucional</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
            O Guardião identifica, orienta e encaminha. A classificação oficial, análise de causa e acompanhamento institucional seguem o fluxo de Segurança do Paciente e Qualidade.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(relatoTexto);
              setCopiedSuccess(true);
              setTimeout(() => setCopiedSuccess(false), 2000);
            }}
            className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            {copiedSuccess ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSuccess ? 'Relato Copiado!' : 'COPIAR RELATO NOVAMENTE'}</span>
          </button>

          <button
            onClick={() => setShowFinalPreparedScreen(false)}
            className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-300 shadow-2xs flex items-center justify-center space-x-1.5"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Revisar Notificação & Detalhes</span>
          </button>

          <button
            onClick={onFinishAndGoHome || onBack}
            className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm"
          >
            Voltar ao Histórico de Registros
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-4 font-sans animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Voltar</span>
        </button>
        <span className="text-[10px] font-mono text-slate-400 font-bold">{currentRegistro.id}</span>
      </div>

      {/* Main Title Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
        <div className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center space-x-1.5">
          <Shield className="w-4 h-4 text-emerald-700" />
          <span>Módulo de Notificação Formal</span>
        </div>
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
          NOTIFICAÇÃO FORMAL
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          Revise as informações antes de encaminhar. O sistema organizou automaticamente os fatos fornecidos.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 1. RESUMO DA SITUAÇÃO & CLASSIFICAÇÃO PRELIMINAR         */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>RESUMO DA SITUAÇÃO</span>
          </h2>
          <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
            Registro Oficial
          </span>
        </div>

        {/* Preliminary Classification Box with Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300/80 space-y-1.5">
          <div className="text-[10px] font-black text-amber-950 uppercase tracking-wide">
            CLASSIFICAÇÃO PRELIMINAR:
          </div>
          <div className="text-xs font-black text-amber-900 uppercase">
            {currentRegistro.classificacaoPreliminar}
          </div>
          <p className="text-[11px] text-amber-800/90 leading-snug font-medium border-t border-amber-200/60 pt-1">
            * A classificação oficial deverá seguir o fluxo institucional de Segurança do Paciente e Qualidade.
          </p>
        </div>

        {/* Structured Grid of Collected Facts */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">CHAVES ENVOLVIDAS:</span>
            <div className="flex flex-wrap gap-1">
              {currentRegistro.chaves.map((c) => (
                <span key={c} className="text-[10px] bg-emerald-100 text-emerald-950 font-bold px-1.5 py-0.5 rounded">
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">DATA / HORA:</span>
            <span className="font-bold text-slate-800">{currentRegistro.quandoAconteceu}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5 col-span-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">LOCAL / SETORES:</span>
            <span className="font-bold text-slate-800">{currentRegistro.ondeAconteceu.join(' • ')}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">ENVOLVE PACIENTE:</span>
            <span className="font-bold text-slate-800">
              {currentRegistro.relacaoPaciente ? 'Sim' : 'Não'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">CHEGOU AO PACIENTE:</span>
            <span className="font-bold text-slate-800">
              {currentRegistro.chegouAoPaciente || 'Não'}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5 col-span-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">IMPACTO / DANO:</span>
            <span className="font-bold text-slate-800">
              {currentRegistro.impactos.join(', ')}
              {currentRegistro.grauDanoImpacto && currentRegistro.grauDanoImpacto !== 'Nenhum'
                ? ` (Grau: ${currentRegistro.grauDanoImpacto})`
                : ''}
            </span>
          </div>

          {currentRegistro.barreiraInterceptadora && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5 col-span-2">
              <span className="text-[9px] font-bold text-emerald-800 uppercase block">BARREIRA DE SEGURANÇA:</span>
              <span className="font-bold text-slate-800">{currentRegistro.barreiraInterceptadora}</span>
            </div>
          )}

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5 col-span-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">AÇÃO IMEDIATA:</span>
            <span className="font-semibold text-slate-800">
              {currentRegistro.acoesImediatasSelecionadas && currentRegistro.acoesImediatasSelecionadas.length > 0
                ? currentRegistro.acoesImediatasSelecionadas.join('; ')
                : currentRegistro.acaoImediataFeita || 'Conforme registrado'}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SEÇÃO: RELATO PARA NOTIFICAÇÃO (NARRATIVA CRONOLÓGICA) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 border-2 border-emerald-600/60 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-emerald-800" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-tight">
              RELATO PARA NOTIFICAÇÃO
            </h2>
          </div>
          {currentRegistro.relatoRevisado && (
            <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-md">
              Revisado pelo Guardião
            </span>
          )}
        </div>

        <p className="text-[11px] text-slate-600">
          Texto cronológico e objetivo organizado pelo sistema (sem dados identificáveis de pacientes):
        </p>

        {/* LGPD / Privacy Alert Warning */}
        {privacyCheck.hasSensitiveData && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-2xl text-xs text-red-950 space-y-1 animate-in fade-in">
            <div className="flex items-center space-x-1.5 font-bold text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>Atenção à Proteção de Dados (LGPD)</span>
            </div>
            <p className="text-[11px] text-red-800 leading-snug">
              “Evite inserir dados que identifiquem o paciente (como CPF, número de prontuário, telefone ou nome completo). Remova essas informações para continuar.”
            </p>
            <div className="text-[10px] text-red-700 font-mono">
              Inconsistências: {privacyCheck.issues.join(' • ')}
            </div>
          </div>
        )}

        {/* Editable Narrative Box with Voice Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
              REVISE O RELATO
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleResetRelato}
                title="Restaurar relato gerado automaticamente"
                className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center space-x-1 font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restaurar Original</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            “Confira se o texto representa fielmente o que aconteceu.” Você pode ajustar a redação ou complementar:
          </p>

          <VoiceTextInput
            id="input-relato-notificacao"
            value={relatoTexto}
            onChange={(val) => {
              setRelatoTexto(val);
              setIsEditing(true);
            }}
            placeholder="Relato cronológico e profissional para o sistema oficial..."
            rows={7}
          />

          {isEditing && (
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={handleSaveRelatoEdits}
                disabled={privacyCheck.hasSensitiveData}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all"
              >
                Salvar Revisão do Relato
              </button>
            </div>
          )}
        </div>

        {/* CTA PRINCIPAL: COPIAR RELATO */}
        <div className="pt-2 border-t border-slate-100">
          <button
            onClick={handleCopyRelato}
            disabled={privacyCheck.hasSensitiveData}
            className="w-full py-4 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer border border-emerald-600"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>Relato copiado. Realize o encaminhamento no sistema institucional.</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>COPIAR RELATO PARA SISTEMA OFICIAL</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            * O texto será copiado para sua área de transferência para colagem no sistema institucional.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SEÇÃO: EVIDÊNCIAS & PRIVACIDADE                       */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Upload className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
              EVIDÊNCIAS E REGISTROS DE PROCESSO (OPCIONAL)
            </h3>
          </div>
        </div>

        {/* Compulsory Privacy Notice for Attachments */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-700 leading-relaxed font-medium">
          <strong>Aviso de Proteção de Dados:</strong> “Não inclua documentos ou imagens que contenham dados identificáveis de pacientes, salvo quando houver fluxo institucional autorizado para isso.”
        </div>

        <div className="space-y-2">
          <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-300 flex items-center justify-center space-x-2 transition-colors">
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Anexar Foto, Documento ou Checklist de Processo</span>
            <input
              type="file"
              onChange={handleEvidenceFileChange}
              className="hidden"
              accept="image/*,.pdf"
            />
          </label>

          {/* List of Attached Evidences */}
          {currentRegistro.evidenciasMultiplas && currentRegistro.evidenciasMultiplas.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Evidências Vinculadas:</span>
              {currentRegistro.evidenciasMultiplas.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center space-x-2 truncate max-w-[240px]">
                    <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{ev.nome}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{ev.tamanho}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. RASTREABILIDADE: REGISTRO ORIGINAL X RELATO OFICIAL    */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-1.5">
          <Lock className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
            RASTREABILIDADE INSTITUCIONAL
          </h3>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase block">
              REGISTRO ORIGINAL (O que o Guardião escreveu originalmente):
            </span>
            <div className="text-slate-800 font-medium leading-relaxed italic">
              "{currentRegistro.oQueAconteceu}"
            </div>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-900 uppercase block">
              STATUS DE ENCAMINHAMENTO:
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                {currentRegistro.encaminhadoOficial ? 'Encaminhado ao Sistema Oficial' : 'Aguardando encaminhamento'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {currentRegistro.encaminhadoDataHora || 'Pendente'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL / DIALOG: VOCÊ REALIZOU O ENCAMINHAMENTO?          */}
      {/* ========================================================= */}
      {showEncaminhamentoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  Registrar Encaminhamento
                </h3>
              </div>
              <button
                onClick={() => setShowEncaminhamentoModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              O relato foi copiado para a sua área de transferência. <strong>Você realizou o encaminhamento no sistema institucional?</strong>
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-700 block">
                Canal ou Destino Utilizado:
              </label>
              <select
                value={canalEncaminhamento}
                onChange={(e) => setCanalEncaminhamento(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-300 font-semibold text-slate-800"
              >
                <option value="Sistema Oficial de Notificação Institucional">
                  Sistema Oficial de Notificação Institucional
                </option>
                <option value="Núcleo de Segurança do Paciente (NSP)">
                  Núcleo de Segurança do Paciente (NSP)
                </option>
                <option value="Gestão da Qualidade / Processos">
                  Gestão da Qualidade / Processos
                </option>
                <option value="Liderança Imediata / Coordenação de Plantão">
                  Liderança Imediata / Coordenação de Plantão
                </option>
                <option value="Comunicação Direta ao Responsável de Setor">
                  Comunicação Direta ao Responsável de Setor
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                Observações de Registro (Opcional):
              </label>
              <input
                type="text"
                value={observacaoEncaminhamento}
                onChange={(e) => setObservacaoEncaminhamento(e.target.value)}
                placeholder="Ex: Notificação nº 1042 gerada no sistema..."
                className="w-full text-xs p-2 bg-slate-50 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmEncaminhamento('SIM')}
                className="col-span-3 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm"
              >
                SIM, ENCAMINHEI AGORA
              </button>

              <button
                type="button"
                onClick={() => handleConfirmEncaminhamento('AINDA_NAO')}
                className="col-span-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase rounded-xl border border-slate-200"
              >
                AINDA NÃO
              </button>

              <button
                type="button"
                onClick={() => handleConfirmEncaminhamento('NAO_SEI')}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs uppercase rounded-xl border border-slate-200"
              >
                NÃO SEI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
