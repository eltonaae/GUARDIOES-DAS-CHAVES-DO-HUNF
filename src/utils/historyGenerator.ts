import { SituacaoRegistro, RegistroStatus, ResultadoClassificacao } from '../types';

export interface ClassificacaoEngineResult {
  classificacaoPreliminar: string;
  resultado: ResultadoClassificacao;
  motivoTriagem: string;
  statusSugerido: RegistroStatus;
  acoesSugeridas: string[];
  ctaDinamico: {
    label: string;
    sublabel?: string;
    tipo: 'RISCO' | 'SEGURANCA' | 'MELHORIA' | 'BOA_PRATICA' | 'ACOMPANHAMENTO';
  };
  oQueAconteceAgora: {
    titulo: string;
    itens: { texto: string; cor: 'red' | 'amber' | 'emerald' | 'blue' | 'purple' }[];
  };
}

/**
 * Motor de Ações Imediatas e Classificação Preliminar Inteligente.
 * Executa regras institucionais claras, transparentes e orientadas à segurança e melhoria de processos,
 * sem culpabilização.
 */
export function classificarSituacaoInteligente(dados: Partial<SituacaoRegistro>): ClassificacaoEngineResult {
  // CASO 1: Risco imediato / atual que exige intervenção imediata
  if (dados.riscoImediato) {
    return {
      classificacaoPreliminar: 'Situação de risco — classificação preliminar',
      resultado: 'NOTIFICACAO_FORMAL',
      motivoTriagem: 'Situação identificada com risco ativo ou iminente, requerendo contenção imediata e comunicação formal de liderança.',
      statusSugerido: 'Ação imediata',
      acoesSugeridas: [
        'Interromper ou conter situação de risco imediatamente',
        'Comunicar responsável pelo setor agora',
        'Acionar Qualidade / NSP',
        'Retirar processo/equipamento/material de uso, se aplicável',
        'Preparar notificação institucional de Segurança do Paciente',
      ],
      ctaDinamico: {
        label: 'PREPARAR NOTIFICAÇÃO',
        sublabel: 'Risco identificado — preparar relato institucional',
        tipo: 'RISCO',
      },
      oQueAconteceAgora: {
        titulo: 'O QUE ACONTECE AGORA?',
        itens: [
          { texto: 'Conter a situação de risco no setor', cor: 'red' },
          { texto: 'Comunicar imediatamente a liderança / responsável da área', cor: 'red' },
          { texto: 'Acionar Qualidade / Núcleo de Segurança do Paciente', cor: 'red' },
          { texto: 'Preparar notificação institucional no sistema oficial', cor: 'purple' },
        ],
      },
    };
  }

  // CASO 2: Situação que Envolve Paciente e Chegou ao Paciente com Impacto ou Dano
  if (
    dados.relacaoPaciente &&
    dados.chegouAoPaciente === 'SIM' &&
    (dados.houveImpacto === 'SIM' ||
      dados.houveDano === 'SIM' ||
      (dados.grauDanoImpacto && ['Leve', 'Moderado', 'Grave'].includes(dados.grauDanoImpacto)))
  ) {
    const isEventoAdverso = dados.houveDano === 'SIM' || (dados.grauDanoImpacto && ['Leve', 'Moderado', 'Grave'].includes(dados.grauDanoImpacto));
    const nomeClassificacao = isEventoAdverso
      ? 'Possível Evento Adverso — classificação preliminar'
      : 'Possível evento relacionado à Segurança do Paciente — classificação preliminar';

    return {
      classificacaoPreliminar: nomeClassificacao,
      resultado: 'NOTIFICACAO_FORMAL',
      motivoTriagem: `A situação atingiu o paciente com impacto identificado${dados.grauDanoImpacto ? ` (${dados.grauDanoImpacto})` : ''}. Requer medidas imediatas e encaminhamento formal ao fluxo institucional de Segurança do Paciente.`,
      statusSugerido: 'Notificação a preparar',
      acoesSugeridas: [
        'Comunicar responsável pela área/setor',
        'Acionar Qualidade / Núcleo de Segurança do Paciente (NSP)',
        'Registrar medida imediata adotada para assistência',
        'Preparar notificação institucional',
      ],
      ctaDinamico: {
        label: 'PREPARAR NOTIFICAÇÃO',
        sublabel: 'Gerar relato estruturado para o sistema oficial',
        tipo: 'SEGURANCA',
      },
      oQueAconteceAgora: {
        titulo: 'O QUE ACONTECE AGORA?',
        itens: [
          { texto: 'Comunicar responsável pela área de atendimento', cor: 'red' },
          { texto: 'Acionar Qualidade / NSP conforme fluxo assistencial', cor: 'red' },
          { texto: 'Preparar notificação formal com o relato estruturado gerado', cor: 'purple' },
          { texto: 'Acompanhar desdobramentos e melhorias no fluxo', cor: 'blue' },
        ],
      },
    };
  }

  // CASO 3: Possível Near Miss (Situação Interceptada antes de atingir o paciente)
  if (
    dados.relacaoPaciente &&
    (dados.chegouAoPaciente === 'NÃO' || dados.possibilidadeAtingirPaciente)
  ) {
    return {
      classificacaoPreliminar: 'Possível Near Miss — classificação preliminar',
      resultado: 'NOTIFICACAO_FORMAL',
      motivoTriagem: 'Foi identificada uma situação que apresentava potencial de atingir o paciente, porém foi interceptada por barreira de segurança antes do desfecho.',
      statusSugerido: 'Notificação a preparar',
      acoesSugeridas: [
        'Comunicar responsável pelo setor/processo',
        'Acionar Qualidade / NSP conforme fluxo institucional',
        'Avaliar a barreira de segurança que interceptou a falha',
        'Preparar notificação para fortalecimento de barreiras',
      ],
      ctaDinamico: {
        label: 'PREPARAR NOTIFICAÇÃO',
        sublabel: 'Importante para reforçar barreiras preventivas',
        tipo: 'SEGURANCA',
      },
      oQueAconteceAgora: {
        titulo: 'O QUE ACONTECE AGORA?',
        itens: [
          { texto: 'Comunicar responsável pelo processo sobre a barreira atuante', cor: 'amber' },
          { texto: 'Acionar Qualidade/NSP para registro educativo do Near Miss', cor: 'amber' },
          { texto: 'Preparar notificação para mapeamento preventivo de riscos', cor: 'purple' },
          { texto: 'Multiplicar o aprendizado da barreira com a equipe', cor: 'emerald' },
        ],
      },
    };
  }

  // CASO 4: Necessita Avaliação da Qualidade / NSP por Chaves ou Impacto em Equipe/Processo de Risco
  if (
    dados.chaves?.includes('Segurança') &&
    (dados.proximoPasso?.includes('notificação') || dados.proximoPasso?.includes('NSP'))
  ) {
    return {
      classificacaoPreliminar: 'Necessita avaliação da Qualidade/NSP',
      resultado: 'NOTIFICACAO_FORMAL',
      motivoTriagem: 'Situação com impacto de processo e segurança selecionada para avaliação institucional da Qualidade.',
      statusSugerido: 'Notificação a preparar',
      acoesSugeridas: [
        'Encaminhar para Qualidade / NSP',
        'Preparar notificação institucional',
        'Acompanhar plano de ação local',
      ],
      ctaDinamico: {
        label: 'PREPARAR NOTIFICAÇÃO',
        sublabel: 'Encaminhar relato para a Qualidade/NSP',
        tipo: 'SEGURANCA',
      },
      oQueAconteceAgora: {
        titulo: 'O QUE ACONTECE AGORA?',
        itens: [
          { texto: 'Comunicar responsável pelo processo', cor: 'amber' },
          { texto: 'Preparar notificação institucional', cor: 'purple' },
          { texto: 'Acompanhar plano de ação preventivo', cor: 'blue' },
        ],
      },
    };
  }

  // CASO 5: Problema de Processo / Oportunidade de Melhoria Local (Simples - NÃO mostra Preparar Notificação)
  return {
    classificacaoPreliminar: 'Oportunidade de melhoria',
    resultado: 'OPORTUNIDADE',
    motivoTriagem: 'A situação observada representa oportunidade de aprimoramento contínuo em fluxos, comunicação ou organização de rotina.',
    statusSugerido: 'Aguardando ação',
    acoesSugeridas: [
      'Orientar colaborador sobre o processo correto (se seguro e apropriado)',
      'Comunicar responsável pelo processo',
      'Criar ação de melhoria para evitar reincidência',
      'Registrar evidência e acompanhar evolução',
    ],
    ctaDinamico: {
      label: 'CRIAR AÇÃO DE MELHORIA',
      sublabel: 'Encaminhar oportunidade para aprimoramento contínuo',
      tipo: 'MELHORIA',
    },
    oQueAconteceAgora: {
      titulo: 'O QUE ACONTECE AGORA?',
      itens: [
        { texto: 'Comunicar responsável pelo setor/processo', cor: 'amber' },
        { texto: 'Registrar proposta de ação de melhoria contínua', cor: 'emerald' },
        { texto: 'Acompanhar a evolução do ajuste junto aos envolvidos', cor: 'blue' },
      ],
    },
  };
}

/**
 * Helper compatibility wrapper
 */
export function triarSituacao(dados: Partial<SituacaoRegistro>): {
  resultado: ResultadoClassificacao;
  motivo: string;
} {
  const eng = classificarSituacaoInteligente(dados);
  return {
    resultado: eng.resultado,
    motivo: eng.motivoTriagem,
  };
}

/**
 * Gera automaticamente um texto narrativo profissional, cronológico e objetivo
 * para a Notificação Formal no Sistema Institucional de Segurança do Paciente / Qualidade.
 *
 * Estrutura Cronológica:
 * CONTEXTO → SITUAÇÃO → IDENTIFICAÇÃO → RISCO/IMPACTO → BARREIRA → AÇÃO IMEDIATA → COMUNICAÇÃO → ENCAMINHAMENTO
 *
 * Responde:
 * 1. O que aconteceu?
 * 2. Onde aconteceu?
 * 3. Quando aconteceu?
 * 4. Como a situação foi identificada?
 * 5. Qual era o risco?
 * 6. A situação chegou ao paciente?
 * 7. Houve impacto?
 * 8. Qual barreira existia?
 * 9. O que foi feito imediatamente?
 * 10. Quem/qual área foi acionada?
 * 11. Qual encaminhamento foi realizado?
 */
export function gerarRelatoNarrativoNotificacao(dados: Partial<SituacaoRegistro>): string {
  const sentencas: string[] = [];

  // 1. CONTEXTO, LOCAL E TEMPO
  const setores = dados.ondeAconteceu && dados.ondeAconteceu.length > 0
    ? dados.ondeAconteceu.join(' / ') + (dados.ondeAconteceuOutro ? ` (${dados.ondeAconteceuOutro})` : '')
    : 'setor assistencial não especificado';

  const momento = dados.quandoAconteceu ? `em ${dados.quandoAconteceu}` : 'durante o plantão';
  const leitoTexto = dados.leitoQuarto ? ` no leito/área ${dados.leitoQuarto}` : '';

  if (dados.contextoSituacao && dados.contextoSituacao.trim()) {
    sentencas.push(`No contexto operacional de "${dados.contextoSituacao.trim()}", ${momento}, no setor ${setores}${leitoTexto}, foi identificada a seguinte ocorrência:`);
  } else {
    sentencas.push(`No dia e horário ${momento}, no setor ${setores}${leitoTexto}, foi registrada a seguinte situação:`);
  }

  // 2. SITUAÇÃO (O QUE ACONTECEU)
  if (dados.oQueAconteceu && dados.oQueAconteceu.trim()) {
    sentencas.push(`${dados.oQueAconteceu.trim()}`);
  }

  // 3. IDENTIFICAÇÃO, RELAÇÃO COM PACIENTE E BARREIRAS
  if (dados.relacaoPaciente) {
    if (dados.chegouAoPaciente === 'NÃO' || dados.possibilidadeAtingirPaciente) {
      if (dados.barreiraInterceptadora && dados.barreiraInterceptadora.trim()) {
        sentencas.push(`A divergência/inconformidade foi identificada preventivamente através da barreira de segurança "${dados.barreiraInterceptadora.trim()}", antes de atingir o paciente (possível Near Miss).`);
      } else {
        sentencas.push(`A inconformidade foi interceptada preventivamente pelas rotinas de checagem do setor antes de atingir diretamente o paciente.`);
      }
    } else if (dados.chegouAoPaciente === 'SIM') {
      const impactoDet = dados.grauDanoImpacto && dados.grauDanoImpacto !== 'Nenhum'
        ? `com impacto/dano preliminarmente avaliado como ${dados.grauDanoImpacto}`
        : 'sem evidência de dano permanente';
      sentencas.push(`A ocorrência atingiu o paciente ${impactoDet}.`);
    }
  } else {
    if (dados.processoEquipamentoImpactado) {
      sentencas.push(`A situação envolveu diretamente o processo/equipamento: ${dados.processoEquipamentoImpactado.trim()}.`);
    }
  }

  // 4. RISCO / IMPACTO IDENTIFICADO
  if (dados.chaves && dados.chaves.length > 0) {
    sentencas.push(`As chaves institucionais relacionadas foram: ${dados.chaves.join(', ')}.`);
  }

  if (dados.impactos && dados.impactos.length > 0) {
    const impactosStr = dados.impactos.join(', ') + (dados.impactoOutroDetalhe ? ` (${dados.impactoOutroDetalhe})` : '');
    sentencas.push(`Público/processo com impacto potencial ou direto: ${impactosStr}.`);
  }

  // 5. AÇÃO IMEDIATA (O QUE FOI FEITO AGORA)
  const acoesList: string[] = [];
  if (dados.acoesImediatasSelecionadas && dados.acoesImediatasSelecionadas.length > 0) {
    acoesList.push(...dados.acoesImediatasSelecionadas);
  }
  if (dados.acaoImediataFeita && dados.acaoImediataFeita.trim()) {
    acoesList.push(dados.acaoImediataFeita.trim());
  }

  if (acoesList.length > 0) {
    sentencas.push(`Como medida imediata de contenção e segurança no momento da identificação, foi realizado: ${acoesList.join('; ')}.`);
  }

  // 6. ORIENTAÇÃO AO COLEGA
  if (dados.orientacaoRealizada && dados.orientacaoRealizada !== 'NÃO') {
    sentencas.push(`Foi realizada orientação técnica ao colega/equipe envolvida (resultado: ${dados.orientacaoResultado || 'concluído de forma colaborativa'}).`);
  }

  // 7. COMUNICAÇÃO DE RESPONSÁVEL
  if (dados.comunicacaoResponsavel) {
    const obs = dados.comunicacaoResponsavel.observacao ? ` (${dados.comunicacaoResponsavel.observacao})` : '';
    sentencas.push(`Houve comunicação imediata ao ${dados.comunicacaoResponsavel.quem} em ${dados.comunicacaoResponsavel.quando}${obs}.`);
  } else if (dados.responsavelAreaDestino) {
    sentencas.push(`A área/responsável indicada para acompanhamento foi: ${dados.responsavelAreaDestino}.`);
  }

  // 8. AÇÃO DE MELHORIA / ENCAMINHAMENTO
  if (dados.acaoMelhoriaProposta && dados.acaoMelhoriaProposta.trim()) {
    sentencas.push(`Sugestão de melhoria preventiva registrada: "${dados.acaoMelhoriaProposta.trim()}".`);
  }

  sentencas.push(`O registro foi concluído e estruturado para encaminhamento formal ao fluxo institucional de Segurança do Paciente / Qualidade.`);

  return sentencas.join(' ');
}

/**
 * Generates a structured, cohesive text summary ("História da Ocorrência")
 * based strictly on the data entered by the user, formatted for copying
 * and pasting into the official notification system.
 */
export function gerarHistoriaOcorrencia(
  dados: Partial<SituacaoRegistro>
): string {
  const partes: string[] = [];

  partes.push(`==================================================`);
  partes.push(`HISTÓRIA DA OCORRÊNCIA - RELATO ESTRUTURADO`);
  partes.push(`HOSPITAL UNIMED NOVA FRIBURGO`);
  partes.push(`==================================================\n`);

  // 1. CLASSIFICAÇÃO PRELIMINAR E DIRETRIZ
  partes.push(`1. CLASSIFICAÇÃO PRELIMINAR E DIRETRIZ:`);
  partes.push(`• Classificação: ${dados.classificacaoPreliminar || 'Classificação preliminar'}`);
  partes.push(`• Nota: A classificação oficial deverá seguir o fluxo institucional de Segurança do Paciente.`);
  partes.push(`• Status do Registro: ${dados.status || 'Registrado'}`);
  partes.push(`• Risco Imediato Identificado: ${dados.riscoImediato ? 'SIM - EXIGIU CONTENÇÃO IMEDIATA' : 'NÃO'}`);
  partes.push(``);

  // 2. INFORMAÇÕES GERAIS E LOCALIZAÇÃO
  partes.push(`2. INFORMAÇÕES GERAIS E LOCALIZAÇÃO:`);
  partes.push(`• Data e Horário: ${dados.quandoAconteceu || 'Não informado'}`);
  
  const locaisTexto = dados.ondeAconteceu && dados.ondeAconteceu.length > 0
    ? dados.ondeAconteceu.join(' • ') + (dados.ondeAconteceuOutro ? ` (${dados.ondeAconteceuOutro})` : '')
    : 'Não informado';
  partes.push(`• Setores/Locais Envolvidos: ${locaisTexto}`);
  partes.push(``);

  // 3. CHAVES RELACIONADAS & IMPACTOS
  partes.push(`3. CHAVES E IMPACTOS IDENTIFICADOS:`);
  const chavesTexto = dados.chaves && dados.chaves.length > 0 ? dados.chaves.join(' • ') : 'Não informado';
  partes.push(`• Chaves Relacionadas: ${chavesTexto}`);
  
  const impactosTexto = dados.impactos && dados.impactos.length > 0
    ? dados.impactos.join(' • ') + (dados.impactoOutroDetalhe ? ` (${dados.impactoOutroDetalhe})` : '')
    : 'Não informado';
  partes.push(`• Público / Processo Impactado: ${impactosTexto}`);
  partes.push(``);

  // 4. CARACTERIZAÇÃO DO EVENTO (LGPD-SAFE)
  partes.push(`4. CARACTERIZAÇÃO DO EVENTO:`);
  partes.push(`• Relação Direta com Paciente: ${dados.relacaoPaciente ? 'SIM' : 'NÃO'}`);

  if (dados.relacaoPaciente) {
    partes.push(`• Chegou a Atingir o Paciente: ${dados.chegouAoPaciente || 'Não determinado'}`);
    if (dados.chegouAoPaciente === 'NÃO' || dados.possibilidadeAtingirPaciente) {
      partes.push(`• Situação: Interceptada antes de atingir o paciente (Possível Near Miss)`);
      if (dados.barreiraInterceptadora) {
        partes.push(`• Barreira que Interceptou: ${dados.barreiraInterceptadora}`);
      }
    }
    if (dados.faixaEtaria) {
      partes.push(`• Faixa Etária: ${dados.faixaEtaria}`);
    }
    if (dados.grauDanoImpacto) {
      partes.push(`• Grau de Dano / Impacto: ${dados.grauDanoImpacto}`);
    }
    if (dados.leitoQuarto) {
      partes.push(`• Local / Leito Institucional: ${dados.leitoQuarto}`);
    }
  } else {
    if (dados.processoEquipamentoImpactado) {
      partes.push(`• Processo / Equipamento Impactado: ${dados.processoEquipamentoImpactado}`);
    }
  }
  partes.push(``);

  // 5. RELATO NARRATIVO CRONOLÓGICO DOS FATOS
  partes.push(`5. RELATO CRONOLÓGICO PARA NOTIFICAÇÃO (FATOS):`);
  const relatoNarrativo = dados.relatoNotificacao || gerarRelatoNarrativoNotificacao(dados);
  partes.push(relatoNarrativo);
  partes.push(``);

  // 6. MOTOR DE AÇÕES IMEDIATAS (O QUE FOI FEITO AGORA)
  partes.push(`6. AÇÕES IMEDIATAS ADOTADAS (CONTENÇÃO / ORIENTAÇÃO / COMUNICAÇÃO):`);
  if (dados.acoesImediatasSelecionadas && dados.acoesImediatasSelecionadas.length > 0) {
    dados.acoesImediatasSelecionadas.forEach((ac) => {
      partes.push(`☑ ${ac}`);
    });
  }
  if (dados.acaoImediataFeita) {
    partes.push(`Detalhes da Ação Imediata: ${dados.acaoImediataFeita.trim()}`);
  }
  if (dados.orientacaoRealizada) {
    partes.push(`Orientação ao Colega: ${dados.orientacaoRealizada} (Resultado: ${dados.orientacaoResultado || 'Não especificado'})`);
  }
  if (dados.comunicacaoResponsavel) {
    partes.push(`Comunicação Realizada: ${dados.comunicacaoResponsavel.quem} em ${dados.comunicacaoResponsavel.quando}${dados.comunicacaoResponsavel.observacao ? ` - Obs: ${dados.comunicacaoResponsavel.observacao}` : ''}`);
  }
  partes.push(``);

  // 7. AÇÃO DE MELHORIA PROPOSTA (EVITAR RECORRÊNCIA)
  if (dados.acaoMelhoriaProposta) {
    partes.push(`7. AÇÃO DE MELHORIA PROPOSTA (PREVENÇÃO DE RECORRÊNCIA):`);
    partes.push(dados.acaoMelhoriaProposta.trim());
    partes.push(``);
  }

  // 8. PRÓXIMO PASSO E RESPONSÁVEL
  partes.push(`8. PRÓXIMO PASSO E ENCAMINHAMENTO:`);
  partes.push(`• Próximo Passo: ${dados.proximoPasso || 'Acompanhar evolução'}`);
  if (dados.responsavelAreaDestino) {
    partes.push(`• Área / Responsável de Destino: ${dados.responsavelAreaDestino}`);
  }
  partes.push(``);

  // 9. ENVOLVIDOS / EVIDÊNCIAS
  if (dados.envolvidosTestemunhas) {
    partes.push(`9. EQUIPES / TESTEMUNHAS:`);
    partes.push(dados.envolvidosTestemunhas.trim());
    partes.push(``);
  }
  if (dados.evidenciaNome) {
    partes.push(`• Anexo / Evidência: ${dados.evidenciaNome}`);
    partes.push(``);
  }

  // REGISTRO DE RESPONSABILIDADE
  partes.push(`--------------------------------------------------`);
  partes.push(`REGISTRADO POR: ${dados.userName || 'Guardião Autenticado'}`);
  if (dados.userCargo) partes.push(`Cargo: ${dados.userCargo}`);
  if (dados.userMatricula) partes.push(`Matrícula: ${dados.userMatricula}`);
  partes.push(`DESTINO: SISTEMA OFICIAL DE NOTIFICAÇÃO / GESTÃO DE MELHORIA`);
  partes.push(`==================================================`);

  return partes.join('\n');
}
