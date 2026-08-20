import React, { useState } from 'react';
import { User, SolicitacaoCorrecao } from '../types';
import { analisarSolicitacaoCorrecao } from '../utils/storage';
import { FileEdit, CheckCircle2, XCircle, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface AnalisarCorrecaoModalProps {
  currentUser: User;
  solicitacao: SolicitacaoCorrecao;
  onClose: () => void;
  onSuccess: () => void;
}

export const AnalisarCorrecaoModal: React.FC<AnalisarCorrecaoModalProps> = ({
  currentUser,
  solicitacao,
  onClose,
  onSuccess,
}) => {
  const [decisao, setDecisao] = useState<'ANALISADA' | 'RECUSADA' | 'CONCLUIDA'>('ANALISADA');
  const [parecer, setParecer] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = analisarSolicitacaoCorrecao(currentUser, solicitacao.id, decisao, parecer);
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
            <div className="w-9 h-9 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-400 flex items-center justify-center">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-tight">
                Analisar Solicitação de Correção
              </h3>
              <p className="text-[11px] text-slate-400">
                Registro: <span className="font-mono text-emerald-400 font-bold">{solicitacao.registroId}</span>
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

        {/* Solicitante & Detalhes */}
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
            <span>
              Solicitante: <strong className="text-slate-200">{solicitacao.solicitanteNome}</strong> ({solicitacao.solicitanteMatricula})
            </span>
            <span>{solicitacao.dataHora}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Justificativa do Guardião:</span>
            <p className="text-slate-200 text-xs mt-0.5 leading-relaxed bg-slate-900 p-2 rounded-xl border border-slate-800">
              "{solicitacao.justificativa}"
            </p>
          </div>
          {solicitacao.camposParaCorrigir && (
            <div className="text-[11px] text-slate-400">
              Campos indicados: <span className="text-amber-300 font-medium">{solicitacao.camposParaCorrigir}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Decisão da Coordenação / Gestão
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecisao('ANALISADA')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold uppercase border transition-all ${
                  decisao === 'ANALISADA'
                    ? 'bg-purple-900/80 border-purple-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Em Análise
              </button>
              <button
                type="button"
                onClick={() => setDecisao('CONCLUIDA')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold uppercase border transition-all ${
                  decisao === 'CONCLUIDA'
                    ? 'bg-emerald-900/80 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Aprovada
              </button>
              <button
                type="button"
                onClick={() => setDecisao('RECUSADA')}
                className={`py-2 px-2 rounded-xl text-xs font-extrabold uppercase border transition-all ${
                  decisao === 'RECUSADA'
                    ? 'bg-red-900/80 border-red-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Recusada
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Parecer / Despacho da Gestão
            </label>
            <textarea
              rows={3}
              value={parecer}
              onChange={(e) => setParecer(e.target.value)}
              placeholder="Descreva as orientações, ajustes executados no registro ou motivo de recusa..."
              className="w-full text-xs font-normal px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center space-x-1.5 shadow-md border border-emerald-500"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Salvar Decisão</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
