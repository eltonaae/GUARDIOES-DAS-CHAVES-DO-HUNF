import { SituacaoRegistro } from '../types';

/**
 * Generates a structured, cohesive text summary ("História da Ocorrência")
 * based strictly on the data entered by the user, formatted for copying
 * and pasting into the official notification system.
 * 
 * Uses ONLY information provided by the user.
 * Destination is always "SISTEMA OFICIAL DE NOTIFICAÇÃO".
 */
export function gerarHistoriaOcorrencia(
  dados: Partial<SituacaoRegistro>
): string {
  const partes: string[] = [];

  partes.push(`==================================================`);
  partes.push(`HISTÓRIA DA OCORRÊNCIA - REGISTRO FORMAL`);
  partes.push(`HOSPITAL UNIMED NOVA FRIBURGO`);
  partes.push(`==================================================\n`);

  // 1. INFORMAÇÕES GERAIS E LOCALIZAÇÃO
  partes.push(`1. INFORMAÇÕES GERAIS E LOCALIZAÇÃO:`);
  partes.push(`• Data e Horário do Evento: ${dados.quandoAconteceu || 'Não informado'}`);
  
  const locaisTexto = dados.ondeAconteceu && dados.ondeAconteceu.length > 0
    ? dados.ondeAconteceu.join(' • ') + (dados.ondeAconteceuOutro ? ` (${dados.ondeAconteceuOutro})` : '')
    : 'Não informado';
  partes.push(`• Locais/Setores Envolvidos: ${locaisTexto}`);
  
  partes.push(`• Notificado à Chefia/Supervisão: ${dados.notificadoChefia ? 'SIM' : 'NÃO'}`);
  partes.push(``);

  // 2. CHAVES RELACIONADAS & IMPACTOS
  partes.push(`2. CHAVES E IMPACTOS IDENTIFICADOS:`);
  const chavesTexto = dados.chaves && dados.chaves.length > 0 ? dados.chaves.join(' • ') : 'Não informado';
  partes.push(`• Chaves Relacionadas: ${chavesTexto}`);
  
  const impactosTexto = dados.impactos && dados.impactos.length > 0
    ? dados.impactos.join(' • ') + (dados.impactoOutroDetalhe ? ` (${dados.impactoOutroDetalhe})` : '')
    : 'Não informado';
  partes.push(`• Público/Processo Impactado: ${impactosTexto}`);
  partes.push(``);

  // 3. CARACTERIZAÇÃO DO EVENTO
  partes.push(`3. CARACTERIZAÇÃO DO EVENTO:`);
  partes.push(`• Relação Direta com Paciente: ${dados.relacaoPaciente ? 'SIM' : 'NÃO'}`);

  if (dados.relacaoPaciente) {
    if (dados.identificacaoPaciente) {
      partes.push(`• Identificação do Paciente / Prontuário: ${dados.identificacaoPaciente}`);
    }
    if (dados.leitoQuarto) {
      partes.push(`• Leito / Quarto: ${dados.leitoQuarto}`);
    }
    if (dados.faixaEtaria) {
      partes.push(`• Faixa Etária: ${dados.faixaEtaria}`);
    }
    if (dados.grauDanoImpacto) {
      partes.push(`• Grau de Dano / Impacto: ${dados.grauDanoImpacto}`);
    }
  } else {
    if (dados.processoEquipamentoImpactado) {
      partes.push(`• Processo / Equipamento Impactado: ${dados.processoEquipamentoImpactado}`);
    }
  }
  partes.push(``);

  // 4. RELATO DETALHADO DOS FATOS
  partes.push(`4. RELATO DETALHADO DOS FATOS:`);
  partes.push(dados.oQueAconteceu ? dados.oQueAconteceu.trim() : 'Descrição não informada.');
  if (dados.contextoSituacao) {
    partes.push(``);
    partes.push(`Contexto Adicional: ${dados.contextoSituacao.trim()}`);
  }
  partes.push(``);

  // 5. PROPOSTA DE AJUSTE / AÇÕES IMEDIATAS
  partes.push(`5. PROPOSTA DE AJUSTE / AÇÕES IMEDIATAS:`);
  partes.push(dados.propostaAjusteAcoes ? dados.propostaAjusteAcoes.trim() : 'Não informado.');
  partes.push(``);

  // 6. ENVOLVIDOS / TESTEMUNHAS
  if (dados.envolvidosTestemunhas) {
    partes.push(`6. ENVOLVIDOS / CATEGORIAS PROFISSIONAIS / TESTEMUNHAS:`);
    partes.push(dados.envolvidosTestemunhas.trim());
    partes.push(``);
  }

  // 7. EVIDÊNCIAS
  if (dados.evidenciaNome) {
    partes.push(`7. EVIDÊNCIA ANEXADA:`);
    partes.push(`• Arquivo: ${dados.evidenciaNome}`);
    partes.push(``);
  }

  // REGISTRO DE RESPONSABILIDADE
  partes.push(`--------------------------------------------------`);
  partes.push(`REGISTRADO POR: ${dados.userName || 'Usuário Autenticado'}`);
  if (dados.userCargo) partes.push(`Cargo/Função: ${dados.userCargo}`);
  if (dados.userMatricula) partes.push(`Matrícula/ID: ${dados.userMatricula}`);
  partes.push(`DESTINO: SISTEMA OFICIAL DE NOTIFICAÇÃO`);
  partes.push(`==================================================`);

  return partes.join('\n');
}

/**
 * Evaluates objective rules to classify a registered situation.
 * Does NOT use unpredictable AI; uses explicit, institutional criteria.
 */
export function triarSituacao(dados: Partial<SituacaoRegistro>): {
  resultado: 'OPORTUNIDADE' | 'NOTIFICACAO_FORMAL';
  motivo: string;
} {
  // Regra 1: Se tem relação com paciente e houve grau de dano/impacto significativo (Leve, Moderado ou Grave)
  if (dados.relacaoPaciente && dados.grauDanoImpacto && ['Leve', 'Moderado', 'Grave'].includes(dados.grauDanoImpacto)) {
    return {
      resultado: 'NOTIFICACAO_FORMAL',
      motivo: `A situação envolve paciente com grau de dano/impacto classificado como "${dados.grauDanoImpacto}", o que requer notificação no sistema oficial.`
    };
  }

  // Regra 2: Se foi notificado à chefia imediata por envolver risco operacional ou evento
  if (dados.relacaoPaciente && dados.notificadoChefia) {
    return {
      resultado: 'NOTIFICACAO_FORMAL',
      motivo: 'A situação envolveu paciente e necessitou de notificação imediata à supervisão/chefia.'
    };
  }

  // Regra 3: Se o impacto inclui 'Paciente' com dano/incidente formal
  if (dados.impactos?.includes('Paciente') && dados.grauDanoImpacto && dados.grauDanoImpacto !== 'Nenhum') {
    return {
      resultado: 'NOTIFICACAO_FORMAL',
      motivo: 'O impacto afetou diretamente o paciente e apresentou desvio de assistência com efeito registrado.'
    };
  }

  // Caso padrão: Oportunidade de melhoria
  return {
    resultado: 'OPORTUNIDADE',
    motivo: 'Esta situação foi registrada como uma oportunidade de melhoria para aperfeiçoamento da rotina institucional.'
  };
}
