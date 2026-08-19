import React, { useState } from 'react';
import {
  User,
  SituacaoRegistro,
  ActiveTab,
} from './types';
import {
  getStoredUser,
  setStoredUser,
  getRegistros,
  saveRegistro,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginModal } from './components/LoginModal';
import { HomeView } from './views/HomeView';
import { SituacaoFormView } from './views/SituacaoFormView';
import { HistoricoView } from './views/HistoricoView';
import { PerfilView } from './views/PerfilView';
import { AdminView } from './views/AdminView';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredUser());
  const [registros, setRegistros] = useState<SituacaoRegistro[]>(() => getRegistros());

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedItemToOpen, setSelectedItemToOpen] = useState<SituacaoRegistro | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    setStoredUser(user);
    showToast(`Sessão iniciada como ${user.nome}`);
  };

  const handleNewRegistro = (item: SituacaoRegistro) => {
    const updated = saveRegistro(item);
    setRegistros(updated);
    showToast(`Registro ${item.id} salvo com sucesso!`);
  };

  const handleSelectRecordFromHome = (item: SituacaoRegistro) => {
    setSelectedItemToOpen(item);
    setActiveTab('historico');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col antialiased selection:bg-emerald-200 selection:text-emerald-900">
      {/* Header */}
      <Header
        currentUser={currentUser}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-emerald-900 text-white p-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs border border-emerald-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'home' && (
          <HomeView
            currentUser={currentUser}
            registros={registros}
            onNavigate={(tab) => {
              setSelectedItemToOpen(null);
              setActiveTab(tab);
            }}
            onSelectRegistro={handleSelectRecordFromHome}
          />
        )}

        {activeTab === 'registrar_situacao' && (
          <SituacaoFormView
            currentUser={currentUser}
            onSubmit={handleNewRegistro}
            onCancel={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'historico' && (
          <HistoricoView
            currentUser={currentUser}
            registros={registros}
            selectedItemToOpen={selectedItemToOpen}
          />
        )}

        {activeTab === 'perfil' && (
          <PerfilView
            currentUser={currentUser}
            onOpenLogin={() => setLoginModalOpen(true)}
            onLogout={() => {
              setLoginModalOpen(true);
            }}
          />
        )}

        {activeTab === 'admin' && currentUser.isAdmin && (
          <AdminView
            currentUser={currentUser}
            registros={registros}
            onSelectRegistro={handleSelectRecordFromHome}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setSelectedItemToOpen(null);
          setActiveTab(tab);
        }}
        currentUser={currentUser}
      />

      {/* Login / Switch Profile Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
}
