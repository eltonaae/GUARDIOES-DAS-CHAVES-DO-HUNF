import React, { useState } from 'react';
import { User, SituacaoRegistro, ChaveType } from '../types';
import { Shield, Search, Clock, MapPin, Copy, Check, X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HistoricoViewProps {
  currentUser: User;
  registros: SituacaoRegistro[];
  selectedItemToOpen?: SituacaoRegistro | null;
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({
  currentUser,
  registros,
  selectedItemToOpen = null,
}) => {
  const [filterResultado, setFilterResultado] = useState<'TODOS' | 'OPORTUNIDADE' | 'NOTIFICACAO_FORMAL'>('TODOS');
  const [filterChave, setFilterChave] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');

  const [detailItem, setDetailItem] = useState<SituacaoRegistro | null>(selectedItemToOpen);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // User's records
  const userRegistros = registros.filter((r) => r.userId === currentUser.id);

  // Filter logic
  const filteredRegistros = userRegistros.filter((item) => {
    const matchesResultado =
      filterResultado === 'TODOS' || item.resultado === filterResultado;

    const matchesChave =
      filterChave === 'TODAS' ||
      item.chaves.includes(filterChave as ChaveType);

    const term = searchTerm.toLowerCase();
    const textSearch = `${item.oQueAconteceu} ${item.ondeAconteceu.join(' ')} ${item.id} ${item.propostaAjusteAcoes}`;
    const matchesSearch = textSearch.toLowerCase().includes(term);

    return matchesResultado && matchesChave && matchesSearch;
  });

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-4">
      {/* Title Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
          Hospital Unimed Nova Friburgo
        </div>
        <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight">
          HISTÓRICO DE REGISTROS
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Situações registradas por {currentUser.nome.split(' ')[0]} ({userRegistros.length})
        </p>
      </div>

      {/* Filter by Outcome Pill Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
        <button
          onClick={() => setFilterResultado('TODOS')}
          className={`py-2 rounded-lg transition-all ${
            filterResultado === 'TODOS'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          TODOS ({userRegistros.length})
        </button>
        <button
          onClick={() => setFilterResultado('OPORTUNIDADE')}
          className={`py-2 rounded-lg transition-all ${
            filterResultado === 'OPORTUNIDADE'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          OPORTUNIDADES
        </button>
        <button
          onClick={() => setFilterResultado('NOTIFICACAO_FORMAL')}
          className={`py-2 rounded-lg transition-all ${
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
          placeholder="Buscar no relato, local ou código ID..."
          className="w-full text-xs pl-9 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      {/* Filter by Chave Buttons */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Chave:</span>
        {['TODAS', 'Segurança', 'Humanização', 'Eficiência', 'Excelência'].map((c) => (
          <button
            key={c}
            onClick={() => setFilterChave(c)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors ${
              filterChave === c
                ? 'bg-emerald-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* List of Registros */}
      <div className="space-y-3">
        {filteredRegistros.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-xs text-slate-500">
            Nenhum registro encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredRegistros.map((item) => (
            <div
              key={item.id}
              onClick={() => setDetailItem(item)}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-emerald-600 shadow-2xs transition-all cursor-pointer space-y-2.5 active:scale-[0.99]"
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
                <span className="text-xs font-semibold text-slate-400">{item.id}</span>
              </div>

              <div className="text-xs font-bold text-slate-900 line-clamp-2 leading-relaxed">
                {item.oQueAconteceu}
              </div>

              {/* Show ALL Selected Chaves */}
              <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-100">
                Chaves: {item.chaves.join(' • ')}
              </div>

              {/* Show ALL Selected Impactos & Locais */}
              <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 pt-2">
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-700">Locais:</span>
                  <span className="truncate">{item.ondeAconteceu.join(' • ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700">Impactos:</span>{' '}
                    <span>{item.impactos.join(' • ')}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{item.quandoAconteceu}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    detailItem.resultado === 'NOTIFICACAO_FORMAL'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {detailItem.resultado === 'NOTIFICACAO_FORMAL'
                    ? 'NECESSIDADE DE NOTIFICAÇÃO FORMAL'
                    : 'OPORTUNIDADE DE MELHORIA'}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1">
                  REGISTRO {detailItem.id}
                </h3>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* CHAVES SELECIONADAS */}
              <div>
                <span className="font-bold text-slate-800 block mb-1">CHAVE(S) RELACIONADA(S):</span>
                <div className="text-emerald-900 font-extrabold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  {detailItem.chaves.join(' • ')}
                </div>
              </div>

              {/* IMPACTOS SELECIONADOS */}
              <div>
                <span className="font-bold text-slate-800 block mb-1">IMPACTOS IDENTIFICADOS:</span>
                <div className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {detailItem.impactos.join(' • ')}
                  {detailItem.impactoOutroDetalhe ? ` (${detailItem.impactoOutroDetalhe})` : ''}
                </div>
              </div>

              {/* LOCAIS SELECIONADOS */}
              <div>
                <span className="font-bold text-slate-800 block mb-1">LOCAIS / SETORES:</span>
                <div className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {detailItem.ondeAconteceu.join(' • ')}
                </div>
              </div>

              {/* O QUE ACONTECEU? */}
              <div>
                <span className="font-bold text-slate-800 block mb-1">O QUE ACONTECEU?</span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {detailItem.oQueAconteceu}
                </p>
                {detailItem.contextoSituacao && (
                  <p className="text-slate-500 italic mt-1 text-[11px]">
                    Contexto: {detailItem.contextoSituacao}
                  </p>
                )}
              </div>

              {/* PACIENTE DETAILS IF APPLICABLE */}
              {detailItem.relacaoPaciente ? (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-slate-800 uppercase text-[10px]">
                    DADOS DO PACIENTE
                  </div>
                  {detailItem.identificacaoPaciente && (
                    <div>• Identificação: {detailItem.identificacaoPaciente}</div>
                  )}
                  {detailItem.leitoQuarto && <div>• Leito / Quarto: {detailItem.leitoQuarto}</div>}
                  {detailItem.faixaEtaria && <div>• Faixa Etária: {detailItem.faixaEtaria}</div>}
                  {detailItem.grauDanoImpacto && (
                    <div>• Grau de Dano / Impacto: {detailItem.grauDanoImpacto}</div>
                  )}
                </div>
              ) : (
                detailItem.processoEquipamentoImpactado && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                    <span className="font-bold text-slate-800">Processo/Equipamento:</span>{' '}
                    {detailItem.processoEquipamentoImpactado}
                  </div>
                )
              )}

              {/* PROPOSTA / AÇÕES */}
              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  PROPOSTA DE AJUSTE / AÇÕES:
                </span>
                <p className="text-slate-800 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 leading-relaxed">
                  {detailItem.propostaAjusteAcoes}
                </p>
              </div>

              {/* HISTÓRIA ESTRUTURADA IF NOTIFICACAO FORMAL */}
              {detailItem.resultado === 'NOTIFICACAO_FORMAL' && detailItem.historiaFormatada && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block">
                    HISTÓRIA DA OCORRÊNCIA ESTRUTURADA:
                  </span>
                  <div className="bg-slate-900 text-emerald-400 font-mono text-[11px] p-3 rounded-xl whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {detailItem.historiaFormatada}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyText(detailItem.historiaFormatada!)}
                    className={`w-full py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                      copiedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>HISTÓRIA COPIADA COM SUCESSO!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>COPIAR HISTÓRIA DA OCORRÊNCIA</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
