import React, { useState } from 'react';
import { User, SituacaoRegistro } from '../types';
import { solicitarCorrecaoRegistro } from '../utils/storage';
import { FileEdit, AlertCircle, ShieldAlert, Send, X, CheckCircle } from 'lucide-react';

interface SolicitarCorrecaoModalProps {
  currentUser: User;
  registro: SituacaoRegistro;
  onClose: () => void;
  onSuccess: () => void;
}

export const SolicitarCorrecaoModal: React.FC<SolicitarCorrecaoModalProps> = ({
  currentUser,
  registro,
  onClose,
  onSuccess,
}) => {
  const [justificativa, setJustificativa] = useState('');
  const [campos, setCampos] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificativa || justificativa.trim().length < 8) {
      setError('Por favor, informe uma justificativa clara com pelo menos 8 caracteres.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const res = solicitarCorrecaoRegistro(currentUser, registro.id, justificativa, campos);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-110 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-tight">
                Solicitar Correção de Registro
              </h3>
              <p className="text-[11px] text-slate-400">
                Registro ID: <span className="font-mono text-emerald-400 font-bold">{registro.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Rule Explanation */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Política de Integridade e Não Exclusão</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Por conformidade com as diretrizes de governança e segurança institucional, registros de situações não podem ser excluídos diretamente por Guardiões. Sua solicitação será avaliada pela Coordenação de Qualidade/Gestão.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Campos a Serem Corrigidos (Opcional)
            </label>
            <input
              type="text"
              value={campos}
              onChange={(e) => setCampos(e.target.value)}
              placeholder="Ex: Descrição do fato, data, setor ou classificação"
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Justificativa Detalhada da Correção *
            </label>
            <textarea
              required
              rows={3}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Explique o motivo da alteração solicitada (ex: digitação incorreta, atualização de dados pelo setor)..."
              className="w-full text-xs font-normal px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
