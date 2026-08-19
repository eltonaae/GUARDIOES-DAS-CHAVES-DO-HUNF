import { User, SituacaoRegistro } from '../types';
import { gerarHistoriaOcorrencia } from '../utils/historyGenerator';

export const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    nome: 'Enf. Ana Paula Santos',
    cargo: 'Enfermeira Chefe',
    matricula: 'UNF-84920',
    setor: 'UTI Adulto',
    email: 'ana.santos@unimednf.com.br',
    isAdmin: false,
  },
  {
    id: 'user-2',
    nome: 'Dr. Carlos Eduardo Silva',
    cargo: 'Médico Plantonista',
    matricula: 'UNF-91204',
    setor: 'Pronto Atendimento',
    email: 'carlos.silva@unimednf.com.br',
    isAdmin: false,
  },
  {
    id: 'user-3',
    nome: 'Roberto Almeida',
    cargo: 'Técnico em Enfermagem',
    matricula: 'UNF-73105',
    setor: 'Unidade de Internação 2º Andar',
    email: 'roberto.almeida@unimednf.com.br',
    isAdmin: false,
  },
  {
    id: 'user-admin',
    nome: 'Juliana Lima',
    cargo: 'Coordenadora Operacional',
    matricula: 'UNF-10293',
    setor: 'Gestão Operacional',
    email: 'juliana.lima@unimednf.com.br',
    isAdmin: true,
  },
];

export const INITIAL_REGISTROS: SituacaoRegistro[] = [
  {
    id: 'REG-2026-001',
    userId: 'user-1',
    userName: 'Enf. Ana Paula Santos',
    userCargo: 'Enfermeira Chefe',
    userMatricula: 'UNF-84920',
    userSetor: 'UTI Adulto',

    oQueAconteceu: 'Durante a conferência de medicação pré-administração (dupla checagem), a enfermeira identificou que a dosagem de antibiótico prescrita no sistema constava com valor diferente da etiqueta de farmácia enviada. A medicação NÃO foi administrada ao paciente.',
    ondeAconteceu: ['UTI Adulto', 'Farmácia Central'],
    quandoAconteceu: '2026-08-11 07:15',
    contextoSituacao: 'Momento de passagem de plantão da manhã e recebimento dos medicamentos do turno.',
    
    chaves: ['Segurança', 'Eficiência'],
    impactos: ['Paciente', 'Processo'],

    relacaoPaciente: true,
    identificacaoPaciente: 'M.R.S. (Prontuário 481920)',
    leitoQuarto: 'UTI Leito 02',
    faixaEtaria: 'Idoso',
    grauDanoImpacto: 'Nenhum',

    propostaAjusteAcoes: 'Suspensão imediata da medicação, contato com a Farmácia Central para retificação da etiqueta e alinhamento do protocolo de dupla checagem.',
    notificadoChefia: true,
    envolvidosTestemunhas: 'Enfermagem UTI Adulto e Farmácia Central',
    evidenciaNome: 'conferencia_etiqueta_farmacia.pdf',

    resultado: 'NOTIFICACAO_FORMAL',
    motivoTriagem: 'Situação envolvendo paciente notificada à chefia com risco na cadeia de dispensação de medicação.',
    dataCriacao: '2026-08-11 07:30',
    status: 'Em Análise',
  },
  {
    id: 'REG-2026-002',
    userId: 'user-2',
    userName: 'Dr. Carlos Eduardo Silva',
    userCargo: 'Médico Plantonista',
    userMatricula: 'UNF-91204',
    userSetor: 'Pronto Atendimento',

    oQueAconteceu: 'Acompanhante do leito 203 da Internação expressou incerteza quanto ao horário de boletim médico e rotina de medicação, gerando ansiedade na família.',
    ondeAconteceu: ['Unidade de Internação', 'Recepção'],
    quandoAconteceu: '2026-08-10 14:20',
    contextoSituacao: 'Atendimento na recepção durante o horário de visitas.',

    chaves: ['Humanização', 'Excelência'],
    impactos: ['Família/Acompanhante', 'Paciente'],

    relacaoPaciente: true,
    identificacaoPaciente: 'A.L.G. (Leito 203)',
    leitoQuarto: 'Quarto 203',
    faixaEtaria: 'Adulto',
    grauDanoImpacto: 'Nenhum',

    propostaAjusteAcoes: 'Entregar folheto informativo com os horários de conversa médica e reforçar a explicação no momento da admissão do paciente.',
    notificadoChefia: false,

    resultado: 'OPORTUNIDADE',
    motivoTriagem: 'Esta situação foi registrada como uma oportunidade de melhoria para aperfeiçoamento do fluxo de comunicação com acompanhantes.',
    dataCriacao: '2026-08-10 14:45',
    status: 'Concluído',
  },
  {
    id: 'REG-2026-003',
    userId: 'user-3',
    userName: 'Roberto Almeida',
    userCargo: 'Técnico em Enfermagem',
    userMatricula: 'UNF-73105',
    userSetor: 'Unidade de Internação 2º Andar',

    oQueAconteceu: 'Os kits de curativo complexo estavam armazenados em prateleiras distantes do posto de enfermagem, exigindo deslocamentos repetidos durante os procedimentos da manhã.',
    ondeAconteceu: ['Unidade de Internação', 'Farmácia Central'],
    quandoAconteceu: '2026-08-09 09:10',
    contextoSituacao: 'Rotina matinal de curativos na internação.',

    chaves: ['Eficiência', 'Segurança'],
    impactos: ['Equipe', 'Processo'],

    relacaoPaciente: false,
    processoEquipamentoImpactado: 'Organização do estoque satélite do posto de enfermagem e fluxo de dispensação de insumos.',

    propostaAjusteAcoes: 'Reorganizar o carrinho de apoio com estoque mínimo diário de insumos diretamente no posto de enfermagem.',
    notificadoChefia: false,

    resultado: 'OPORTUNIDADE',
    motivoTriagem: 'Ajuste operacional de processo e eficiência interna sem dano direto a paciente.',
    dataCriacao: '2026-08-09 09:40',
    status: 'Registrado',
  },
  {
    id: 'REG-2026-004',
    userId: 'user-1',
    userName: 'Enf. Ana Paula Santos',
    userCargo: 'Enfermeira Chefe',
    userMatricula: 'UNF-84920',
    userSetor: 'UTI Adulto',

    oQueAconteceu: 'Sinalização de melhoria na higienização rápida e acolhimento das cadeiras de rodas na entrada principal da recepção do Pronto Atendimento.',
    ondeAconteceu: ['Pronto Atendimento', 'Recepção'],
    quandoAconteceu: '2026-08-08 11:00',

    chaves: ['Humanização', 'Excelência'],
    impactos: ['Paciente', 'Equipe'],

    relacaoPaciente: false,
    processoEquipamentoImpactado: 'Equipamentos de mobilidade da recepção e higiene sanitária.',

    propostaAjusteAcoes: 'Padronizar a rotina de limpeza preventiva rápida desenvolvida pela equipe da recepção como boa prática institucional.',
    notificadoChefia: false,

    resultado: 'OPORTUNIDADE',
    motivoTriagem: 'Sinalização de boa prática e oportunidade de padronização.',
    dataCriacao: '2026-08-08 11:30',
    status: 'Concluído',
  },
];

// Pre-fill historiaFormatada for records with NOTIFICACAO_FORMAL
INITIAL_REGISTROS.forEach(reg => {
  if (reg.resultado === 'NOTIFICACAO_FORMAL') {
    reg.historiaFormatada = gerarHistoriaOcorrencia(reg);
  }
});
