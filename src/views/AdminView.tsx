import React, { useState } from 'react';
import { User, SituacaoRegistro, ChaveType } from '../types';
import { ShieldCheck, Search, Download, MapPin, Clock, X, Copy, Check } from 'lucide-react';

interface AdminViewProps {
  currentUser: User;
  registros: SituacaoRegistro[];
  onSelectRegistro: (item: SituacaoRegistro) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentUser,
  registros,
}) => {
  const [filterResultado, setFilterResultado] = useState<'TODOS' | 'OPORTUNIDADE' | 'NOTIFICACAO_FORMAL'>('TODOS');
  const [filterChave, setFilterChave] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailItem, setDetailItem] = useState<SituacaoRegistro | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  const oportunidadesCount = registros.filter((r) => r.resultado === 'OPORTUNIDADE').length;
  const notificacoesCount = registros.filter((r) => r.resultado === 'NOTIFICACAO_FORMAL').length;

  const filteredRecords = registros.filter((rec) => {
    const matchesResultado =
      filterResultado === 'TODOS' || rec.resultado === filterResultado;

    const matchesChave =
      filterChave === 'TODAS' ||
      rec.chaves.includes(filterChave as ChaveType);

    const term = searchTerm.toLowerCase();
    const textToSearch = `${rec.oQueAconteceu} ${rec.ondeAconteceu.join(' ')} ${rec.userName} ${rec.userSetor} ${rec.id}`;

    return matchesResultado && matchesChave && textToSearch.toLowerCase().includes(term);
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(registros, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `guardioes_chaves_registros_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-4">
      {/* Admin Title Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold uppercase tracking-tight">
              GESTÃO DE REGISTROS
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Hospital Unimed Nova Friburgo
          </p>
        </div>

        <button
          onClick={handleExportJSON}
          className="bg-emerald-700 hover:bg-emerald-800 text-white p-2.5 rounded-xl transition-colors flex items-center space-x-1.5 text-xs font-bold shrink-0 border border-emerald-600"
          title="Exportar Registros em JSON"
        >
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
      </div>

      {/* Operational Summary Counts */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <div className="text-[10px] font-bold text-slate-500 uppercase">Total</div>
          <div className="text-lg font-extrabold text-slate-900">{registros.length}</div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <div className="text-[10px] font-bold text-emerald-800 uppercase">Oportunidades</div>
          <div className="text-lg font-extrabold text-emerald-800">{oportunidadesCount}</div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <div className="text-[10px] font-bold text-amber-800 uppercase">Notificações</div>
          <div className="text-lg font-extrabold text-amber-800">{notificacoesCount}</div>
        </div>
      </div>

      {/* Outcome Filter Pills */}
      <div className="flex items-center space-x-1.5 text-xs font-bold">
        {(['TODOS', 'OPORTUNIDADE', 'NOTIFICACAO_FORMAL'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterResultado(t)}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              filterResultado === t
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t === 'TODOS' ? 'Todos' : t === 'OPORTUNIDADE' ? 'Oportunidades' : 'Notificações'}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por colaborador, setor ou texto..."
          className="w-full text-xs pl-9 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-800"
        />
      </div>

      {/* Filter by Chave */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-500 shrink-0">Chave:</span>
        {['TODAS', 'Segurança', 'Humanização', 'Eficiência', 'Excelência'].map((c) => (
          <button
            key={c}
            onClick={() => setFilterChave(c)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-colors ${
              filterChave === c
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* List of All Records */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-xs text-slate-500">
            Nenhum registro encontrado para os filtros selecionados.
          </div>
        ) : (
          filteredRecords.map((item) => (
            <div
              key={item.id}
              onClick={() => setDetailItem(item)}
              className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-900 shadow-2xs transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    item.resultado === 'NOTIFICACAO_FORMAL'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-900'
                  }`}
                >
                  {item.resultado === 'NOTIFICACAO_FORMAL'
                    ? 'NOTIFICAÇÃO FORMAL'
                    : 'OPORTUNIDADE DE MELHORIA'}
                </span>
                <span className="text-xs font-semibold text-slate-400">{item.id}</span>
              </div>

              <div className="text-xs font-bold text-slate-900 line-clamp-2">
                {item.oQueAconteceu}
              </div>

              <div className="text-[11px] text-slate-600 font-medium">
                Chaves: {item.chaves.join(' • ')}
              </div>

              <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">{item.userName}</span> ({item.userCargo})
                </div>
                <div>{item.dataCriacao}</div>
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
                    ? 'NOTIFICAÇÃO FORMAL'
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
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700">
                <span className="font-bold">Colaborador:</span> {detailItem.userName} ({detailItem.userCargo}) • Matrícula: {detailItem.userMatricula}
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">CHAVE(S) RELACIONADA(S):</span>
                <div className="text-emerald-900 font-extrabold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  {detailItem.chaves.join(' • ')}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">IMPACTO(S):</span>
                <div className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {detailItem.impactos.join(' • ')}
                  {detailItem.impactoOutroDetalhe ? ` (${detailItem.impactoOutroDetalhe})` : ''}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">LOCAL(IS):</span>
                <div className="text-slate-800 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {detailItem.ondeAconteceu.join(' • ')}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">SITUAÇÃO OBSERVADA:</span>
                <p className="text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {detailItem.oQueAconteceu}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">PROPOSTA DE AJUSTE / AÇÕES:</span>
                <p className="text-slate-800 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 leading-relaxed">
                  {detailItem.propostaAjusteAcoes}
                </p>
              </div>

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
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                      copiedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white'
                    }`}
                  >
                    {copiedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>COPIADO COM SUCESSO!</span>
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
