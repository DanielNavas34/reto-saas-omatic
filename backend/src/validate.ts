import { isValidSpanishTaxId } from './tax-id';
import { CURRENCIES, isSpain, type Currency } from './pricing';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface CustomerInput {
  company_name: string;
  tax_id: string;
  email: string;
  country: string;
  plan_type: string;
}

export interface SimulationInput {
  customer_id: number;
  active_users: number;
  storage_gb: number;
  api_calls: number;
  currency: Currency;
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseCustomerBody(body: unknown): ParseResult<CustomerInput> {
  if (!isRecord(body)) {
    return { ok: false, error: 'Faltan datos obligatorios del cliente.' };
  }

  const companyName = requiredString(body, 'company_name');
  const taxId = requiredString(body, 'tax_id');
  const email = requiredString(body, 'email');
  const country = requiredString(body, 'country');
  const planType = requiredString(body, 'plan_type');

  if (!companyName || !taxId || !email || !country || !planType) {
    return { ok: false, error: 'Faltan datos obligatorios del cliente.' };
  }
  if (!EMAIL.test(email)) {
    return { ok: false, error: 'Email no válido.' };
  }

  const normalizedTaxId = taxId.toUpperCase();
  if (isSpain(country) && !isValidSpanishTaxId(normalizedTaxId)) {
    return { ok: false, error: 'Identificador fiscal no válido.' };
  }

  return {
    ok: true,
    value: {
      company_name: companyName,
      tax_id: normalizedTaxId,
      email,
      country,
      plan_type: planType,
    },
  };
}

export function parseSimulationBody(body: unknown): ParseResult<SimulationInput> {
  if (!isRecord(body)) {
    return { ok: false, error: 'La simulación está incompleta.' };
  }

  const customerId = positiveInt(body, 'customer_id');
  const activeUsers = nonNegativeInt(body, 'active_users');
  const storageGb = nonNegativeInt(body, 'storage_gb');
  const apiCalls = nonNegativeInt(body, 'api_calls');
  const currency = body['currency'];

  if (customerId === null || activeUsers === null || storageGb === null || apiCalls === null) {
    return {
      ok: false,
      error: 'Usuarios, almacenamiento y llamadas deben ser enteros mayores o iguales que cero.',
    };
  }
  if (typeof currency !== 'string' || !(CURRENCIES as readonly string[]).includes(currency)) {
    return { ok: false, error: 'La moneda debe ser EUR, USD o GBP.' };
  }

  return {
    ok: true,
    value: {
      customer_id: customerId,
      active_users: activeUsers,
      storage_gb: storageGb,
      api_calls: apiCalls,
      currency: currency as Currency,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requiredString(body: Record<string, unknown>, field: string): string | null {
  const value = body[field];
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function nonNegativeInt(body: Record<string, unknown>, field: string): number | null {
  const value = body[field];
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return null;
  }
  return value;
}

function positiveInt(body: Record<string, unknown>, field: string): number | null {
  const value = nonNegativeInt(body, field);
  if (value === null || value < 1) {
    return null;
  }
  return value;
}
