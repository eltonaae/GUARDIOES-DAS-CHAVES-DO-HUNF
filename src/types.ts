/**
 * Guardiões das Chaves - Hospital Unimed Nova Friburgo
 * Type definitions for Multi-user, Roles, Operational registrations, and Audit.
 */

export type ChaveType = 'Segurança' | 'Humanização' | 'Eficiência' | 'Excelência';

export type ImpactoType = 
  | 'Paciente'
  | 'Família/Acompanhante'
  | 'Equipe'
  | 'Processo'
  | 'Tempo'
  | 'Retrabalho'
  | 'Outro';

export type ResultadoClassificacao = 'OPORTUNIDADE' | 'NOTIFICACAO_FORMAL';

export type RegistroStatus = 
  | 'Registrado'
  | 'Aguardando ação'
  | 'Em análise'
  | 'Aguardando responsável'
  | 'Ação imediata'
  | 'Notificação a preparar'
  | 'Encaminhado'
  | 'Concluído';

export type UserRole = 'guardian' | 'manager' | 'admin';

export type UserStatus = 'ATIVO' | 'SUSPENSO' | 'REVOGADO' | 'EXPIRADO';

export type AcessoStatusVisual = 'ATIVO' | 'PROXIMO_VENCIMENTO' | 'EXPIRADO' | 'REVOGADO' | 'SUSPENSO';

export interface ActiveSession {
  sessionId: string;
  userId: string;
  userNome: string;
  userMatricula: string;
  userRole: UserRole;
  userSetor: string;
  ipOrDevice: string;
  loginTimestamp: string;
  lastActivityTimestamp: string;
  isRevoked: boolean;
}

export interface SecuritySettings {
  inactivityTimeoutMinutes: number; // default 15
  requirePasswordConfirmOnReturn: boolean; // default false/true
  maxLoginAttempts: number; // default 5
  lockoutDurationSeconds: number; // default 60
}

export interface SolicitacaoCorrecao {
  id: string;
  registroId: string;
  solicitanteId: string;
  solicitanteNome: string;
  solicitanteMatricula: string;
  dataHora: string;
  justificativa: string;
  camposParaCorrigir?: string;
  status: 'PENDENTE' | 'ANALISADA' | 'RECUSADA' | 'CONCLUIDA';
  parecerGestor?: string;
}

export interface User {
  id: string;
  matricula: string;
  pin: string; // Institutional access PIN / password
  nome: string;
  email: string;
  setor: string;
  cargo: string;
  role: UserRole;
  status: UserStatus;
  dataInicioAcesso: string;
  dataExpiracaoAcesso: string; // ISO date string (YYYY-MM-DD)
  dataCriacao: string;
  isAdmin?: boolean; // Convenience flag: role === 'manager' || role === 'admin'
  sessaoAtivaId?: string;
}

export interface AccessAuditLog {
  id: string;
  timestamp: string;
  executorId: string;
  executorNome: string;
  executorRole: UserRole;
  affectedUserId?: string;
  affectedUserNome?: string;
  affectedRegistroId?: string;
  acao: string;
  tipoEvento?: 
    | 'LOGIN'
    | 'LOGOUT'
    | 'TENTATIVA_LOGIN'
    | 'ACESSO_NEGADO'
    | 'ACESSO_EXPIRADO'
    | 'ACESSO_REVOGADO'
    | 'REVOGACAO_IMEDIATA'
    | 'ALTERACAO_STATUS'
    | 'ALTERACAO_VALIDADE'
    | 'SESSAO_ENCERRADA_REMOTAMENTE'
    | 'REGISTRO_CRIADO'
    | 'REGISTRO_ALTERADO'
    | 'SOLICITACAO_CORRECAO'
    | 'NOTIFICACAO_PREPARADA'
    | 'RELATO_COPIADO'
    | 'ENCAMINHAMENTO_MARCADO'
    | 'ACAO_CRIADA'
    | 'ACAO_VALIDADA'
    | 'ACAO_CONCLUIDA';
  statusAnterior?: UserStatus;
  novoStatus?: UserStatus;
  detalhes?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // "DD/MM/AAAA HH:mm"
  usuarioNome: string;
  usuarioCargo?: string;
  usuarioRole?: UserRole;
  acao: string;
  descricao?: string;
  statusResultante?: RegistroStatus;
}

export interface ComunicacaoResponsavel {
  quem: 'Responsável pelo setor' | 'Liderança imediata' | 'Qualidade' | 'NSP' | 'Outro';
  quemOutro?: string;
  quando: string;
  observacao?: string;
}

export interface EncaminhamentoAnalise {
  motivo: string;
  quando: string;
  usuarioNome: string;
  responsavelDestino: string;
  status: string;
}

export interface SituacaoRegistro {
  id: string;
  userId: string;
  userName: string;
  userCargo: string;
  userMatricula: string;
  userSetor?: string;

  // 1. PRIMEIRA ETAPA: O QUE, ONDE, QUANDO, CONTEXTO & RISCO IMEDIATO
  oQueAconteceu: string;               // "O que aconteceu?"
  ondeAconteceu: string[];             // Seleção múltipla de locais/setores
  ondeAconteceuOutro?: string;
  quandoAconteceu: string;             // Data e Horário
  contextoSituacao?: string;           // Campo complementar de contexto
  riscoImediato?: boolean;             // Risco atual / iminente que requer contenção imediata

  // 2. CHAVES RELACIONADAS (SELEÇÃO MÚLTIPLA)
  chaves: ChaveType[];                 // ☐ Segurança, ☐ Humanização, ☐ Eficiência, ☐ Excelência

  // 3. IMPACTOS (SELEÇÃO MÚLTIPLA)
  impactos: ImpactoType[];             // ☐ Paciente, ☐ Família/Acompanhante, ☐ Equipe, ☐ Processo, ☐ Outro
  impactoOutroDetalhe?: string;

  // 4. CARACTERIZAÇÃO DA SITUAÇÃO / PACIENTE / NEAR MISS (Diretrizes LGPD & Segurança)
  relacaoPaciente: boolean;            // SIM / NÃO
  identificacaoPaciente?: string;      // Iniciais ou leito institucional
  chegouAoPaciente?: 'SIM' | 'NÃO' | 'NÃO DETERMINADO';
  possibilidadeAtingirPaciente?: boolean; // Para classificação de Possível Near Miss (interceptado)
  barreiraInterceptadora?: string;     // Qual barreira evitou o impacto
  houveImpacto?: 'SIM' | 'NÃO' | 'NÃO DETERMINADO';
  houveDano?: 'SIM' | 'NÃO' | 'NÃO DETERMINADO';
  faixaEtaria?: 'Recém-nascido' | 'Pediátrico' | 'Adulto' | 'Idoso';
  grauDanoImpacto?: 'Nenhum' | 'Leve' | 'Moderado' | 'Grave';
  leitoQuarto?: string;                // Somente local institucional, sem identificação direta
  processoEquipamentoImpactado?: string;

  // 5. MOTOR DE AÇÕES IMEDIATAS & ENCAMINHAMENTO
  classificacaoPreliminar: string;     // Ex: "Atenção — Segurança do Paciente", "Possível Near Miss", "Oportunidade de Melhoria"
  acoesImediatasSelecionadas: string[]; // Múltiplas ações selecionadas
  acaoImediataFeita?: string;          // O que foi feito agora (conter, corrigir, comunicar)
  acaoMelhoriaProposta?: string;       // O que será feito para evitar recorrência
  acaoMelhoriaPrazo?: string;          // Prazo estipulado (ex: "2026-09-01")
  acaoMelhoriaStatus?: 'Pendente' | 'Em andamento' | 'Concluída' | 'Atrasada';
  acaoMelhoriaResponsavel?: string;    // Responsável designado para acompanhar
  acaoMelhoriaConcluidaEm?: string;    // Data/hora em que foi concluída
  acaoMelhoriaConcluidaNoPrazo?: boolean;
  isBoaPratica?: boolean;              // Indica se é um exemplo exemplar a multiplicar
  proximoPasso?: string;               // O que precisa acontecer a seguir
  responsavelAreaDestino?: string;     // Quem precisa agir / área acionada

  // 6. DETALHAMENTO DE AÇÕES ESPECÍFICAS
  orientacaoRealizada?: 'SIM' | 'NÃO' | 'NÃO FOI POSSÍVEL';
  orientacaoResultado?: 'Corrigido' | 'Parcialmente corrigido' | 'Permanece pendente';
  comunicacaoResponsavel?: ComunicacaoResponsavel;
  encaminhamentoAnalise?: EncaminhamentoAnalise;
  notificadoChefia?: boolean;
  envolvidosTestemunhas?: string;
  evidenciaNome?: string;

  // 7. RESULTADO DA TRIAGEM DO REGISTRO & HISTÓRIA FORMATADA
  resultado: ResultadoClassificacao;   // 'OPORTUNIDADE' | 'NOTIFICACAO_FORMAL'
  motivoTriagem?: string;              // Explicação da triagem por regras objetivas
  historiaFormatada?: string;          // História da ocorrência gerada para cópia
  relatoNotificacao?: string;          // Relato estruturado oficial para notificação
  relatoNotificacaoOriginal?: string;  // Versão original gerada pelo sistema antes de edição
  relatoRevisado?: boolean;            // Indica se o Guardião revisou/editou o texto
  relatoCopiadoEm?: string;            // Timestamp da última cópia para transferência
  encaminhadoOficial?: boolean;        // Indica se o usuário marcou como encaminhado
  encaminhadoDataHora?: string;        // Timestamp do encaminhamento
  encaminhadoPor?: string;             // Nome do usuário que registrou encaminhamento
  encaminhadoTipo?: string;            // Canal ou área de encaminhamento
  evidenciasMultiplas?: { id: string; nome: string; dataUpload: string; tamanho?: string; tipo?: string }[];

  dataCriacao: string;
  status: RegistroStatus;
  timeline: TimelineEvent[];           // Linha do tempo completa e rastreável
}

export type ActiveTab = 'home' | 'registrar_situacao' | 'historico' | 'acoes_melhoria' | 'notificacao_formal' | 'perfil' | 'admin';

export type AcaoStatus = 
  | 'NÃO INICIADA'
  | 'EM ANDAMENTO'
  | 'AGUARDANDO'
  | 'EM VALIDAÇÃO'
  | 'CONCLUÍDA'
  | 'ATRASADA';

export type AcaoPrioridade = 'BAIXA' | 'MÉDIA' | 'ALTA';

export type AcaoComplexidade = 'SIMPLES' | 'MODERADA' | 'COMPLEXA';

export type AcaoResponsavelTipo = 
  | 'Responsável do setor'
  | 'Liderança'
  | 'Qualidade'
  | 'Outro responsável'
  | 'A definir';

export type TipoBarreira = 
  | 'Falta de recurso'
  | 'Falta de aprovação'
  | 'Dependência de outro setor'
  | 'Necessidade de treinamento'
  | 'Necessidade de mudança de processo'
  | 'Necessidade de sistema/tecnologia'
  | 'Necessidade de investimento'
  | 'Falta de definição de responsável'
  | 'Outro';

export type TipoEvidencia = 
  | 'Processo alterado'
  | 'Orientação realizada'
  | 'Treinamento realizado'
  | 'Documento atualizado'
  | 'Checklist implementado'
  | 'Fluxo alterado'
  | 'Comunicação realizada'
  | 'Indicador acompanhado'
  | 'Evidência anexada'
  | 'Outro';

export type EficaciaResultado = 'SIM' | 'PARCIALMENTE' | 'NÃO' | 'AINDA NÃO É POSSÍVEL AVALIAR';

export interface AcaoAcompanhamento {
  id: string;
  dataHora: string;
  autorId: string;
  autorNome: string;
  autorRole: UserRole;
  oQueFoiFeito: string;
  andamento: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Aguardando' | 'Bloqueado';
  temBarreira: boolean;
  tipoBarreira?: TipoBarreira;
  descricaoBarreira?: string;
}

export interface AcaoEvidencia {
  tipo: TipoEvidencia;
  descricao: string;
  arquivoNome?: string;
  dataHora: string;
  registradoPorNome: string;
}

export interface AcaoAntesDepois {
  comoEra?: string;
  oQueFoiAlterado?: string;
  comoFicou?: string;
}

export interface AcaoValidacao {
  validadoPorId: string;
  validadoPorNome: string;
  validadoEm: string;
  decisao: 'VALIDADA' | 'AJUSTE_SOLICITADO';
  motivoAjuste?: string;
  parecer?: string;
}

export interface AcaoEficacia {
  avaliada: boolean;
  resultado?: EficaciaResultado;
  evidenciaDemonstrada?: string;
  avaliadoPorId?: string;
  avaliadoPorNome?: string;
  dataAvaliacao?: string;
}

export interface AcaoMelhoria {
  id: string; // e.g. "ACT-2026-001"
  registroOrigemId?: string; // e.g. "REG-2026-001"
  registrosRelacionadosIds: string[]; // ['REG-2026-001', 'REG-2026-008']
  
  // 1. O que / Problema / Melhoria / Resultado
  titulo: string; // "O QUE PRECISA MELHORAR?"
  problemaIdentificado: string; // "QUAL É O PROBLEMA?" (contexto do registro original)
  melhoriaProposta: string; // "QUAL É A MELHORIA PROPOSTA?"
  resultadoEsperado: string; // "QUAL É O RESULTADO ESPERADO?"

  // 2. Responsável
  responsavelTipo: AcaoResponsavelTipo;
  responsavelNome: string;
  responsavelSetor?: string;

  // 3. Prazo & Prioridade
  prazoTipo: 'data' | 'dias' | 'sem_prazo';
  prazoData?: string; // "YYYY-MM-DD"
  prazoDiasCalculados?: number;
  prioridade: AcaoPrioridade; // 🟢 BAIXA, 🟡 MÉDIA, 🔴 ALTA

  // 4. Origem e Contexto
  origemDescricao: string; // "Oportunidade de melhoria", "Notificação formal", etc.
  chaves: ChaveType[];
  setores: string[];
  localPrincipal: string;

  // 5. Status & Complexidade & Custo
  status: AcaoStatus;
  complexidade: AcaoComplexidade;
  exigeInvestimento: 'SIM' | 'NÃO' | 'NÃO SEI';
  necessitaAvaliacaoInvestimento?: boolean;

  // 6. Acompanhamento & Barreiras
  acompanhamentos: AcaoAcompanhamento[];
  barreirasIdentificadas: TipoBarreira[];

  // 7. Evidência, Antes/Depois
  evidencia?: AcaoEvidencia;
  antesDepois?: AcaoAntesDepois;

  // 8. Validação & Conclusão
  validacao?: AcaoValidacao;
  dataConclusao?: string;
  concluidaNoPrazo?: boolean;

  // 9. Eficácia
  eficacia?: AcaoEficacia;

  // 10. Metadados e Trilha
  criadoPorId: string;
  criadoPorNome: string;
  criadoPorRole: UserRole;
  dataCriacao: string; // "DD/MM/AAAA HH:mm"
  timeline: TimelineEvent[];
}
