import { User, SituacaoRegistro } from '../types';
import { gerarHistoriaOcorrencia } from '../utils/historyGenerator';

export const DEFAULT_USERS: User[] = [
  {
    id: 'user-guardian-1',
    nome: 'Enf. Juliana Silveira',
    cargo: 'Enfermeira Assistencial',
    matricula: 'UNF-20001',
    pin: '1234',
    setor: 'Pronto Atendimento',
    email: 'juliana.silveira@unimednf.com.br',
    role: 'guardian',
    status: 'ATIVO',
    dataInicioAcesso: '2026-08-01',
    dataExpiracaoAcesso: '2026-11-30',
    dataCriacao: '2026-08-01 09:00',
    isAdmin: false,
  },
  {
    id: 'user-manager-1',
    nome: 'Coordenação de Qualidade',
    cargo: 'Gestor do Projeto',
    matricula: 'UNF-10001',
    pin: '1234',
    setor: 'Qualidade e Segurança do Paciente',
    email: 'qualidade.gestao@unimednf.com.br',
    role: 'manager',
    status: 'ATIVO',
    dataInicioAcesso: '2026-01-01',
    dataExpiracaoAcesso: '2028-12-31',
    dataCriacao: '2026-01-01 08:00',
    isAdmin: true,
  },
];

export const INITIAL_REGISTROS: SituacaoRegistro[] = [];
