/**
 * LGPD and Healthcare Data Privacy Protection Utilities.
 * Detects direct patient identifiers (CPF, medical record number, phones, full names patterns)
 * to avoid storing or sharing sensitive personal identifiers.
 */

export interface PrivacyCheckResult {
  hasSensitiveData: boolean;
  issues: string[];
  sensitiveType?: 'CPF' | 'PRONTUARIO' | 'TELEFONE' | 'OUTRO';
}

export function detectarDadosPessoais(texto: string): PrivacyCheckResult {
  if (!texto || typeof texto !== 'string') {
    return { hasSensitiveData: false, issues: [] };
  }

  const issues: string[] = [];
  const clean = texto.trim();

  // 1. CPF Pattern: 000.000.000-00 or 11 continuous digits labeled as CPF
  const cpfRegex = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/;
  const cpfLabeledRegex = /\b(?:cpf|c\.p\.f\.?)\s*[:=]?\s*\d{3,11}\b/i;
  if (cpfRegex.test(clean) || cpfLabeledRegex.test(clean)) {
    issues.push('Identificador no formato de CPF detectado');
  }

  // 2. Prontuário / Medical Record ID pattern with direct labels
  const prontuarioRegex = /\b(?:prontu[aá]rio|pront|registro\s*geral|rg\s*do\s*paciente)\s*[:#ºn°]?\s*\d{4,12}\b/i;
  if (prontuarioRegex.test(clean)) {
    issues.push('Número de prontuário ou identificador hospitalar direto detectado');
  }

  // 3. Telefone / Celular: (XX) 9XXXX-XXXX or similar patterns
  const phoneRegex = /\b(?:\(?\d{2}\)?\s?)?(?:9\s?\d{4}|\d{4})[-.\s]?\d{4}\b/;
  const phoneLabeledRegex = /\b(?:tel|telefone|celular|contato|fone|whatsapp|whats)\s*[:=]?\s*[\d\s()-]{8,15}\b/i;
  if (phoneLabeledRegex.test(clean) || (phoneRegex.test(clean) && /\b(?:tel|cel|contato)\b/i.test(clean))) {
    issues.push('Número de telefone ou contato pessoal detectado');
  }

  // 4. RG Pattern
  const rgRegex = /\b(?:rg|identidade)\s*[:=]?\s*\d{2}\.?\d{3}\.?\d{3}-?[0-9xX]?\b/i;
  if (rgRegex.test(clean)) {
    issues.push('Número de documento de identidade (RG) detectado');
  }

  // 5. Explicit Name label like "Paciente: Fulano da Silva"
  const nomePacienteRegex = /\b(?:paciente|nome\s*do\s*paciente|usu[aá]rio)\s*:\s*[A-ZÀ-Ú][a-zà-ú]+\s+[A-ZÀ-Ú][a-zà-ú]+/i;
  if (nomePacienteRegex.test(clean)) {
    issues.push('Nome completo do paciente explicitamente identificado');
  }

  return {
    hasSensitiveData: issues.length > 0,
    issues,
    sensitiveType: issues.length > 0 ? 'OUTRO' : undefined,
  };
}
