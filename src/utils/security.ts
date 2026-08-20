import { User, AcessoStatusVisual, SecuritySettings, ActiveSession } from '../types';

/**
 * Heuristic detector for personal data (LGPD / Privacy Protection).
 * Detects CPF patterns, phone numbers, mentions of prontuário with numbers, and explicit patient identifiers.
 */
export function detectPersonalData(text: string): {
  hasPotentialPersonalData: boolean;
  detectedPatterns: string[];
  explanation: string;
} {
  if (!text || text.trim().length === 0) {
    return { hasPotentialPersonalData: false, detectedPatterns: [], explanation: '' };
  }

  const detected: string[] = [];

  // 1. CPF pattern: 000.000.000-00 or 11 continuous digits
  const cpfRegex = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
  if (cpfRegex.test(text)) {
    detected.push('Possível número de CPF identificado');
  }

  // 2. Mentions of Prontuário with numerical code
  const prontuarioRegex = /\bprontu[aá]rio\s*(?:n[ºo\.]*|número|num)?\s*[:\s#]?\s*\d+\b/i;
  if (prontuarioRegex.test(text)) {
    detected.push('Possível número de prontuário identificado');
  }

  // 3. Mentions of CNS (Cartão Nacional de Saúde) or RG
  const docRegex = /\b(?:rg|cns|cart[aã]o\s*sus)\s*[:\s#]?\s*\d+[\d\.-]*\b/i;
  if (docRegex.test(text)) {
    detected.push('Possível número de documento ou cartão SUS');
  }

  // 4. Phone numbers (e.g. (22) 98888-7777 or 22 99999-9999)
  const phoneRegex = /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})[-\s]?\d{4}\b/g;
  if (phoneRegex.test(text)) {
    detected.push('Possível telefone ou contato');
  }

  // 5. Explicit "Paciente [Nome Completo]" pattern
  const patientNameRegex = /\b(?:paciente\s+([A-ZÀ-Ú][a-zà-ú]+(?:\s+[A-ZÀ-Ú][a-zà-ú]+){1,3}))\b/;
  if (patientNameRegex.test(text)) {
    detected.push('Possível nome próprio de paciente identificado');
  }

  // 6. Birth date mentions: "nascido em 00/00/0000" or "dn: 00/00/0000"
  const birthRegex = /\b(?:nascid[oa]|data de nascimento|dn|nascimento)\s*[:\s#]?\s*\d{2}[\/\.-]\d{2}[\/\.-]\d{2,4}\b/i;
  if (birthRegex.test(text)) {
    detected.push('Possível data de nascimento identificada');
  }

  const hasPotentialPersonalData = detected.length > 0;
  const explanation = hasPotentialPersonalData
    ? 'Seu texto pode conter uma informação que identifica uma pessoa. Revise antes de continuar.'
    : '';

  return {
    hasPotentialPersonalData,
    detectedPatterns: detected,
    explanation,
  };
}

/**
 * Calculates remaining days until access expiration.
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
 * Evaluates the full access status of a User (Temporary Guardian vs Permanent Manager/Admin)
 */
export function evaluateUserAccessStatus(user: User): {
  visualStatus: AcessoStatusVisual;
  badgeColor: string;
  badgeLabel: string;
  isBlocked: boolean;
  blockReason: 'EXPIRADO' | 'REVOGADO' | 'SUSPENSO' | null;
  daysRemaining: number | null;
} {
  // 1. Check administrative revocation
  if (user.status === 'REVOGADO') {
    return {
      visualStatus: 'REVOGADO',
      badgeColor: 'bg-slate-900 text-white border-slate-700',
      badgeLabel: '⚫ REVOGADO',
      isBlocked: true,
      blockReason: 'REVOGADO',
      daysRemaining: 0,
    };
  }

  // 2. Check administrative suspension
  if (user.status === 'SUSPENSO') {
    return {
      visualStatus: 'SUSPENSO',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      badgeLabel: '🟠 SUSPENSO',
      isBlocked: true,
      blockReason: 'SUSPENSO',
      daysRemaining: 0,
    };
  }

  // 3. Check expiration
  const isDateExpired = checkIsExpired(user);
  if (user.status === 'EXPIRADO' || isDateExpired) {
    return {
      visualStatus: 'EXPIRADO',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      badgeLabel: '🔴 EXPIRADO',
      isBlocked: true,
      blockReason: 'EXPIRADO',
      daysRemaining: 0,
    };
  }

  // 4. For Guardians, check if approaching expiration (<= 15 days)
  const days = getDaysUntilExpiration(user);
  if (user.role === 'guardian' && days !== null && days <= 15 && days >= 0) {
    return {
      visualStatus: 'PROXIMO_VENCIMENTO',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeLabel: `🟡 PRÓXIMO DO VENCIMENTO (${days}d)`,
      isBlocked: false,
      blockReason: null,
      daysRemaining: days,
    };
  }

  // 5. Default Active
  return {
    visualStatus: 'ATIVO',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    badgeLabel: days !== null ? `🟢 ATIVO (${days}d)` : '🟢 ATIVO',
    isBlocked: false,
    blockReason: null,
    daysRemaining: days,
  };
}

/**
 * Copies structured report text to the clipboard safely and notifies the user.
 */
export async function copyRelatoSafely(
  text: string,
  onSuccess?: () => void,
  onError?: (err: any) => void
): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      if (onSuccess) onSuccess();
      return true;
    } else {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (onSuccess) onSuccess();
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    if (onError) onError(err);
    return false;
  }
}
