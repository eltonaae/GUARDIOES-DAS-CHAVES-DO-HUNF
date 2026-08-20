import React, { useState, useEffect } from 'react';
import {
  User,
  SituacaoRegistro,
  ActiveTab,
  AcaoMelhoria,
} from './types';
import {
  getCurrentSession,
  getAuthorizedRegistros,
  saveRegistro,
  logoutUser,
  getAllAcoesMelhoria,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthScreen } from './components/AuthScreen';
import { HomeView } from './views/HomeView';
import { SituacaoFormView } from './views/SituacaoFormView';
import { HistoricoView } from './views/HistoricoView';
import { PerfilView } from './views/PerfilView';
import { AdminView } from './views/AdminView';
import { NotificacaoFormalView } from './views/NotificacaoFormalView';
import { AcaoMelhoriaModal } from './components/AcaoMelhoriaModal';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentSession());
  const [registros, setRegistros] = useState<SituacaoRegistro[]>(() =>
    currentUser ? getAuthorizedRegistros(currentUser) : []
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedItemToOpen, setSelectedItemToOpen] = useState<SituacaoRegistro | null>(null);
  const [selectedRegistroForNotificacao, setSelectedRegistroForNotificacao] = useState<SituacaoRegistro | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Improvement Action Modal State
  const [acaoModalState, setAcaoModalState] = useState<{
    isOpen: boolean;
    registroOrigem?: SituacaoRegistro | null;
    acaoSelecionada?: AcaoMelhoria | null;
  }>({
    isOpen: false,
    registroOrigem: null,
    acaoSelecionada: null,
  });

  // Sync registrations when user changes or logs in
  useEffect(() => {
    if (currentUser) {
      setRegistros(getAuthorizedRegistros(currentUser));
    } else {
      setRegistros([]);
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setRegistros(getAuthorizedRegistros(user));
    setActiveTab('home');
    showToast(`Bem-vindo, ${user.nome}!`);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setRegistros([]);
    setActiveTab('home');
    setSelectedItemToOpen(null);
    setSelectedRegistroForNotificacao(null);
    setAcaoModalState({ isOpen: false, registroOrigem: null, acaoSelecionada: null });
  };

  const handleNewRegistro = (item: SituacaoRegistro) => {
    if (!currentUser) return;
    const updated = saveRegistro(currentUser, item);
    // Refresh scoped records
    setRegistros(getAuthorizedRegistros(currentUser));
    showToast(`Registro ${item.id} salvo com sucesso!`);
  };

  const handleSelectRecordFromHome = (item: SituacaoRegistro) => {
    setSelectedItemToOpen(item);
    setActiveTab('historico');
  };

  const handleUpdateRegistro = (updated: SituacaoRegistro) => {
    if (!currentUser) return;
    setRegistros(getAuthorizedRegistros(currentUser));
    if (selectedRegistroForNotificacao && selectedRegistroForNotificacao.id === updated.id) {
      setSelectedRegistroForNotificacao(updated);
    }
    showToast(`Registro ${updated.id} atualizado com sucesso!`);
  };

  const handleOpenNotificacaoFormal = (item: SituacaoRegistro) => {
    setSelectedRegistroForNotificacao(item);
    setActiveTab('notificacao_formal');
  };

  // Open creation modal for Improvement Action
  const handleOpenCriarAcao = (registroOrigem?: SituacaoRegistro | null) => {
    setAcaoModalState({
      isOpen: true,
      registroOrigem: registroOrigem || null,
      acaoSelecionada: null,
    });
  };

  // Open detail/management modal for existing Improvement Action
  const handleOpenAcaoDetalhes = (acao: AcaoMelhoria) => {
    setAcaoModalState({
      isOpen: true,
      registroOrigem: null,
      acaoSelecionada: acao,
    });
  };

  const handleAcaoSalva = (acao: AcaoMelhoria) => {
    if (currentUser) {
      setRegistros(getAuthorizedRegistros(currentUser));
    }
    showToast(`Ação ${acao.id} processada com sucesso!`);
  };

  // If no user is authenticated, render the dedicated Institutional AuthScreen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* Header */}
      <Header
        currentUser={currentUser}
        onOpenLogin={handleLogout}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-emerald-900 text-white p-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs border border-emerald-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 w-full max-w-md mx-auto pb-24">
        {activeTab === 'home' && (
          <HomeView
            currentUser={currentUser}
            registros={registros}
            onNavigate={(tab) => {
              setSelectedItemToOpen(null);
              setActiveTab(tab);
            }}
            onSelectRegistro={handleSelectRecordFromHome}
            onOpenNotificacaoFormal={handleOpenNotificacaoFormal}
            onUpdateRegistro={handleUpdateRegistro}
            onOpenCriarAcao={handleOpenCriarAcao}
            onOpenAcaoDetalhes={handleOpenAcaoDetalhes}
          />
        )}

        {activeTab === 'registrar_situacao' && (
          <SituacaoFormView
            currentUser={currentUser}
            onSubmit={handleNewRegistro}
            onCancel={() => setActiveTab('home')}
            onOpenNotificacaoFormal={handleOpenNotificacaoFormal}
            onOpenCriarAcao={handleOpenCriarAcao}
          />
        )}

        {activeTab === 'historico' && (
          <HistoricoView
            currentUser={currentUser}
            registros={registros}
            selectedItemToOpen={selectedItemToOpen}
            onUpdateRegistro={handleUpdateRegistro}
            onOpenNotificacaoFormal={handleOpenNotificacaoFormal}
            onOpenCriarAcao={handleOpenCriarAcao}
            onOpenAcaoDetalhesById={(acaoId) => {
              const all = getAllAcoesMelhoria();
              const found = all.find((a) => a.id === acaoId);
              if (found) handleOpenAcaoDetalhes(found);
            }}
          />
        )}

        {activeTab === 'notificacao_formal' && selectedRegistroForNotificacao && (
          <NotificacaoFormalView
            currentUser={currentUser}
            registro={selectedRegistroForNotificacao}
            onBack={() => setActiveTab('historico')}
            onUpdateRegistro={handleUpdateRegistro}
            onFinishAndGoHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'perfil' && (
          <PerfilView
            currentUser={currentUser}
            onOpenSwitchAccount={handleLogout}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'admin' && (currentUser.role === 'manager' || currentUser.isAdmin) && (
          <AdminView
            currentUser={currentUser}
            registros={registros}
            onSelectRegistro={handleSelectRecordFromHome}
            onUpdateRegistro={handleUpdateRegistro}
            onOpenNotificacaoFormal={handleOpenNotificacaoFormal}
            onOpenCriarAcao={handleOpenCriarAcao}
            onOpenAcaoDetalhes={handleOpenAcaoDetalhes}
          />
        )}
      </main>

      {/* Global Improvement Action Modal */}
      <AcaoMelhoriaModal
        isOpen={acaoModalState.isOpen}
        onClose={() => setAcaoModalState({ isOpen: false, registroOrigem: null, acaoSelecionada: null })}
        currentUser={currentUser}
        registroOrigem={acaoModalState.registroOrigem}
        acaoSelecionada={acaoModalState.acaoSelecionada}
        onAcaoSalva={handleAcaoSalva}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setSelectedItemToOpen(null);
          setActiveTab(tab);
        }}
        currentUser={currentUser}
      />
    </div>
  );
}
