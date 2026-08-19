/**
 * Guardiões das Chaves - Hospital Unimed Nova Friburgo
 * Type definitions for operational registrations, users, and form flows.
 */

export type ChaveType = 'Segurança' | 'Humanização' | 'Eficiência' | 'Excelência';

export type ImpactoType = 
  | 'Paciente'
  | 'Família/Acompanhante'
  | 'Equipe'
  | 'Processo'
  | 'Outro';

export type ResultadoClassificacao = 'OPORTUNIDADE' | 'NOTIFICACAO_FORMAL';

export interface User {
  id: string;
  nome: string;
  cargo: string;
  matricula: string;
  setor: string;
  email: string;
  isAdmin?: boolean;
}

export interface SituacaoRegistro {
  id: string;
  userId: string;
  userName: string;
  userCargo: string;
  userMatricula: string;
  userSetor?: string;

  // 1. PRIMEIRA ETAPA: O QUE, ONDE, QUANDO, CONTEXTO
  oQueAconteceu: string;               // "O que aconteceu?"
  ondeAconteceu: string[];             // Seleção múltipla de locais/setores
  ondeAconteceuOutro?: string;
  quandoAconteceu: string;             // Data e Horário
  contextoSituacao?: string;           // Campo complementar de contexto

  // 2. CHAVES RELACIONADAS (SELEÇÃO MÚLTIPLA)
  chaves: ChaveType[];                 // ☐ Segurança, ☐ Humanização, ☐ Eficiência, ☐ Excelência

  // 3. IMPACTOS (SELEÇÃO MÚLTIPLA)
  impactos: ImpactoType[];             // ☐ Paciente, ☐ Família/Acompanhante, ☐ Equipe, ☐ Processo, ☐ Outro
  impactoOutroDetalhe?: string;

  // 4. CARACTERIZAÇÃO DA SITUAÇÃO / PACIENTE
  relacaoPaciente: boolean;            // SIM / NÃO
  // Se SIM:
  identificacaoPaciente?: string;      // Nome / Iniciais / Prontuário
  leitoQuarto?: string;
  faixaEtaria?: 'Recém-nascido' | 'Pediátrico' | 'Adulto' | 'Idoso';
  grauDanoImpacto?: 'Nenhum' | 'Leve' | 'Moderado' | 'Grave';
  // Se NÃO:
  processoEquipamentoImpactado?: string;

  // 5. PROPOSTA OU AÇÕES IMEDIATAS & NOTIFICAÇÃO
  propostaAjusteAcoes: string;         // Ajuste simples ou ações adotadas
  notificadoChefia?: boolean;
  envolvidosTestemunhas?: string;
  evidenciaNome?: string;

  // 6. RESULTADO DA TRIAGEM DO REGISTRO
  resultado: ResultadoClassificacao;  // 'OPORTUNIDADE' | 'NOTIFICACAO_FORMAL'
  motivoTriagem?: string;             // Explicação da triagem por regras objetivas
  historiaFormatada?: string;         // História da ocorrência gerada para cópia

  dataCriacao: string;
  status: 'Registrado' | 'Em Análise' | 'Concluído';
}

export type ActiveTab = 'home' | 'registrar_situacao' | 'historico' | 'perfil' | 'admin';
