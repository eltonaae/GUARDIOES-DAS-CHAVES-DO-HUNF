import {
  User,
  SituacaoRegistro,
  AccessAuditLog,
  UserStatus,
  UserRole,
  RegistroStatus,
  TimelineEvent,
  AcaoMelhoria,
  AcaoStatus,
  AcaoPrioridade,
  AcaoComplexidade,
  AcaoResponsavelTipo,
  TipoBarreira,
  TipoEvidencia,
  EficaciaResultado,
  AcaoAcompanhamento,
  AcaoEvidencia,
  AcaoAntesDepois,
  AcaoValidacao,
  AcaoEficacia,
} from '../types';

const STORAGE_USERS_KEY = 'guardioes_users_db_v1';
const STORAGE_CURRENT_USER_KEY = 'guardioes_current_session_v1';
const STORAGE_REGISTROS_KEY = 'guardioes_registros_db_v1';
const STORAGE_AUDIT_KEY = 'guardioes_audit_logs_v1';
const STORAGE_ACOES_KEY = 'guardioes_acoes_melhoria_db_v1';
const STORAGE_SESSIONS_KEY = 'guardioes_active_sessions_v1';
const STORAGE_SETTINGS_KEY = 'guardioes_security_settings_v1';
const STORAGE_CORRECTIONS_KEY = 'guardioes_solicitacoes_correcao_v1';
const STORAGE_LOGIN_ATTEMPTS_KEY = 'guardioes_login_attempts_v1';

// Seed initial institutional accounts (Managers, Admins, and Guardians with active, expiring, expired, and revoked states for verification)
const INITIAL_SYSTEM_USERS: User[] = [
  {
    id: 'user-manager-1',
    matricula: 'UNF-10001',
    pin: '1234',
    nome: 'Coordenação de Qualidade',
    email: 'qualidade.gestao@unimednf.com.br',
    setor: 'Qualidade e Segurança do Paciente',
    cargo: 'Gestor do Projeto',
    role: 'manager',
    status: 'ATIVO',
    dataInicioAcesso: '2026-01-01',
    dataExpiracaoAcesso: '2028-12-31',
    dataCriacao: '2026-01-01 08:00',
    isAdmin: true,
  },
  {
    id: 'user-admin-1',
    matricula: 'UNF-10000',
    pin: '1234',
    nome: 'Administrador Técnico',
    email: 'ti.sistemas@unimednf.com.br',
    setor: 'Tecnologia da Informação',
    cargo: 'Administrador da Ferramenta',
    role: 'admin',
    status: 'ATIVO',
    dataInicioAcesso: '2026-01-01',
    dataExpiracaoAcesso: '2029-12-31',
    dataCriacao: '2026-01-01 08:00',
    isAdmin: true,
  },
  {
    id: 'user-guardian-1',
    matricula: 'UNF-20001',
    pin: '1234',
    nome: 'Enf. Juliana Silveira',
    email: 'juliana.silveira@unimednf.com.br',
    setor: 'Pronto Atendimento',
    cargo: 'Enfermeira Assistencial',
    role: 'guardian',
    status: 'ATIVO',
    dataInicioAcesso: '2026-08-01',
    dataExpiracaoAcesso: '2026-11-30',
    dataCriacao: '2026-08-01 09:00',
    isAdmin: false,
  },
  {
    id: 'user-guardian-2',
    matricula: 'UNF-20002',
    pin: '1234',
    nome: 'Marcos Vinícius Ribeiro',
    email: 'marcos.ribeiro@unimednf.com.br',
    setor: 'Farmácia Hospitalar',
    cargo: 'Farmacêutico Clínico',
    role: 'guardian',
    status: 'ATIVO',
    dataInicioAcesso: '2026-08-01',
    dataExpiracaoAcesso: '2026-08-30', // Approaching expiration test
    dataCriacao: '2026-08-01 09:00',
    isAdmin: false,
  },
  {
    id: 'user-guardian-3',
    matricula: 'UNF-20003',
    pin: '1234',
    nome: 'Dr. Roberto Mendes',
    email: 'roberto.mendes@unimednf.com.br',
    setor: 'Centro Cirúrgico',
    cargo: 'Médico Cirurgião',
    role: 'guardian',
    status: 'EXPIRADO',
    dataInicioAcesso: '2026-05-01',
    dataExpiracaoAcesso: '2026-08-01', // Expired test
    dataCriacao: '2026-05-01 08:00',
    isAdmin: false,
  },
  {
    id: 'user-guardian-4',
    matricula: 'UNF-20004',
    pin: '1234',
    nome: 'Tec. Carlos Eduardo',
    email: 'carlos.eduardo@unimednf.com.br',
    setor: 'UTI Adulto',
    cargo: 'Técnico de Enfermagem',
    role: 'guardian',
    status: 'REVOGADO',
    dataInicioAcesso: '2026-07-01',
    dataExpiracaoAcesso: '2026-10-31',
    dataCriacao: '2026-07-01 08:00',
    isAdmin: false,
  },
];

// Initial seed demonstration records for realistic institutional operation
const INITIAL_SYSTEM_REGISTROS: SituacaoRegistro[] = [
  {
    id: 'REG-2026-001',
    userId: 'user-guardian-1',
    userName: 'Enf. Juliana Silveira',
    userCargo: 'Enfermeira Assistencial',
    userMatricula: 'UNF-20001',
    userSetor: 'Pronto Atendimento',
    oQueAconteceu: 'Identificada discrepância na dosagem de antibiótico prescrito antes da infusão durante a dupla checagem no leito de observação.',
    ondeAconteceu: ['Pronto Atendimento'],
    quandoAconteceu: '19/08/2026 14:30',
    contextoSituacao: 'Plantão diurno com alta demanda de pacientes no PA.',
    riscoImediato: false,
    chaves: ['Segurança', 'Eficiência'],
    impactos: ['Paciente', 'Processo'],
    relacaoPaciente: true,
    identificacaoPaciente: 'M. S. F.',
    chegouAoPaciente: 'NÃO',
    possibilidadeAtingirPaciente: true,
    barreiraInterceptadora: 'Dupla checagem obrigatória pela enfermagem à beira do leito.',
    houveImpacto: 'NÃO',
    houveDano: 'NÃO',
    faixaEtaria: 'Adulto',
    grauDanoImpacto: 'Nenhum',
    processoEquipamentoImpactado: 'Prescrição e administração de antimicrobianos',
    classificacaoPreliminar: 'Possível Near Miss — classificação preliminar',
    acoesImediatasSelecionadas: ['Corrigir ou conter imediatamente', 'Comunicar a chefia imediata'],
    acaoImediataFeita: 'Suspensão temporária da administração e alinhamento com o médico assistente para correção da prescrição.',
    acaoMelhoriaProposta: 'Reforço do treinamento da equipe assistencial e revisão do alerta em prescrição eletrônica para medicamentos de alta vigilância.',
    acaoMelhoriaPrazo: '2026-09-10',
    acaoMelhoriaStatus: 'Em andamento',
    acaoMelhoriaResponsavel: 'Coordenação de Enfermagem PA',
    proximoPasso: 'Acompanhar a implementação do pop-up de dupla checagem no sistema MV.',
    responsavelAreaDestino: 'Farmácia Clínica e TI Hospitalar',
    resultado: 'NOTIFICACAO_FORMAL',
    motivoTriagem: 'Situação com potencial impacto assistencial interceptada por barreira institucional (Near Miss) que requer notificação formal à Qualidade/NSP.',
    historiaFormatada: 'Em 19/08/2026, às 14:30, no Pronto Atendimento, durante a rotina assistencial com alta demanda, foi identificada discrepância na dosagem de antibiótico prescrito antes da infusão durante a dupla checagem. A barreira institucional de dupla checagem da enfermagem impediu que o medicamento incorreto chegasse ao paciente, evitando qualquer dano. A conduta imediata adotada foi a suspensão da administração e retificação junto ao médico assistente. Propõe-se reforço do treinamento e alerta na prescrição eletrônica.',
    relatoNotificacao: 'Em 19/08/2026, às 14:30, no Pronto Atendimento, durante a rotina assistencial com alta demanda, foi identificada discrepância na dosagem de antibiótico prescrito antes da infusão durante a dupla checagem. A barreira institucional de dupla checagem da enfermagem impediu que o medicamento incorreto chegasse ao paciente, evitando qualquer dano. A conduta imediata adotada foi a suspensão da administração e retificação junto ao médico assistente. Propõe-se reforço do treinamento e alerta na prescrição eletrônica.',
    relatoRevisado: true,
    relatoCopiadoEm: '19/08/2026 15:10',
    encaminhadoOficial: true,
    encaminhadoDataHora: '19/08/2026 15:15',
    encaminhadoPor: 'Enf. Juliana Silveira',
    encaminhadoTipo: 'Sistema Institucional de Notificação (Qualidade/NSP)',
    dataCriacao: '2026-08-19 14:35',
    status: 'Encaminhado',
    timeline: [
      {
        id: 'tl-1',
        timestamp: '19/08/2026 14:35',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioCargo: 'Enfermeira Assistencial',
        usuarioRole: 'guardian',
        acao: 'Registro da situação realizado com sucesso',
        descricao: 'Identificação de Near Miss no Pronto Atendimento com barreiras preservadas.',
        statusResultante: 'Notificação a preparar',
      },
      {
        id: 'tl-2',
        timestamp: '19/08/2026 15:10',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioCargo: 'Enfermeira Assistencial',
        usuarioRole: 'guardian',
        acao: 'Relato da notificação revisado e copiado',
        descricao: 'Texto narrativo copiado para inclusão no sistema oficial de notificação.',
        statusResultante: 'Notificação a preparar',
      },
      {
        id: 'tl-3',
        timestamp: '19/08/2026 15:15',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioCargo: 'Enfermeira Assistencial',
        usuarioRole: 'guardian',
        acao: 'Encaminhamento registrado: Sistema Institucional de Notificação (Qualidade/NSP)',
        descricao: 'Notificação formal enviada com sucesso.',
        statusResultante: 'Encaminhado',
      },
    ],
  },
  {
    id: 'REG-2026-002',
    userId: 'user-guardian-1',
    userName: 'Enf. Juliana Silveira',
    userCargo: 'Enfermeira Assistencial',
    userMatricula: 'UNF-20001',
    userSetor: 'Pronto Atendimento',
    oQueAconteceu: 'Oportunidade de reorganização visual dos kits de punção venosa periférica para reduzir tempo de busca e evitar desperdício de insumos.',
    ondeAconteceu: ['Pronto Atendimento'],
    quandoAconteceu: '18/08/2026 10:15',
    contextoSituacao: 'Posto de Enfermagem do PA durante o abastecimento da manhã.',
    riscoImediato: false,
    chaves: ['Eficiência', 'Excelência'],
    impactos: ['Processo', 'Equipe'],
    relacaoPaciente: false,
    houveImpacto: 'NÃO',
    houveDano: 'NÃO',
    grauDanoImpacto: 'Nenhum',
    classificacaoPreliminar: 'Oportunidade de melhoria de processo',
    acoesImediatasSelecionadas: ['Orientar na hora de forma construtiva', 'Planejar ação de melhoria contínua'],
    acaoImediataFeita: 'Reorganização provisória das gavetas de punção com etiquetas padronizadas.',
    acaoMelhoriaProposta: 'Padronizar método 5S com gaveteiros transparentes e checklist de reposição rápida para toda a equipe.',
    acaoMelhoriaPrazo: '2026-08-30',
    acaoMelhoriaStatus: 'Em andamento',
    acaoMelhoriaResponsavel: 'Enf. Juliana Silveira & Coordenação PA',
    proximoPasso: 'Apresentar modelo na reunião de alinhamento com os técnicos de enfermagem.',
    responsavelAreaDestino: 'Almoxarifado e Farmácia Satélite',
    resultado: 'OPORTUNIDADE',
    motivoTriagem: 'Melhoria de fluxo e processos operacionais internos sem risco assistencial ou dano ao paciente.',
    dataCriacao: '2026-08-18 10:30',
    status: 'Em análise',
    timeline: [
      {
        id: 'tl-10',
        timestamp: '18/08/2026 10:30',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioCargo: 'Enfermeira Assistencial',
        usuarioRole: 'guardian',
        acao: 'Registro de oportunidade de melhoria realizado',
        statusResultante: 'Em análise',
      },
    ],
  },
  {
    id: 'REG-2026-003',
    userId: 'user-guardian-1',
    userName: 'Enf. Juliana Silveira',
    userCargo: 'Enfermeira Assistencial',
    userMatricula: 'UNF-20001',
    userSetor: 'Pronto Atendimento',
    oQueAconteceu: 'Implementação de comunicação acolhedora no acolhimento com classificação de risco: entrega de guia explicativo de tempo de espera aos acompanhantes.',
    ondeAconteceu: ['Recepção / Triagem'],
    quandoAconteceu: '15/08/2026 16:00',
    chaves: ['Humanização', 'Excelência'],
    impactos: ['Paciente', 'Família/Acompanhante'],
    relacaoPaciente: true,
    houveImpacto: 'SIM',
    houveDano: 'NÃO',
    isBoaPratica: true,
    classificacaoPreliminar: 'Boa prática identificada',
    acoesImediatasSelecionadas: ['Compartilhar boa prática com a equipe'],
    acaoImediataFeita: 'Elogio à equipe da recepção e registro para multiplicação da prática nos demais turnos.',
    acaoMelhoriaProposta: 'Fixar modelo padrão de comunicação de acolhimento nos murais informativos e capacitar novos colaboradores.',
    acaoMelhoriaPrazo: '2026-08-25',
    acaoMelhoriaStatus: 'Concluída',
    acaoMelhoriaConcluidaEm: '17/08/2026 11:00',
    acaoMelhoriaConcluidaNoPrazo: true,
    resultado: 'OPORTUNIDADE',
    motivoTriagem: 'Prática de excelência e humanização com impacto positivo nos acompanhantes e pacientes.',
    dataCriacao: '2026-08-15 16:15',
    status: 'Concluído',
    timeline: [
      {
        id: 'tl-20',
        timestamp: '15/08/2026 16:15',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioCargo: 'Enfermeira Assistencial',
        usuarioRole: 'guardian',
        acao: 'Registro de Boa Prática de Humanização',
        statusResultante: 'Concluído',
      },
    ],
  },
  {
    id: 'REG-2026-004',
    userId: 'user-guardian-2',
    userName: 'Marcos Vinícius Ribeiro',
    userCargo: 'Farmacêutico Clínico',
    userMatricula: 'UNF-20002',
    userSetor: 'Farmácia Hospitalar',
    oQueAconteceu: 'Identificada semelhança gráfica excessiva nas ampolas de cloreto de potássio 19,1% e cloreto de sódio 20% (medicamentos LASA) recém-chegadas do fornecedor.',
    ondeAconteceu: ['Farmácia Hospitalar', 'UTI Adulto'],
    quandoAconteceu: '17/08/2026 11:20',
    contextoSituacao: 'Triagem na dispensação para o setor de Terapia Intensiva.',
    riscoImediato: true,
    chaves: ['Segurança', 'Eficiência'],
    impactos: ['Paciente', 'Processo'],
    relacaoPaciente: false,
    houveImpacto: 'NÃO',
    houveDano: 'NÃO',
    classificacaoPreliminar: 'Situação de risco / Near Miss potencial',
    acoesImediatasSelecionadas: ['Corrigir ou conter imediatamente', 'Sinalizar com etiquetas diferenciadas'],
    acaoImediataFeita: 'Aplicação imediata de fita adesiva vermelha de alerta LASA em todas as ampolas do lote antes do envio aos setores.',
    acaoMelhoriaProposta: 'Abertura de chamado junto ao setor de Compras para notificação do fabricante e aquisição de lotes com rotulagem diferenciada.',
    acaoMelhoriaPrazo: '2026-08-28',
    acaoMelhoriaStatus: 'Pendente',
    acaoMelhoriaResponsavel: 'Marcos Vinícius Ribeiro & Compras',
    proximoPasso: 'Aguardar posicionamento da distribuidora e avaliar quarentena.',
    responsavelAreaDestino: 'Setor de Compras e Farmácia Central',
    resultado: 'NOTIFICACAO_FORMAL',
    motivoTriagem: 'Medicamento de alta vigilância com risco de troca que exige notificação de tecnovigilância/farmacovigilância à Qualidade.',
    dataCriacao: '2026-08-17 11:45',
    status: 'Aguardando ação',
    timeline: [
      {
        id: 'tl-30',
        timestamp: '17/08/2026 11:45',
        usuarioNome: 'Marcos Vinícius Ribeiro',
        usuarioCargo: 'Farmacêutico Clínico',
        usuarioRole: 'guardian',
        acao: 'Registro de risco e contenção imediata LASA',
        statusResultante: 'Aguardando ação',
      },
    ],
  },
  {
    id: 'REG-2026-005',
    userId: 'user-guardian-2',
    userName: 'Marcos Vinícius Ribeiro',
    userCargo: 'Farmacêutico Clínico',
    userMatricula: 'UNF-20002',
    userSetor: 'Farmácia Hospitalar',
    oQueAconteceu: 'Otimização do tempo de dispensação de antimicrobianos para a UTI Adulto através de leitor de código de barras por radiofrequência.',
    ondeAconteceu: ['Farmácia Hospitalar', 'UTI Adulto'],
    quandoAconteceu: '12/08/2026 09:00',
    chaves: ['Eficiência', 'Segurança'],
    impactos: ['Processo', 'Tempo'],
    relacaoPaciente: false,
    houveImpacto: 'NÃO',
    houveDano: 'NÃO',
    isBoaPratica: true,
    classificacaoPreliminar: 'Boa prática de eficiência',
    acoesImediatasSelecionadas: ['Compartilhar boa prática com a equipe'],
    acaoImediataFeita: 'Validação da redução de 22 minutos no tempo médio de liberação de doses urgentes na UTI.',
    acaoMelhoriaProposta: 'Expandir o uso dos coletores de código de barras para o Centro Cirúrgico e Internação.',
    acaoMelhoriaPrazo: '2026-09-15',
    acaoMelhoriaStatus: 'Em andamento',
    acaoMelhoriaResponsavel: 'TI Hospitalar e Coordenação Farmácia',
    resultado: 'OPORTUNIDADE',
    motivoTriagem: 'Inovação de processo com ganho comprovado de agilidade e segurança na rastreabilidade.',
    dataCriacao: '2026-08-12 09:30',
    status: 'Concluído',
    timeline: [
      {
        id: 'tl-40',
        timestamp: '12/08/2026 09:30',
        usuarioNome: 'Marcos Vinícius Ribeiro',
        usuarioCargo: 'Farmacêutico Clínico',
        usuarioRole: 'guardian',
        acao: 'Registro de Boa Prática de Eficiência',
        statusResultante: 'Concluído',
      },
    ],
  },
  {
    id: 'REG-2026-006',
    userId: 'user-guardian-1',
    userName: 'Enf. Juliana Silveira',
    userCargo: 'Enfermeira Assistencial',
    userMatricula: 'UNF-20001',
    userSetor: 'Pronto Atendimento',
    oQueAconteceu: 'Checagem e reposição preventiva de lacres no carrinho de emergência da UTI Adulto antes do início do plantão noturno.',
    ondeAconteceu: ['UTI Adulto'],
    quandoAconteceu: '05/08/2026 18:40',
    chaves: ['Segurança', 'Excelência'],
    impactos: ['Paciente', 'Processo'],
    relacaoPaciente: false,
    houveImpacto: 'NÃO',
    houveDano: 'NÃO',
    isBoaPratica: true,
    classificacaoPreliminar: 'Boa prática de prontidão assistencial',
    acoesImediatasSelecionadas: ['Orientar na hora de forma construtiva'],
    acaoImediataFeita: 'Conferência do desfibrilador e laringoscópios com checklist assinado.',
    acaoMelhoriaProposta: 'Rotina de checklist digital de carrinhos de parada em todas as unidades.',
    acaoMelhoriaPrazo: '2026-08-20',
    acaoMelhoriaStatus: 'Concluída',
    acaoMelhoriaConcluidaEm: '08/08/2026 15:00',
    acaoMelhoriaConcluidaNoPrazo: true,
    resultado: 'OPORTUNIDADE',
    motivoTriagem: 'Prontidão e segurança prévia sem incidentes.',
    dataCriacao: '2026-08-05 19:00',
    status: 'Concluído',
    timeline: [
      {
        id: 'tl-50',
        timestamp: '05/08/2026 19:00',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioCargo: 'Enfermeira Assistencial',
        usuarioRole: 'guardian',
        acao: 'Registro de prontidão assistencial concluído',
        statusResultante: 'Concluído',
      },
    ],
  },
];

// Fallback in-memory storage
let memoryUsers: User[] = [...INITIAL_SYSTEM_USERS];
let memoryCurrentSession: User | null = null;
let memoryRegistros: SituacaoRegistro[] = [...INITIAL_SYSTEM_REGISTROS];
let memoryAuditLogs: AccessAuditLog[] = [];
let memoryActiveSessions: ActiveSession[] = [];
let memorySecuritySettings: SecuritySettings = {
  inactivityTimeoutMinutes: 15,
  requirePasswordConfirmOnReturn: true,
  maxLoginAttempts: 5,
  lockoutDurationSeconds: 60,
};
let memorySolicitacoesCorrecao: SolicitacaoCorrecao[] = [];

// Helper safe storage reader
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const item = window.localStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
    }
  } catch (e) {
    console.warn(`Error reading key ${key} from storage:`, e);
  }
  return fallback;
}

function setToStorage<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(data));
    }
  } catch (e) {
    console.warn(`Error writing key ${key} to storage:`, e);
  }
}

// -------------------------------------------------------------
// SECURITY SETTINGS & POLICIES
// -------------------------------------------------------------

export function getSecuritySettings(): SecuritySettings {
  const current = getFromStorage<SecuritySettings>(STORAGE_SETTINGS_KEY, memorySecuritySettings);
  memorySecuritySettings = current;
  return current;
}

export function updateSecuritySettings(newSettings: Partial<SecuritySettings>, executor: User): SecuritySettings {
  const current = getSecuritySettings();
  const updated: SecuritySettings = { ...current, ...newSettings };
  memorySecuritySettings = updated;
  setToStorage(STORAGE_SETTINGS_KEY, updated);

  logAccessAudit({
    executorId: executor.id,
    executorNome: executor.nome,
    executorRole: executor.role,
    acao: `Parâmetros de segurança e sessão atualizados (Timeout: ${updated.inactivityTimeoutMinutes}min, Max tentativas: ${updated.maxLoginAttempts})`,
    tipoEvento: 'ALTERACAO_STATUS',
  });

  return updated;
}

// -------------------------------------------------------------
// BRUTE-FORCE PROTECTION TRACKER
// -------------------------------------------------------------

interface LoginAttemptRecord {
  matricula: string;
  attempts: number;
  lastAttemptTime: number;
  lockedUntil?: number;
}

function getLoginAttempts(matricula: string): LoginAttemptRecord {
  const all = getFromStorage<Record<string, LoginAttemptRecord>>(STORAGE_LOGIN_ATTEMPTS_KEY, {});
  const clean = matricula.toUpperCase().trim();
  return all[clean] || { matricula: clean, attempts: 0, lastAttemptTime: 0 };
}

function recordFailedLoginAttempt(matricula: string, maxAttempts: number, lockoutSeconds: number): { isLocked: boolean; remainingSeconds: number } {
  const all = getFromStorage<Record<string, LoginAttemptRecord>>(STORAGE_LOGIN_ATTEMPTS_KEY, {});
  const clean = matricula.toUpperCase().trim();
  const now = Date.now();
  const record = all[clean] || { matricula: clean, attempts: 0, lastAttemptTime: now };

  // Reset if previous attempt was more than 10 minutes ago and not locked
  if (now - record.lastAttemptTime > 10 * 60 * 1000 && (!record.lockedUntil || now > record.lockedUntil)) {
    record.attempts = 0;
  }

  record.attempts += 1;
  record.lastAttemptTime = now;

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockoutSeconds * 1000;
  }

  all[clean] = record;
  setToStorage(STORAGE_LOGIN_ATTEMPTS_KEY, all);

  const isLocked = !!(record.lockedUntil && now < record.lockedUntil);
  const remainingSeconds = isLocked ? Math.ceil(((record.lockedUntil || 0) - now) / 1000) : 0;

  return { isLocked, remainingSeconds };
}

function clearLoginAttempts(matricula: string): void {
  const all = getFromStorage<Record<string, LoginAttemptRecord>>(STORAGE_LOGIN_ATTEMPTS_KEY, {});
  const clean = matricula.toUpperCase().trim();
  delete all[clean];
  setToStorage(STORAGE_LOGIN_ATTEMPTS_KEY, all);
}

// -------------------------------------------------------------
// ACTIVE SESSIONS MANAGEMENT
// -------------------------------------------------------------

export function getAllActiveSessions(): ActiveSession[] {
  const sessions = getFromStorage<ActiveSession[]>(STORAGE_SESSIONS_KEY, memoryActiveSessions);
  memoryActiveSessions = sessions;
  return sessions;
}

export function registerActiveSession(user: User, ipOrDevice = 'Navegador Web / Dispositivo Seguro'): ActiveSession {
  const sessions = getAllActiveSessions();
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newSession: ActiveSession = {
    sessionId: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    userId: user.id,
    userNome: user.nome,
    userMatricula: user.matricula,
    userRole: user.role,
    userSetor: user.setor,
    ipOrDevice,
    loginTimestamp: dateFormatted,
    lastActivityTimestamp: dateFormatted,
    isRevoked: false,
  };

  // Remove any previously active session for this user from the active list to enforce single-session hygiene if desired
  const filtered = sessions.filter((s) => s.userId !== user.id || s.isRevoked);
  const updated = [newSession, ...filtered];
  memoryActiveSessions = updated;
  setToStorage(STORAGE_SESSIONS_KEY, updated);

  return newSession;
}

export function heartbeatSession(sessionId: string): boolean {
  const sessions = getAllActiveSessions();
  const index = sessions.findIndex((s) => s.sessionId === sessionId);
  if (index === -1) return false;

  const target = sessions[index];
  if (target.isRevoked) return false;

  const now = new Date();
  target.lastActivityTimestamp = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  sessions[index] = target;
  memoryActiveSessions = sessions;
  setToStorage(STORAGE_SESSIONS_KEY, sessions);
  return true;
}

export function isSessionRevokedOrInvalid(sessionId: string): boolean {
  if (!sessionId) return true;
  const sessions = getAllActiveSessions();
  const s = sessions.find((item) => item.sessionId === sessionId);
  if (!s) return false; // Session not tracked, fallback to user check
  return s.isRevoked;
}

export function terminateActiveSession(sessionId: string, executor: User): boolean {
  const sessions = getAllActiveSessions();
  const index = sessions.findIndex((s) => s.sessionId === sessionId);
  if (index === -1) return false;

  const target = sessions[index];
  target.isRevoked = true;
  sessions[index] = target;
  memoryActiveSessions = sessions;
  setToStorage(STORAGE_SESSIONS_KEY, sessions);

  logAccessAudit({
    executorId: executor.id,
    executorNome: executor.nome,
    executorRole: executor.role,
    affectedUserId: target.userId,
    affectedUserNome: target.userNome,
    acao: `Sessão [${sessionId}] encerrada remotamente pela gestão`,
    tipoEvento: 'SESSAO_ENCERRADA_REMOTAMENTE',
  });

  return true;
}

export function terminateAllUserSessions(userId: string, executor: User): void {
  const sessions = getAllActiveSessions();
  const updated = sessions.map((s) => {
    if (s.userId === userId) {
      return { ...s, isRevoked: true };
    }
    return s;
  });
  memoryActiveSessions = updated;
  setToStorage(STORAGE_SESSIONS_KEY, updated);

  const targetUser = findUserById(userId);
  logAccessAudit({
    executorId: executor.id,
    executorNome: executor.nome,
    executorRole: executor.role,
    affectedUserId: userId,
    affectedUserNome: targetUser?.nome || userId,
    acao: `Todas as sessões ativas do usuário ${targetUser?.nome || userId} foram revogadas e encerradas`,
    tipoEvento: 'REVOGACAO_IMEDIATA',
  });
}

// -------------------------------------------------------------
// USER MANAGEMENT & REPOSITORY
// -------------------------------------------------------------

export function getAllUsers(): User[] {
  const users = getFromStorage<User[]>(STORAGE_USERS_KEY, memoryUsers);
  if (!users || users.length === 0) {
    setToStorage(STORAGE_USERS_KEY, INITIAL_SYSTEM_USERS);
    memoryUsers = [...INITIAL_SYSTEM_USERS];
    return memoryUsers;
  }
  memoryUsers = users;
  return users;
}

export function saveUsers(users: User[]): void {
  memoryUsers = users;
  setToStorage(STORAGE_USERS_KEY, users);
}

export function findUserByMatricula(matricula: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.matricula.trim().toUpperCase() === matricula.trim().toUpperCase());
}

export function findUserById(id: string): User | undefined {
  const users = getAllUsers();
  return users.find((u) => u.id === id);
}

// -------------------------------------------------------------
// SESSION AUTHENTICATION
// -------------------------------------------------------------

export interface AuthResult {
  success: boolean;
  user?: User;
  sessionId?: string;
  errorMessage?: string;
  isAccountBlocked?: boolean;
}

/**
 * Check if the user's date of access is expired based on current local date.
 */
export function checkIsExpired(user: User): boolean {
  if (!user.dataExpiracaoAcesso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(user.dataExpiracaoAcesso + 'T23:59:59');
  return today.getTime() > expDate.getTime();
}

/**
 * Calculate remaining days until access expires.
 */
export function getDaysUntilExpiration(user: User): number | null {
  if (!user.dataExpiracaoAcesso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(user.dataExpiracaoAcesso + 'T23:59:59');
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Authenticates user credentials with real validation, brute force guard, and role/status inspection.
 */
export function loginUser(matricula: string, pin: string): AuthResult {
  const cleanMatricula = matricula.trim().toUpperCase();
  const cleanPin = pin.trim();
  const settings = getSecuritySettings();

  if (!cleanMatricula || !cleanPin) {
    return { success: false, errorMessage: 'Por favor, informe a matrícula institucional e o PIN/Senha de acesso.' };
  }

  // Check Brute Force Lockout
  const attemptRecord = getLoginAttempts(cleanMatricula);
  const now = Date.now();
  if (attemptRecord.lockedUntil && now < attemptRecord.lockedUntil) {
    const remaining = Math.ceil((attemptRecord.lockedUntil - now) / 1000);
    return {
      success: false,
      isAccountBlocked: true,
      errorMessage: `Muitas tentativas incorretas. Acesso temporariamente bloqueado por ${remaining} segundos para proteção institucional.`,
    };
  }

  const user = findUserByMatricula(cleanMatricula);

  // If user does not exist or PIN is wrong -> fail generically and count attempt
  if (!user || (user.pin && user.pin !== cleanPin)) {
    const { isLocked, remainingSeconds } = recordFailedLoginAttempt(
      cleanMatricula,
      settings.maxLoginAttempts,
      settings.lockoutDurationSeconds
    );

    logAccessAudit({
      executorId: 'anonymous',
      executorNome: cleanMatricula,
      executorRole: 'guardian',
      acao: `Tentativa de login falha para a matrícula "${cleanMatricula}"`,
      tipoEvento: 'TENTATIVA_LOGIN',
    });

    if (isLocked) {
      return {
        success: false,
        isAccountBlocked: true,
        errorMessage: `Limite de 5 tentativas atingido. Acesso temporariamente bloqueado por ${remainingSeconds} segundos.`,
      };
    }

    return {
      success: false,
      errorMessage: 'Credenciais institucionais inválidas. Verifique a matrícula e o PIN/Senha.',
    };
  }

  // Clear failed attempts on correct credentials
  clearLoginAttempts(cleanMatricula);

  // Check administrative status: REVOGADO
  if (user.status === 'REVOGADO') {
    logAccessAudit({
      executorId: user.id,
      executorNome: user.nome,
      executorRole: user.role,
      affectedUserId: user.id,
      affectedUserNome: user.nome,
      acao: 'Tentativa de login bloqueada: Acesso revogado',
      tipoEvento: 'ACESSO_REVOGADO',
    });

    return {
      success: false,
      isAccountBlocked: true,
      errorMessage: 'Seu acesso à ferramenta foi revogado pelo administrador. Procure o responsável pelo projeto.',
    };
  }

  // Check expiration dynamically
  if (checkIsExpired(user) || user.status === 'EXPIRADO') {
    logAccessAudit({
      executorId: user.id,
      executorNome: user.nome,
      executorRole: user.role,
      affectedUserId: user.id,
      affectedUserNome: user.nome,
      acao: 'Tentativa de login bloqueada: Período de acesso expirado',
      tipoEvento: 'ACESSO_EXPIRADO',
    });

    return {
      success: false,
      isAccountBlocked: true,
      errorMessage: 'Seu período de acesso ao projeto Guardiões das Chaves foi encerrado. Procure o responsável pelo projeto caso precise de novo acesso.',
    };
  }

  // Check administrative status: SUSPENSO
  if (user.status === 'SUSPENSO') {
    logAccessAudit({
      executorId: user.id,
      executorNome: user.nome,
      executorRole: user.role,
      affectedUserId: user.id,
      affectedUserNome: user.nome,
      acao: 'Tentativa de login bloqueada: Acesso suspenso temporariamente',
      tipoEvento: 'ACESSO_NEGADO',
    });

    return {
      success: false,
      isAccountBlocked: true,
      errorMessage: 'Seu acesso ao Projeto Guardiões das Chaves está temporariamente suspenso. Procure a Coordenação do projeto.',
    };
  }

  // Success: Register Active Session
  const activeSession = registerActiveSession(user);
  const sessionUser: User = { ...user, sessaoAtivaId: activeSession.sessionId };

  memoryCurrentSession = sessionUser;
  setToStorage(STORAGE_CURRENT_USER_KEY, sessionUser);

  // Log audit
  logAccessAudit({
    executorId: user.id,
    executorNome: user.nome,
    executorRole: user.role,
    affectedUserId: user.id,
    affectedUserNome: user.nome,
    acao: `Login de usuário efetuado com sucesso (Sessão: ${activeSession.sessionId})`,
    tipoEvento: 'LOGIN',
    novoStatus: user.status,
  });

  return { success: true, user: sessionUser, sessionId: activeSession.sessionId };
}

export function getCurrentSession(): User | null {
  const session = getFromStorage<User | null>(STORAGE_CURRENT_USER_KEY, memoryCurrentSession);
  if (!session) return null;

  // Check if session was revoked remotely
  if (session.sessaoAtivaId && isSessionRevokedOrInvalid(session.sessaoAtivaId)) {
    logoutUser();
    return null;
  }

  // Refresh user state from database to catch immediate status/expiration changes
  const liveUser = findUserById(session.id);
  if (!liveUser) {
    logoutUser();
    return null;
  }

  if (liveUser.status !== 'ATIVO' || checkIsExpired(liveUser)) {
    logoutUser();
    return null;
  }

  const merged: User = { ...liveUser, sessaoAtivaId: session.sessaoAtivaId };
  memoryCurrentSession = merged;
  return merged;
}

export function logoutUser(reason = 'Logout voluntário'): void {
  const session = memoryCurrentSession || getFromStorage<User | null>(STORAGE_CURRENT_USER_KEY, null);
  if (session) {
    if (session.sessaoAtivaId) {
      const sessions = getAllActiveSessions();
      const sIndex = sessions.findIndex((s) => s.sessionId === session.sessaoAtivaId);
      if (sIndex !== -1) {
        sessions[sIndex].isRevoked = true;
        memoryActiveSessions = sessions;
        setToStorage(STORAGE_SESSIONS_KEY, sessions);
      }
    }

    logAccessAudit({
      executorId: session.id,
      executorNome: session.nome,
      executorRole: session.role,
      affectedUserId: session.id,
      affectedUserNome: session.nome,
      acao: `Sessão encerrada (${reason})`,
      tipoEvento: 'LOGOUT',
    });
  }

  memoryCurrentSession = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch (e) {
    console.warn('Error clearing session:', e);
  }
}

// -------------------------------------------------------------
// ADMINISTRATIVE ACTIONS ON GUARDIANS (MANAGER ROLE ONLY)
// -------------------------------------------------------------

export function createGuardian(
  manager: User,
  newGuardianData: {
    nome: string;
    matricula: string;
    cargo: string;
    setor: string;
    email: string;
    pin: string;
    dataInicioAcesso: string;
    dataExpiracaoAcesso: string;
  }
): { success: boolean; message: string; user?: User } {
  if (manager.role !== 'manager') {
    return { success: false, message: 'Operação não autorizada. Apenas Gestores podem cadastrar Guardiões.' };
  }

  const existing = findUserByMatricula(newGuardianData.matricula);
  if (existing) {
    return { success: false, message: `Já existe um usuário com a matrícula ${newGuardianData.matricula}.` };
  }

  const newGuardian: User = {
    id: `guardian-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    matricula: newGuardianData.matricula.trim().toUpperCase(),
    pin: newGuardianData.pin.trim() || '1234',
    nome: newGuardianData.nome.trim(),
    cargo: newGuardianData.cargo.trim(),
    setor: newGuardianData.setor.trim(),
    email: newGuardianData.email.trim(),
    role: 'guardian',
    status: 'ATIVO',
    dataInicioAcesso: newGuardianData.dataInicioAcesso,
    dataExpiracaoAcesso: newGuardianData.dataExpiracaoAcesso,
    dataCriacao: new Date().toISOString().replace('T', ' ').slice(0, 16),
    isAdmin: false,
  };

  const all = getAllUsers();
  const updated = [...all, newGuardian];
  saveUsers(updated);

  logAccessAudit({
    executorId: manager.id,
    executorNome: manager.nome,
    executorRole: manager.role,
    affectedUserId: newGuardian.id,
    affectedUserNome: newGuardian.nome,
    acao: `Gestor cadastrou novo Guardião (Acesso até ${newGuardian.dataExpiracaoAcesso})`,
    novoStatus: 'ATIVO',
  });

  return { success: true, message: 'Guardião cadastrado com sucesso!', user: newGuardian };
}

export function updateGuardianStatus(
  manager: User,
  guardianId: string,
  newStatus: UserStatus,
  justificativa?: string
): { success: boolean; message: string } {
  if (manager.role !== 'manager') {
    return { success: false, message: 'Operação restrita. Apenas Gestores podem alterar status de acesso.' };
  }

  const all = getAllUsers();
  const index = all.findIndex((u) => u.id === guardianId);
  if (index === -1) {
    return { success: false, message: 'Guardião não encontrado.' };
  }

  const target = all[index];
  const oldStatus = target.status;
  target.status = newStatus;
  all[index] = target;
  saveUsers(all);

  // If user being modified is currently logged in in another tab or memory, sync
  if (memoryCurrentSession && memoryCurrentSession.id === guardianId) {
    memoryCurrentSession.status = newStatus;
  }

  logAccessAudit({
    executorId: manager.id,
    executorNome: manager.nome,
    executorRole: manager.role,
    affectedUserId: target.id,
    affectedUserNome: target.nome,
    acao: `Gestor alterou status do Guardião para ${newStatus}${justificativa ? ` (${justificativa})` : ''}`,
    statusAnterior: oldStatus,
    novoStatus: newStatus,
  });

  return { success: true, message: `Status do Guardião atualizado para ${newStatus}.` };
}

export function updateGuardianExpiration(
  manager: User,
  guardianId: string,
  newExpDate: string
): { success: boolean; message: string } {
  if (manager.role !== 'manager') {
    return { success: false, message: 'Apenas Gestores podem prorrogar ou definir data de expiração.' };
  }

  const all = getAllUsers();
  const index = all.findIndex((u) => u.id === guardianId);
  if (index === -1) {
    return { success: false, message: 'Guardião não encontrado.' };
  }

  const target = all[index];
  const oldDate = target.dataExpiracaoAcesso;
  target.dataExpiracaoAcesso = newExpDate;
  if (target.status === 'EXPIRADO' && !checkIsExpired(target)) {
    target.status = 'ATIVO';
  }
  all[index] = target;
  saveUsers(all);

  logAccessAudit({
    executorId: manager.id,
    executorNome: manager.nome,
    executorRole: manager.role,
    affectedUserId: target.id,
    affectedUserNome: target.nome,
    acao: `Data de expiração de acesso alterada de ${oldDate} para ${newExpDate}`,
  });

  return { success: true, message: 'Data de expiração atualizada com sucesso!' };
}

// -------------------------------------------------------------
// REGISTROS (DURABLE & SCOPED ACCESS)
// -------------------------------------------------------------

export function getAllRegistros(): SituacaoRegistro[] {
  const list = getFromStorage<SituacaoRegistro[]>(STORAGE_REGISTROS_KEY, memoryRegistros);
  if (!list || list.length === 0) {
    setToStorage(STORAGE_REGISTROS_KEY, INITIAL_SYSTEM_REGISTROS);
    memoryRegistros = [...INITIAL_SYSTEM_REGISTROS];
    return memoryRegistros;
  }
  memoryRegistros = list;
  return list;
}

/**
 * Returns registrations strictly scoped to permission:
 * - A Guardian can only receive their own records (r.userId === currentUser.id)
 * - A Manager receives all records of the institutional scope
 */
export function getAuthorizedRegistros(currentUser: User): SituacaoRegistro[] {
  const all = getAllRegistros();
  if (currentUser.role === 'manager' || currentUser.role === 'admin' || currentUser.isAdmin) {
    return all;
  }
  return all.filter((r) => r.userId === currentUser.id);
}

/**
 * Finds a single registration ensuring access control verification.
 */
export function findRegistroById(currentUser: User, id: string): SituacaoRegistro | null {
  const all = getAllRegistros();
  const found = all.find((r) => r.id === id);
  if (!found) return null;

  // Enforce access boundary
  if (currentUser.role === 'guardian' && found.userId !== currentUser.id) {
    logAccessAudit({
      executorId: currentUser.id,
      executorNome: currentUser.nome,
      executorRole: currentUser.role,
      affectedRegistroId: id,
      acao: `Tentativa não autorizada de consulta ao registro [${id}] bloqueada`,
      tipoEvento: 'ACESSO_NEGADO',
    });
    return null;
  }

  return found;
}

/**
 * Deletion is STRICTLY FORBIDDEN for Guardians.
 * Only Managers and Technical Admins may perform soft/hard deletions if mandated.
 */
export function deleteRegistro(
  currentUser: User,
  registroId: string
): { success: boolean; message: string } {
  if (currentUser.role === 'guardian') {
    logAccessAudit({
      executorId: currentUser.id,
      executorNome: currentUser.nome,
      executorRole: currentUser.role,
      affectedRegistroId: registroId,
      acao: `Tentativa não permitida de exclusão do registro [${registroId}] pelo Guardião`,
      tipoEvento: 'ACESSO_NEGADO',
    });

    return {
      success: false,
      message: 'Guardiões não possuem permissão para excluir registros. Utilize o recurso "Solicitar Correção".',
    };
  }

  const all = getAllRegistros();
  const index = all.findIndex((r) => r.id === registroId);
  if (index === -1) {
    return { success: false, message: 'Registro não encontrado.' };
  }

  const deleted = all[index];
  const updated = all.filter((r) => r.id !== registroId);
  memoryRegistros = updated;
  setToStorage(STORAGE_REGISTROS_KEY, updated);

  logAccessAudit({
    executorId: currentUser.id,
    executorNome: currentUser.nome,
    executorRole: currentUser.role,
    affectedUserId: deleted.userId,
    affectedUserNome: deleted.userName,
    affectedRegistroId: registroId,
    acao: `Registro [${registroId}] excluído pela gestão institucional`,
    tipoEvento: 'REGISTRO_ALTERADO',
  });

  return { success: true, message: 'Registro excluído com sucesso pela gestão.' };
}

// -------------------------------------------------------------
// SOLICITAÇÃO DE CORREÇÃO (GUARDIÃO -> GESTOR)
// -------------------------------------------------------------

export function getAllSolicitacoesCorrecao(): SolicitacaoCorrecao[] {
  const list = getFromStorage<SolicitacaoCorrecao[]>(STORAGE_CORRECTIONS_KEY, memorySolicitacoesCorrecao);
  memorySolicitacoesCorrecao = list;
  return list;
}

export function getSolicitacoesCorrecao(currentUser: User): SolicitacaoCorrecao[] {
  const all = getAllSolicitacoesCorrecao();
  if (currentUser.role === 'manager' || currentUser.role === 'admin' || currentUser.isAdmin) {
    return all;
  }
  return all.filter((s) => s.solicitanteId === currentUser.id);
}

export function solicitarCorrecaoRegistro(
  currentUser: User,
  registroId: string,
  justificativa: string,
  camposParaCorrigir?: string
): { success: boolean; message: string; solicitacao?: SolicitacaoCorrecao } {
  const target = findRegistroById(currentUser, registroId);
  if (!target) {
    return { success: false, message: 'Registro não localizado ou acesso negado.' };
  }

  if (!justificativa || justificativa.trim().length < 5) {
    return { success: false, message: 'Por favor, detalhe a justificativa para a correção solicitada.' };
  }

  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newSolicitacao: SolicitacaoCorrecao = {
    id: `corr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    registroId,
    solicitanteId: currentUser.id,
    solicitanteNome: currentUser.nome,
    solicitanteMatricula: currentUser.matricula,
    dataHora: dateFormatted,
    justificativa: justificativa.trim(),
    camposParaCorrigir: camposParaCorrigir?.trim(),
    status: 'PENDENTE',
  };

  const all = getAllSolicitacoesCorrecao();
  const updated = [newSolicitacao, ...all];
  memorySolicitacoesCorrecao = updated;
  setToStorage(STORAGE_CORRECTIONS_KEY, updated);

  // Append to timeline of the target registration
  addTimelineEventToRegistro(
    currentUser,
    registroId,
    'Solicitação de correção enviada à gestão',
    `Justificativa: "${justificativa.trim()}"`
  );

  logAccessAudit({
    executorId: currentUser.id,
    executorNome: currentUser.nome,
    executorRole: currentUser.role,
    affectedRegistroId: registroId,
    acao: `Solicitação de correção de registro criada: "${justificativa.trim().slice(0, 60)}..."`,
    tipoEvento: 'SOLICITACAO_CORRECAO',
  });

  return {
    success: true,
    message: 'Solicitação de correção enviada à Coordenação de Qualidade/Gestão.',
    solicitacao: newSolicitacao,
  };
}

export function analisarSolicitacaoCorrecao(
  manager: User,
  solicitacaoId: string,
  decisao: 'ANALISADA' | 'RECUSADA' | 'CONCLUIDA',
  parecer?: string
): { success: boolean; message: string } {
  if (manager.role !== 'manager' && manager.role !== 'admin') {
    return { success: false, message: 'Apenas Gestores podem analisar solicitações de correção.' };
  }

  const all = getAllSolicitacoesCorrecao();
  const index = all.findIndex((s) => s.id === solicitacaoId);
  if (index === -1) {
    return { success: false, message: 'Solicitação não encontrada.' };
  }

  const target = all[index];
  target.status = decisao;
  target.parecerGestor = parecer;
  all[index] = target;
  memorySolicitacoesCorrecao = all;
  setToStorage(STORAGE_CORRECTIONS_KEY, all);

  logAccessAudit({
    executorId: manager.id,
    executorNome: manager.nome,
    executorRole: manager.role,
    affectedUserId: target.solicitanteId,
    affectedUserNome: target.solicitanteNome,
    affectedRegistroId: target.registroId,
    acao: `Solicitação de correção ${target.id} avaliada como "${decisao}" por ${manager.nome}`,
    tipoEvento: 'REGISTRO_ALTERADO',
  });

  return { success: true, message: `Solicitação marcada como ${decisao}.` };
}

export function saveRegistro(currentUser: User, item: SituacaoRegistro): SituacaoRegistro[] {
  // Ensure the record is irrevocably associated with the authenticating user ID
  const securedRecord: SituacaoRegistro = {
    ...item,
    userId: currentUser.id,
    userName: currentUser.nome,
    userCargo: currentUser.cargo,
    userMatricula: currentUser.matricula,
    userSetor: currentUser.setor,
  };

  const current = getAllRegistros();
  const updated = [securedRecord, ...current.filter((r) => r.id !== securedRecord.id)];
  memoryRegistros = updated;
  setToStorage(STORAGE_REGISTROS_KEY, updated);

  logAccessAudit({
    executorId: currentUser.id,
    executorNome: currentUser.nome,
    executorRole: currentUser.role,
    affectedUserId: currentUser.id,
    affectedUserNome: currentUser.nome,
    acao: `Guardião registrou situação [${securedRecord.id}] (${securedRecord.status}) - ${securedRecord.classificacaoPreliminar || securedRecord.resultado}`,
  });

  return updated;
}

export function addTimelineEventToRegistro(
  currentUser: User,
  registroId: string,
  acao: string,
  descricao?: string,
  novoStatus?: RegistroStatus
): SituacaoRegistro | null {
  const current = getAllRegistros();
  const index = current.findIndex((r) => r.id === registroId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newTimelineEvent = {
    id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: dateFormatted,
    usuarioNome: currentUser.nome,
    usuarioCargo: currentUser.cargo,
    usuarioRole: currentUser.role,
    acao,
    descricao,
    statusResultante: novoStatus || target.status,
  };

  const updatedTimeline = [...(target.timeline || []), newTimelineEvent];
  target.timeline = updatedTimeline;

  if (novoStatus) {
    target.status = novoStatus;
  }

  current[index] = target;
  memoryRegistros = current;
  setToStorage(STORAGE_REGISTROS_KEY, current);

  logAccessAudit({
    executorId: currentUser.id,
    executorNome: currentUser.nome,
    executorRole: currentUser.role,
    affectedUserId: target.userId,
    affectedUserNome: target.userName,
    acao: `Atualização de linha do tempo no registro ${target.id} (${target.status}): "${acao}"`,
  });

  return target;
}

export function atualizarRelatoNotificacao(
  currentUser: User,
  registroId: string,
  novoRelato: string,
  ehRevisaoManual = true
): SituacaoRegistro | null {
  const current = getAllRegistros();
  const index = current.findIndex((r) => r.id === registroId);
  if (index === -1) return null;

  const target = { ...current[index] };
  if (!target.relatoNotificacaoOriginal && target.relatoNotificacao) {
    target.relatoNotificacaoOriginal = target.relatoNotificacao;
  }

  target.relatoNotificacao = novoRelato;
  if (ehRevisaoManual) {
    target.relatoRevisado = true;
  }

  // Update in formatted full report as well
  target.historiaFormatada = novoRelato;

  // Add timeline entry
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const timelineEvent: TimelineEvent = {
    id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: dateFormatted,
    usuarioNome: currentUser.nome,
    usuarioCargo: currentUser.cargo,
    usuarioRole: currentUser.role,
    acao: 'Relato da notificação revisado pelo Guardião',
    descricao: 'Ajuste ou complementação do texto narrativo para o sistema oficial.',
    statusResultante: target.status,
  };

  target.timeline = [...(target.timeline || []), timelineEvent];

  current[index] = target;
  memoryRegistros = current;
  setToStorage(STORAGE_REGISTROS_KEY, current);

  logAccessAudit({
    executorId: currentUser.id,
    executorNome: currentUser.nome,
    executorRole: currentUser.role,
    affectedUserId: target.userId,
    affectedUserNome: target.userName,
    acao: `Guardião revisou relato estruturado do registro ${target.id}`,
  });

  return target;
}

export function registrarCopiaRelatoStorage(
  currentUser: User,
  registroId: string
): SituacaoRegistro | null {
  const current = getAllRegistros();
  const index = current.findIndex((r) => r.id === registroId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  target.relatoCopiadoEm = dateFormatted;

  const timelineEvent: TimelineEvent = {
    id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: dateFormatted,
    usuarioNome: currentUser.nome,
    usuarioCargo: currentUser.cargo,
    usuarioRole: currentUser.role,
    acao: 'Relato copiado para preenchimento no sistema oficial',
    descricao: 'Texto narrativo copiado para a área de transferência do dispositivo.',
    statusResultante: target.status,
  };

  target.timeline = [...(target.timeline || []), timelineEvent];

  current[index] = target;
  memoryRegistros = current;
  setToStorage(STORAGE_REGISTROS_KEY, current);

  return target;
}

export function registrarEncaminhamentoOficialStorage(
  currentUser: User,
  registroId: string,
  canalOuTipo: string,
  observacao?: string
): SituacaoRegistro | null {
  const current = getAllRegistros();
  const index = current.findIndex((r) => r.id === registroId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  target.encaminhadoOficial = true;
  target.encaminhadoDataHora = dateFormatted;
  target.encaminhadoPor = currentUser.nome;
  target.encaminhadoTipo = canalOuTipo;
  target.status = 'Encaminhado';

  const timelineEvent: TimelineEvent = {
    id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: dateFormatted,
    usuarioNome: currentUser.nome,
    usuarioCargo: currentUser.cargo,
    usuarioRole: currentUser.role,
    acao: `Encaminhamento registrado: ${canalOuTipo}`,
    descricao: observacao ? `Obs: ${observacao}` : 'Notificação realizada no fluxo institucional.',
    statusResultante: 'Encaminhado',
  };

  target.timeline = [...(target.timeline || []), timelineEvent];

  current[index] = target;
  memoryRegistros = current;
  setToStorage(STORAGE_REGISTROS_KEY, current);

  logAccessAudit({
    executorId: currentUser.id,
    executorNome: currentUser.nome,
    executorRole: currentUser.role,
    affectedUserId: target.userId,
    affectedUserNome: target.userName,
    acao: `Registro ${target.id} marcado como Encaminhado (${canalOuTipo})`,
  });

  return target;
}

export function adicionarEvidenciaAoRegistro(
  currentUser: User,
  registroId: string,
  nomeArquivo: string,
  tamanho?: string
): SituacaoRegistro | null {
  const current = getAllRegistros();
  const index = current.findIndex((r) => r.id === registroId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const novaEvidencia = {
    id: `ev-${Date.now()}`,
    nome: nomeArquivo,
    dataUpload: dateFormatted,
    tamanho: tamanho || '150 KB',
    tipo: nomeArquivo.endsWith('.pdf') ? 'documento' : 'imagem',
  };

  target.evidenciasMultiplas = [...(target.evidenciasMultiplas || []), novaEvidencia];
  target.evidenciaNome = nomeArquivo;

  const timelineEvent: TimelineEvent = {
    id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: dateFormatted,
    usuarioNome: currentUser.nome,
    usuarioCargo: currentUser.cargo,
    usuarioRole: currentUser.role,
    acao: `Evidência anexada: "${nomeArquivo}"`,
    descricao: 'Documento ou imagem de apoio de processo vinculada ao registro.',
    statusResultante: target.status,
  };

  target.timeline = [...(target.timeline || []), timelineEvent];

  current[index] = target;
  memoryRegistros = current;
  setToStorage(STORAGE_REGISTROS_KEY, current);

  return target;
}


export function concluirAcaoMelhoriaStorage(
  currentUser: User,
  registroId: string,
  observacao?: string
): SituacaoRegistro | null {
  const current = getAllRegistros();
  const index = current.findIndex((r) => r.id === registroId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Check if within deadline
  let noPrazo = true;
  if (target.acaoMelhoriaPrazo) {
    const prazoDate = new Date(target.acaoMelhoriaPrazo + 'T23:59:59');
    if (now.getTime() > prazoDate.getTime()) {
      noPrazo = false;
    }
  }

  target.acaoMelhoriaStatus = 'Concluída';
  target.acaoMelhoriaConcluidaEm = dateFormatted;
  target.acaoMelhoriaConcluidaNoPrazo = noPrazo;
  target.status = 'Concluído';

  const timelineEvent: TimelineEvent = {
    id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: dateFormatted,
    usuarioNome: currentUser.nome,
    usuarioCargo: currentUser.cargo,
    usuarioRole: currentUser.role,
    acao: 'Ação de melhoria concluída com sucesso',
    descricao: observacao ? `Observações de fechamento: ${observacao}` : 'Mais uma barreira fortalecida no processo assistencial/operacional.',
    statusResultante: 'Concluído',
  };

  target.timeline = [...(target.timeline || []), timelineEvent];

  current[index] = target;
  memoryRegistros = current;
  setToStorage(STORAGE_REGISTROS_KEY, current);

  logAccessAudit({
    executorId: currentUser.id,
    executorNome: currentUser.nome,
    executorRole: currentUser.role,
    affectedUserId: target.userId,
    affectedUserNome: target.userName,
    acao: `Ação de melhoria do registro ${target.id} concluída por ${currentUser.nome}`,
  });

  return target;
}

export function atualizarStatusAcaoMelhoriaStorage(
  currentUser: User,
  registroId: string,
  novoStatusAcao: 'Pendente' | 'Em andamento' | 'Concluída' | 'Atrasada',
  novoResponsavel?: string,
  novoPrazo?: string,
  observacao?: string
): SituacaoRegistro | null {
  const current = getAllRegistros();
  const index = current.findIndex((r) => r.id === registroId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  target.acaoMelhoriaStatus = novoStatusAcao;
  if (novoResponsavel) target.acaoMelhoriaResponsavel = novoResponsavel;
  if (novoPrazo) target.acaoMelhoriaPrazo = novoPrazo;

  if (novoStatusAcao === 'Concluída') {
    target.status = 'Concluído';
    target.acaoMelhoriaConcluidaEm = dateFormatted;
  } else if (target.status === 'Concluído') {
    target.status = 'Em análise';
  }

  const timelineEvent: TimelineEvent = {
    id: `tl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: dateFormatted,
    usuarioNome: currentUser.nome,
    usuarioCargo: currentUser.cargo,
    usuarioRole: currentUser.role,
    acao: `Status da ação de melhoria atualizado para "${novoStatusAcao}"`,
    descricao: observacao || `Responsável: ${target.acaoMelhoriaResponsavel || 'Não informado'} | Prazo: ${target.acaoMelhoriaPrazo || 'A definir'}`,
    statusResultante: target.status,
  };

  target.timeline = [...(target.timeline || []), timelineEvent];

  current[index] = target;
  memoryRegistros = current;
  setToStorage(STORAGE_REGISTROS_KEY, current);

  return target;
}

// -------------------------------------------------------------
// AUDIT LOGS
// -------------------------------------------------------------

export function logAccessAudit(log: Omit<AccessAuditLog, 'id' | 'timestamp'>): void {
  const currentLogs = getFromStorage<AccessAuditLog[]>(STORAGE_AUDIT_KEY, memoryAuditLogs);
  const now = new Date();
  const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

  const newEntry: AccessAuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: formattedDate,
    ...log,
  };

  const updated = [newEntry, ...currentLogs];
  memoryAuditLogs = updated;
  setToStorage(STORAGE_AUDIT_KEY, updated);
}

export function getAuditLogs(): AccessAuditLog[] {
  const logs = getFromStorage<AccessAuditLog[]>(STORAGE_AUDIT_KEY, memoryAuditLogs);
  memoryAuditLogs = logs;
  return logs;
}

// -------------------------------------------------------------
// CICLO DE MELHORIA: AÇÕES DE MELHORIA (BANCO INSTITUCIONAL)
// -------------------------------------------------------------

const INITIAL_SYSTEM_ACOES: AcaoMelhoria[] = [
  {
    id: 'ACT-2026-001',
    registroOrigemId: 'REG-2026-001',
    registrosRelacionadosIds: ['REG-2026-001'],
    titulo: 'Implementar alerta de dupla checagem na prescrição eletrônica',
    problemaIdentificado: 'Identificada discrepância na dosagem de antibiótico prescrito antes da infusão durante a dupla checagem no Pronto Atendimento.',
    melhoriaProposta: 'Configuração de pop-up de barreira no prontuário eletrônico MV para medicamentos de alta vigilância e revisão de rotina da enfermagem.',
    resultadoEsperado: 'Reduzir divergências entre prescrição e etiqueta antes da administração.',
    responsavelTipo: 'Responsável do setor',
    responsavelNome: 'Coordenação de Enfermagem PA',
    responsavelSetor: 'Pronto Atendimento',
    prazoTipo: 'data',
    prazoData: '2026-09-10',
    prioridade: 'ALTA',
    origemDescricao: 'Oportunidade de melhoria (Possível Near Miss)',
    chaves: ['Segurança', 'Eficiência'],
    setores: ['Pronto Atendimento', 'Farmácia Hospitalar'],
    localPrincipal: 'Pronto Atendimento',
    status: 'EM ANDAMENTO',
    complexidade: 'MODERADA',
    exigeInvestimento: 'NÃO',
    necessitaAvaliacaoInvestimento: false,
    barreirasIdentificadas: [],
    acompanhamentos: [
      {
        id: 'acomp-1',
        dataHora: '19/08/2026 16:00',
        autorId: 'user-manager-1',
        autorNome: 'Coordenação de Qualidade',
        autorRole: 'manager',
        oQueFoiFeito: 'Mapeamento de telas do sistema MV concluído com a equipe de TI Hospitalar.',
        andamento: 'Em andamento',
        temBarreira: false,
      },
    ],
    criadoPorId: 'user-guardian-1',
    criadoPorNome: 'Enf. Juliana Silveira',
    criadoPorRole: 'guardian',
    dataCriacao: '19/08/2026 14:35',
    timeline: [
      {
        id: 'tl-act-1',
        timestamp: '19/08/2026 14:35',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioCargo: 'Enfermeira Assistencial',
        usuarioRole: 'guardian',
        acao: 'Ação de melhoria criada e vinculada ao REG-2026-001',
        descricao: 'Identificação de oportunidade para prevenção de erros de dosagem.',
      },
      {
        id: 'tl-act-2',
        timestamp: '19/08/2026 15:00',
        usuarioNome: 'Coordenação de Qualidade',
        usuarioCargo: 'Gestor do Projeto',
        usuarioRole: 'manager',
        acao: 'Responsável e prazo estipulados para 10/09/2026',
        descricao: 'Coordenação de Enfermagem PA designada como condutora.',
      },
    ],
  },
  {
    id: 'ACT-2026-002',
    registroOrigemId: 'REG-2026-002',
    registrosRelacionadosIds: ['REG-2026-002'],
    titulo: 'Padronização visual e reposição 5S para kits de punção',
    problemaIdentificado: 'Dificuldade na localização rápida de kits de punção venosa durante picos de atendimento, gerando tempo excessivo de busca.',
    melhoriaProposta: 'Demarcação visual colorida e checklist de estoque mínimo por turno no posto de enfermagem.',
    resultadoEsperado: 'Redução de 40% no tempo de busca e eliminação de faltas imprevistas no leito.',
    responsavelTipo: 'Responsável do setor',
    responsavelNome: 'Enf. Juliana Silveira',
    responsavelSetor: 'Pronto Atendimento',
    prazoTipo: 'data',
    prazoData: '2026-08-25',
    prioridade: 'MÉDIA',
    origemDescricao: 'Oportunidade de melhoria operacional',
    chaves: ['Eficiência', 'Excelência'],
    setores: ['Pronto Atendimento'],
    localPrincipal: 'Pronto Atendimento',
    status: 'EM VALIDAÇÃO',
    complexidade: 'SIMPLES',
    exigeInvestimento: 'NÃO',
    necessitaAvaliacaoInvestimento: false,
    barreirasIdentificadas: [],
    evidencia: {
      tipo: 'Checklist implementado',
      descricao: 'Etiquetagem Kanban 5S concluída nos gaveteiros do posto e checklist diário de abastecimento ativado.',
      dataHora: '20/08/2026 09:30',
      registradoPorNome: 'Enf. Juliana Silveira',
    },
    antesDepois: {
      comoEra: 'Kits soltos em caixas plásticas sem ordenação de calibre e sem indicação de estoque mínimo.',
      oQueFoiAlterado: 'Gaveteiro rotulado com etiquetas coloridas por calibre e demarcação de lote de reposição.',
      comoFicou: 'Visual limpo e acessível em menos de 10 segundos, com controle visual imediato de falta.',
    },
    acompanhamentos: [
      {
        id: 'acomp-2',
        dataHora: '20/08/2026 09:30',
        autorId: 'user-guardian-1',
        autorNome: 'Enf. Juliana Silveira',
        autorRole: 'guardian',
        oQueFoiFeito: 'Etiquetagem concluída e evidência submetida para validação da liderança.',
        andamento: 'Concluído',
        temBarreira: false,
      },
    ],
    criadoPorId: 'user-guardian-1',
    criadoPorNome: 'Enf. Juliana Silveira',
    criadoPorRole: 'guardian',
    dataCriacao: '18/08/2026 10:20',
    timeline: [
      {
        id: 'tl-act-3',
        timestamp: '18/08/2026 10:20',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioCargo: 'Enfermeira Assistencial',
        usuarioRole: 'guardian',
        acao: 'Ação de melhoria criada',
      },
      {
        id: 'tl-act-4',
        timestamp: '20/08/2026 09:30',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioCargo: 'Enfermeira Assistencial',
        usuarioRole: 'guardian',
        acao: 'Evidência submetida — status alterado para EM VALIDAÇÃO',
      },
    ],
  },
  {
    id: 'ACT-2026-003',
    registroOrigemId: 'REG-2026-003',
    registrosRelacionadosIds: ['REG-2026-003'],
    titulo: 'Protocolo de comunicação compassiva e acolhimento de familiares',
    problemaIdentificado: 'Demora e ansiedade no repasse de boletins aos acompanhantes na sala de espera.',
    melhoriaProposta: 'Definição de horário fixo de acolhimento e atuação conjunta de Psicologia e Assistência Social.',
    resultadoEsperado: 'Aumento na satisfação do acompanhante e acolhimento humanizado sistemático.',
    responsavelTipo: 'Liderança',
    responsavelNome: 'Coordenação de Humanização e Psicologia',
    responsavelSetor: 'UTI Geral',
    prazoTipo: 'data',
    prazoData: '2026-08-15',
    prioridade: 'ALTA',
    origemDescricao: 'Oportunidade de melhoria em Humanização',
    chaves: ['Humanização', 'Excelência'],
    setores: ['UTI Geral'],
    localPrincipal: 'UTI Geral',
    status: 'CONCLUÍDA',
    complexidade: 'MODERADA',
    exigeInvestimento: 'NÃO',
    necessitaAvaliacaoInvestimento: false,
    barreirasIdentificadas: [],
    dataConclusao: '14/08/2026 17:00',
    concluidaNoPrazo: true,
    evidencia: {
      tipo: 'Treinamento realizado',
      descricao: 'Treinamento presencial ministrado para 100% da equipe assistencial e publicação do manual de acolhimento.',
      dataHora: '14/08/2026 16:45',
      registradoPorNome: 'Coordenação de Qualidade',
    },
    antesDepois: {
      comoEra: 'Familiares aguardavam de forma desordenada com horários flutuantes de boletim.',
      oQueFoiAlterado: 'Criação de sala exclusiva de acolhimento com cronograma rígido de informações humanizadas.',
      comoFicou: 'Ambiente acolhedor com atendimento individualizado e redução expressiva de queixas.',
    },
    validacao: {
      validadoPorId: 'user-manager-1',
      validadoPorNome: 'Coordenação de Qualidade',
      validadoEm: '14/08/2026 17:00',
      decisao: 'VALIDADA',
      parecer: 'Ação executada com excelência e evidência documental robusta.',
    },
    eficacia: {
      avaliada: true,
      resultado: 'SIM',
      evidenciaDemonstrada: 'Pesquisa de satisfação pós-alta subiu de 74% para 96% de avaliação positiva na dimensão de clareza informacional.',
      avaliadoPorId: 'user-manager-1',
      avaliadoPorNome: 'Coordenação de Qualidade',
      dataAvaliacao: '18/08/2026',
    },
    acompanhamentos: [],
    criadoPorId: 'user-guardian-2',
    criadoPorNome: 'Marcos Vinícius Ribeiro',
    criadoPorRole: 'guardian',
    dataCriacao: '05/08/2026 11:00',
    timeline: [
      {
        id: 'tl-act-5',
        timestamp: '05/08/2026 11:00',
        usuarioNome: 'Marcos Vinícius Ribeiro',
        usuarioRole: 'guardian',
        acao: 'Ação de melhoria criada',
      },
      {
        id: 'tl-act-6',
        timestamp: '14/08/2026 17:00',
        usuarioNome: 'Coordenação de Qualidade',
        usuarioRole: 'manager',
        acao: 'Ação validada e concluída com sucesso no prazo',
      },
      {
        id: 'tl-act-7',
        timestamp: '18/08/2026 14:00',
        usuarioNome: 'Coordenação de Qualidade',
        usuarioRole: 'manager',
        acao: 'Eficácia avaliada: SIM (Eficaz)',
        descricao: 'Satisfação comprovada através de indicadores de pesquisa institucional.',
      },
    ],
  },
  {
    id: 'ACT-2026-004',
    registroOrigemId: undefined,
    registrosRelacionadosIds: [],
    titulo: 'Aquisição e calibração de novos termodesinfectadores para CME',
    problemaIdentificado: 'Gargalo no processamento de instrumentais cirúrgicos em horários de pico devido à capacidade limitada dos equipamentos atuais.',
    melhoriaProposta: 'Substituição e ampliação do parque de termodesinfectadoras na Central de Material e Esterilização.',
    resultadoEsperado: 'Aumento de 50% na velocidade do ciclo de esterilização e suporte seguro ao Centro Cirúrgico.',
    responsavelTipo: 'Liderança',
    responsavelNome: 'Engenharia Clínica e Diretoria Médica',
    responsavelSetor: 'CME (Central de Material)',
    prazoTipo: 'data',
    prazoData: '2026-08-10',
    prioridade: 'ALTA',
    origemDescricao: 'Avaliação da Qualidade e Segurança',
    chaves: ['Segurança', 'Eficiência'],
    setores: ['CME (Central de Material)', 'Centro Cirúrgico'],
    localPrincipal: 'CME (Central de Material)',
    status: 'ATRASADA',
    complexidade: 'COMPLEXA',
    exigeInvestimento: 'SIM',
    necessitaAvaliacaoInvestimento: true,
    barreirasIdentificadas: ['Necessidade de investimento', 'Falta de aprovação'],
    acompanhamentos: [
      {
        id: 'acomp-3',
        dataHora: '11/08/2026 11:00',
        autorId: 'user-guardian-2',
        autorNome: 'Marcos Vinícius Ribeiro',
        autorRole: 'guardian',
        oQueFoiFeito: 'Cotações técnicas concluídas junto a três fornecedores de engenharia biomédica.',
        andamento: 'Bloqueado',
        temBarreira: true,
        tipoBarreira: 'Necessidade de investimento',
        descricaoBarreira: 'Aguardando aprovação orçamentária no comitê financeiro da diretoria.',
      },
    ],
    criadoPorId: 'user-manager-1',
    criadoPorNome: 'Coordenação de Qualidade',
    criadoPorRole: 'manager',
    dataCriacao: '01/08/2026 09:00',
    timeline: [
      {
        id: 'tl-act-8',
        timestamp: '01/08/2026 09:00',
        usuarioNome: 'Coordenação de Qualidade',
        usuarioRole: 'manager',
        acao: 'Ação criada com necessidade de investimento',
      },
      {
        id: 'tl-act-9',
        timestamp: '11/08/2026 11:00',
        usuarioNome: 'Marcos Vinícius Ribeiro',
        usuarioRole: 'guardian',
        acao: 'Barreira sistêmica registrada: Necessidade de investimento',
      },
    ],
  },
  {
    id: 'ACT-2026-005',
    registroOrigemId: undefined,
    registrosRelacionadosIds: [],
    titulo: 'Revisão do manual de conduta em altas hospitalares no sábado',
    problemaIdentificado: 'Atraso na liberação de leitos aos sábados devido à demora na entrega de receitas e atestados.',
    melhoriaProposta: 'Alinhamento com equipe médica de plantão e enfermagem para antecipação de receitas de alta.',
    resultadoEsperado: 'Giro de leito até às 11:00 nos finais de semana.',
    responsavelTipo: 'Responsável do setor',
    responsavelNome: 'A definir',
    responsavelSetor: 'Internação / Enfermarias',
    prazoTipo: 'sem_prazo',
    prioridade: 'BAIXA',
    origemDescricao: 'Oportunidade de melhoria de fluxo',
    chaves: ['Eficiência'],
    setores: ['Internação / Enfermarias'],
    localPrincipal: 'Internação / Enfermarias',
    status: 'NÃO INICIADA',
    complexidade: 'SIMPLES',
    exigeInvestimento: 'NÃO',
    necessitaAvaliacaoInvestimento: false,
    barreirasIdentificadas: [],
    acompanhamentos: [],
    criadoPorId: 'user-guardian-1',
    criadoPorNome: 'Enf. Juliana Silveira',
    criadoPorRole: 'guardian',
    dataCriacao: '19/08/2026 17:00',
    timeline: [
      {
        id: 'tl-act-10',
        timestamp: '19/08/2026 17:00',
        usuarioNome: 'Enf. Juliana Silveira',
        usuarioRole: 'guardian',
        acao: 'Ação registrada aguardando início',
      },
    ],
  },
];

let memoryAcoesMelhoria: AcaoMelhoria[] = INITIAL_SYSTEM_ACOES;

export function calcularDiasRestantesAcao(prazoData?: string): {
  dias: number;
  texto: string;
  statusPrazo: 'em_dia' | 'vence_hoje' | 'alerta_3d' | 'alerta_7d' | 'atrasada' | 'sem_prazo';
} {
  if (!prazoData) {
    return { dias: 999, texto: 'Sem prazo definido', statusPrazo: 'sem_prazo' };
  }

  const now = new Date();
  // Zero out time components for precise day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [year, month, day] = prazoData.split('-').map(Number);
  const target = new Date(year, month - 1, day);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return {
      dias: diffDays,
      texto: absDays === 1 ? 'Atrasada há 1 dia' : `Atrasada há ${absDays} dias`,
      statusPrazo: 'atrasada',
    };
  }

  if (diffDays === 0) {
    return { dias: 0, texto: 'A ação vence hoje', statusPrazo: 'vence_hoje' };
  }

  if (diffDays <= 3) {
    return {
      dias: diffDays,
      texto: `Esta ação precisa de atenção (${diffDays === 1 ? 'vence amanhã' : `faltam ${diffDays} dias`})`,
      statusPrazo: 'alerta_3d',
    };
  }

  if (diffDays <= 7) {
    return {
      dias: diffDays,
      texto: `Esta ação vence em ${diffDays} dias`,
      statusPrazo: 'alerta_7d',
    };
  }

  return {
    dias: diffDays,
    texto: `Faltam ${diffDays} dias`,
    statusPrazo: 'em_dia',
  };
}

export function getAllAcoesMelhoria(): AcaoMelhoria[] {
  const acoes = getFromStorage<AcaoMelhoria[]>(STORAGE_ACOES_KEY, memoryAcoesMelhoria);

  // Auto-check for overdue status on items not finished or in validation
  let hasChanges = false;
  const updated = acoes.map((a) => {
    if (a.status !== 'CONCLUÍDA' && a.status !== 'EM VALIDAÇÃO' && a.prazoData) {
      const calc = calcularDiasRestantesAcao(a.prazoData);
      if (calc.statusPrazo === 'atrasada' && a.status !== 'ATRASADA') {
        hasChanges = true;
        return { ...a, status: 'ATRASADA' as AcaoStatus };
      }
    }
    return a;
  });

  if (hasChanges) {
    memoryAcoesMelhoria = updated;
    setToStorage(STORAGE_ACOES_KEY, updated);
  } else {
    memoryAcoesMelhoria = acoes;
  }

  return memoryAcoesMelhoria;
}

export function getAcaoMelhoriaById(id: string): AcaoMelhoria | undefined {
  const acoes = getAllAcoesMelhoria();
  return acoes.find((a) => a.id === id);
}

export function getAcoesMelhoriaForUser(user: User): AcaoMelhoria[] {
  const acoes = getAllAcoesMelhoria();
  if (user.role === 'manager' || user.role === 'admin' || user.isAdmin) {
    return acoes;
  }
  // Guardians see:
  // 1. Actions they created
  // 2. Actions linked to their registrations
  // 3. Actions linked to their sector
  const userRegs = getAuthorizedRegistros(user).map((r) => r.id);

  return acoes.filter((a) => {
    if (a.criadoPorId === user.id) return true;
    if (a.responsavelNome && a.responsavelNome.toLowerCase().includes(user.nome.toLowerCase())) return true;
    if (a.registroOrigemId && userRegs.includes(a.registroOrigemId)) return true;
    if (a.registrosRelacionadosIds?.some((id) => userRegs.includes(id))) return true;
    if (a.setores?.includes(user.setor) || a.localPrincipal === user.setor) return true;
    return false;
  });
}

export function getAcoesMelhoriaByRegistroId(registroId: string): AcaoMelhoria[] {
  const acoes = getAllAcoesMelhoria();
  return acoes.filter(
    (a) => a.registroOrigemId === registroId || a.registrosRelacionadosIds?.includes(registroId)
  );
}

export function getSimilarAcoesParaRegistro(registro: {
  id?: string;
  ondeAconteceu?: string[];
  chaves?: string[];
  oQueAconteceu?: string;
}): AcaoMelhoria[] {
  const acoes = getAllAcoesMelhoria();
  return acoes.filter((a) => {
    // Exclude if already linked
    if (registro.id && (a.registroOrigemId === registro.id || a.registrosRelacionadosIds?.includes(registro.id))) {
      return false;
    }
    // Only active actions
    if (a.status === 'CONCLUÍDA') return false;

    // Match sector
    const sectorMatch = registro.ondeAconteceu?.some((loc) => a.setores?.includes(loc) || a.localPrincipal === loc);
    // Match key
    const keyMatch = registro.chaves?.some((k) => a.chaves?.includes(k as any));

    return sectorMatch || keyMatch;
  });
}

export function salvarNovaAcaoMelhoria(
  dados: Partial<AcaoMelhoria>,
  currentUser: User,
  registroOrigem?: SituacaoRegistro
): AcaoMelhoria {
  const current = getAllAcoesMelhoria();
  const nextNumber = current.length + 1;
  const newId = `ACT-2026-${String(nextNumber).padStart(3, '0')}`;

  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const relatedRegs: string[] = [];
  if (registroOrigem?.id) {
    relatedRegs.push(registroOrigem.id);
  }
  if (dados.registrosRelacionadosIds) {
    dados.registrosRelacionadosIds.forEach((id) => {
      if (!relatedRegs.includes(id)) relatedRegs.push(id);
    });
  }

  const novaAcao: AcaoMelhoria = {
    id: newId,
    registroOrigemId: registroOrigem?.id || dados.registroOrigemId,
    registrosRelacionadosIds: relatedRegs,
    titulo: dados.titulo || 'Nova Ação de Melhoria',
    problemaIdentificado: dados.problemaIdentificado || registroOrigem?.oQueAconteceu || 'Não informado',
    melhoriaProposta: dados.melhoriaProposta || '',
    resultadoEsperado: dados.resultadoEsperado || '',
    responsavelTipo: dados.responsavelTipo || 'A definir',
    responsavelNome: dados.responsavelNome || 'A definir',
    responsavelSetor: dados.responsavelSetor || registroOrigem?.ondeAconteceu?.[0] || 'Hospital Geral',
    prazoTipo: dados.prazoTipo || 'data',
    prazoData: dados.prazoData,
    prioridade: dados.prioridade || 'MÉDIA',
    origemDescricao: dados.origemDescricao || (registroOrigem ? `Registro ${registroOrigem.id}` : 'Oportunidade Direta'),
    chaves: dados.chaves || registroOrigem?.chaves || ['Segurança'],
    setores: dados.setores || registroOrigem?.ondeAconteceu || ['Geral'],
    localPrincipal: dados.localPrincipal || registroOrigem?.ondeAconteceu?.[0] || 'Geral',
    status: 'NÃO INICIADA',
    complexidade: dados.complexidade || 'SIMPLES',
    exigeInvestimento: dados.exigeInvestimento || 'NÃO',
    necessitaAvaliacaoInvestimento: dados.exigeInvestimento === 'SIM',
    barreirasIdentificadas: [],
    acompanhamentos: [],
    criadoPorId: currentUser.id,
    criadoPorNome: currentUser.nome,
    criadoPorRole: currentUser.role,
    dataCriacao: dateFormatted,
    timeline: [
      {
        id: `tl-act-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        usuarioCargo: currentUser.cargo,
        usuarioRole: currentUser.role,
        acao: `Ação de melhoria criada ${registroOrigem ? `com vínculo ao registro ${registroOrigem.id}` : ''}`,
        descricao: `Responsável: ${dados.responsavelNome || 'A definir'} | Prazo: ${dados.prazoData || 'A definir'} | Prioridade: ${dados.prioridade || 'MÉDIA'}`,
      },
    ],
  };

  const updated = [novaAcao, ...current];
  memoryAcoesMelhoria = updated;
  setToStorage(STORAGE_ACOES_KEY, updated);

  // If created from a registration, update the registration's timeline and improvement action preview
  if (registroOrigem) {
    const allRegs = getAllRegistros();
    const regIndex = allRegs.findIndex((r) => r.id === registroOrigem.id);
    if (regIndex !== -1) {
      const reg = { ...allRegs[regIndex] };
      reg.acaoMelhoriaProposta = novaAcao.melhoriaProposta;
      reg.acaoMelhoriaResponsavel = novaAcao.responsavelNome;
      reg.acaoMelhoriaPrazo = novaAcao.prazoData;
      reg.acaoMelhoriaStatus = 'Em andamento';
      reg.timeline = [
        ...(reg.timeline || []),
        {
          id: `tl-${Date.now()}`,
          timestamp: dateFormatted,
          usuarioNome: currentUser.nome,
          usuarioCargo: currentUser.cargo,
          usuarioRole: currentUser.role,
          acao: `Ação de melhoria ${novaAcao.id} vinculada`,
          descricao: `Melhoria proposta: "${novaAcao.titulo}" | Responsável: ${novaAcao.responsavelNome}`,
          statusResultante: reg.status,
        },
      ];
      allRegs[regIndex] = reg;
      memoryRegistros = allRegs;
      setToStorage(STORAGE_REGISTROS_KEY, allRegs);
    }
  }

  return novaAcao;
}

export function vincularRegistroAcaoExistente(
  acaoId: string,
  registroId: string,
  currentUser: User
): AcaoMelhoria | null {
  const current = getAllAcoesMelhoria();
  const index = current.findIndex((a) => a.id === acaoId);
  if (index === -1) return null;

  const target = { ...current[index] };
  if (!target.registrosRelacionadosIds) target.registrosRelacionadosIds = [];

  if (!target.registrosRelacionadosIds.includes(registroId)) {
    target.registrosRelacionadosIds.push(registroId);
  }

  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  target.timeline = [
    ...(target.timeline || []),
    {
      id: `tl-link-${Date.now()}`,
      timestamp: dateFormatted,
      usuarioNome: currentUser.nome,
      usuarioCargo: currentUser.cargo,
      usuarioRole: currentUser.role,
      acao: `Registro recorrente ${registroId} vinculado à ação de melhoria`,
      descricao: 'Oportunidade similar associada para acompanhamento unificado.',
    },
  ];

  current[index] = target;
  memoryAcoesMelhoria = current;
  setToStorage(STORAGE_ACOES_KEY, current);

  // Also update the target registration's timeline
  const allRegs = getAllRegistros();
  const regIndex = allRegs.findIndex((r) => r.id === registroId);
  if (regIndex !== -1) {
    const reg = { ...allRegs[regIndex] };
    reg.timeline = [
      ...(reg.timeline || []),
      {
        id: `tl-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        usuarioCargo: currentUser.cargo,
        usuarioRole: currentUser.role,
        acao: `Vinculado à Ação de Melhoria ${target.id}`,
        descricao: `Ação em andamento: "${target.titulo}" | Responsável: ${target.responsavelNome}`,
        statusResultante: reg.status,
      },
    ];
    allRegs[regIndex] = reg;
    memoryRegistros = allRegs;
    setToStorage(STORAGE_REGISTROS_KEY, allRegs);
  }

  return target;
}

export function adicionarAcompanhamentoAcaoMelhoria(
  acaoId: string,
  acompData: {
    oQueFoiFeito: string;
    andamento: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Aguardando' | 'Bloqueado';
    temBarreira: boolean;
    tipoBarreira?: TipoBarreira;
    descricaoBarreira?: string;
  },
  currentUser: User
): AcaoMelhoria | null {
  const current = getAllAcoesMelhoria();
  const index = current.findIndex((a) => a.id === acaoId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newAcomp: AcaoAcompanhamento = {
    id: `acomp-${Date.now()}`,
    dataHora: dateFormatted,
    autorId: currentUser.id,
    autorNome: currentUser.nome,
    autorRole: currentUser.role,
    oQueFoiFeito: acompData.oQueFoiFeito,
    andamento: acompData.andamento,
    temBarreira: acompData.temBarreira,
    tipoBarreira: acompData.tipoBarreira,
    descricaoBarreira: acompData.descricaoBarreira,
  };

  target.acompanhamentos = [newAcomp, ...(target.acompanhamentos || [])];

  // Update status based on progress
  if (acompData.andamento === 'Em andamento' && target.status === 'NÃO INICIADA') {
    target.status = 'EM ANDAMENTO';
  } else if (acompData.andamento === 'Aguardando' || acompData.andamento === 'Bloqueado') {
    target.status = 'AGUARDANDO';
  }

  if (acompData.temBarreira && acompData.tipoBarreira) {
    if (!target.barreirasIdentificadas) target.barreirasIdentificadas = [];
    if (!target.barreirasIdentificadas.includes(acompData.tipoBarreira)) {
      target.barreirasIdentificadas.push(acompData.tipoBarreira);
    }
  }

  target.timeline = [
    ...(target.timeline || []),
    {
      id: `tl-acomp-${Date.now()}`,
      timestamp: dateFormatted,
      usuarioNome: currentUser.nome,
      usuarioCargo: currentUser.cargo,
      usuarioRole: currentUser.role,
      acao: `Acompanhamento registrado (${acompData.andamento})`,
      descricao: `${acompData.oQueFoiFeito}${acompData.temBarreira ? ` [Barreira: ${acompData.tipoBarreira}]` : ''}`,
    },
  ];

  current[index] = target;
  memoryAcoesMelhoria = current;
  setToStorage(STORAGE_ACOES_KEY, current);

  return target;
}

export function submeterEvidenciaConclusaoAcao(
  acaoId: string,
  payload: {
    evidencia: AcaoEvidencia;
    antesDepois?: AcaoAntesDepois;
  },
  currentUser: User
): AcaoMelhoria | null {
  const current = getAllAcoesMelhoria();
  const index = current.findIndex((a) => a.id === acaoId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  target.evidencia = payload.evidencia;
  if (payload.antesDepois) {
    target.antesDepois = payload.antesDepois;
  }
  target.status = 'EM VALIDAÇÃO';

  target.timeline = [
    ...(target.timeline || []),
    {
      id: `tl-evid-${Date.now()}`,
      timestamp: dateFormatted,
      usuarioNome: currentUser.nome,
      usuarioCargo: currentUser.cargo,
      usuarioRole: currentUser.role,
      acao: 'Evidência de conclusão submetida para validação da liderança',
      descricao: `Evidência: ${payload.evidencia.tipo} — "${payload.evidencia.descricao}"`,
    },
  ];

  current[index] = target;
  memoryAcoesMelhoria = current;
  setToStorage(STORAGE_ACOES_KEY, current);

  return target;
}

export function validarConclusaoAcaoMelhoria(
  acaoId: string,
  validacaoData: {
    decisao: 'VALIDADA' | 'AJUSTE_SOLICITADO';
    parecer?: string;
    motivoAjuste?: string;
  },
  currentUser: User
): AcaoMelhoria | null {
  // Only Managers or Authorized leads can validate
  if (currentUser.role !== 'manager' && !currentUser.isAdmin) {
    return null;
  }

  const current = getAllAcoesMelhoria();
  const index = current.findIndex((a) => a.id === acaoId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  target.validacao = {
    validadoPorId: currentUser.id,
    validadoPorNome: currentUser.nome,
    validadoEm: dateFormatted,
    decisao: validacaoData.decisao,
    motivoAjuste: validacaoData.motivoAjuste,
    parecer: validacaoData.parecer,
  };

  if (validacaoData.decisao === 'VALIDADA') {
    target.status = 'CONCLUÍDA';
    target.dataConclusao = dateFormatted;

    // Check if finished on time
    if (target.prazoData) {
      const calc = calcularDiasRestantesAcao(target.prazoData);
      target.concluidaNoPrazo = calc.dias >= 0;
    } else {
      target.concluidaNoPrazo = true;
    }

    target.timeline = [
      ...(target.timeline || []),
      {
        id: `tl-val-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        usuarioCargo: currentUser.cargo,
        usuarioRole: currentUser.role,
        acao: 'Conclusão da ação de melhoria validada pela gestão',
        descricao: validacaoData.parecer || 'Ação validada com sucesso com base nas evidências comprovadas.',
      },
    ];

    // Propagate to linked registration(s)
    const allRegs = getAllRegistros();
    let regUpdated = false;
    allRegs.forEach((r, idx) => {
      if (r.id === target.registroOrigemId || target.registrosRelacionadosIds?.includes(r.id)) {
        allRegs[idx] = {
          ...r,
          status: 'Concluído',
          acaoMelhoriaStatus: 'Concluída',
          acaoMelhoriaConcluidaEm: dateFormatted,
          acaoMelhoriaConcluidaNoPrazo: target.concluidaNoPrazo,
        };
        regUpdated = true;
      }
    });
    if (regUpdated) {
      memoryRegistros = allRegs;
      setToStorage(STORAGE_REGISTROS_KEY, allRegs);
    }
  } else {
    // Adjustment requested -> returns to EM ANDAMENTO
    target.status = 'EM ANDAMENTO';
    target.timeline = [
      ...(target.timeline || []),
      {
        id: `tl-val-${Date.now()}`,
        timestamp: dateFormatted,
        usuarioNome: currentUser.nome,
        usuarioCargo: currentUser.cargo,
        usuarioRole: currentUser.role,
        acao: 'Ajuste solicitado pelo gestor — retornado para EM ANDAMENTO',
        descricao: `Motivo: ${validacaoData.motivoAjuste || 'Ajuste necessário nas evidências apresentadas.'}`,
      },
    ];
  }

  current[index] = target;
  memoryAcoesMelhoria = current;
  setToStorage(STORAGE_ACOES_KEY, current);

  return target;
}

export function avaliarEficaciaAcaoMelhoria(
  acaoId: string,
  resultado: EficaciaResultado,
  evidenciaDemonstrada: string,
  currentUser: User
): AcaoMelhoria | null {
  if (currentUser.role !== 'manager' && !currentUser.isAdmin) {
    return null;
  }

  const current = getAllAcoesMelhoria();
  const index = current.findIndex((a) => a.id === acaoId);
  if (index === -1) return null;

  const target = { ...current[index] };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  target.eficacia = {
    avaliada: resultado !== 'AINDA NÃO É POSSÍVEL AVALIAR',
    resultado: resultado,
    evidenciaDemonstrada: evidenciaDemonstrada,
    avaliadoPorId: currentUser.id,
    avaliadoPorNome: currentUser.nome,
    dataAvaliacao: dateFormatted,
  };

  target.timeline = [
    ...(target.timeline || []),
    {
      id: `tl-efic-${Date.now()}`,
      timestamp: `${dateFormatted} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      usuarioNome: currentUser.nome,
      usuarioCargo: currentUser.cargo,
      usuarioRole: currentUser.role,
      acao: `Avaliação de Eficácia registrada: ${resultado}`,
      descricao: `Evidência demonstrada: "${evidenciaDemonstrada}"`,
    },
  ];

  current[index] = target;
  memoryAcoesMelhoria = current;
  setToStorage(STORAGE_ACOES_KEY, current);

  return target;
}

export function atualizarConfiguracaoAcaoMelhoria(
  acaoId: string,
  updates: Partial<AcaoMelhoria>,
  currentUser: User
): AcaoMelhoria | null {
  const current = getAllAcoesMelhoria();
  const index = current.findIndex((a) => a.id === acaoId);
  if (index === -1) return null;

  const target = { ...current[index], ...updates };
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  target.timeline = [
    ...(target.timeline || []),
    {
      id: `tl-cfg-${Date.now()}`,
      timestamp: dateFormatted,
      usuarioNome: currentUser.nome,
      usuarioCargo: currentUser.cargo,
      usuarioRole: currentUser.role,
      acao: 'Parâmetros da ação atualizados pela gestão',
      descricao: `Responsável: ${target.responsavelNome} | Prazo: ${target.prazoData || 'A definir'} | Prioridade: ${target.prioridade} | Status: ${target.status}`,
    },
  ];

  current[index] = target;
  memoryAcoesMelhoria = current;
  setToStorage(STORAGE_ACOES_KEY, current);

  return target;
}
