export interface Customer {
  id: number;
  company_name: string;
  tax_id: string;
  email: string;
  country: string;
  plan_type: string;
}

export interface CustomerDraft {
  company_name: string;
  tax_id: string;
  email: string;
  country: string;
  plan_type: string;
}

export interface CustomerResponse {
  message: string;
  customer: Customer;
}

export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

export interface Simulation {
  id: number;
  customer_id: number;
  active_users: number;
  storage_gb: number;
  api_calls: number;
  calculated_cost: number;
  currency: string;
}

export interface SimulationDraft {
  customer_id: number;
  active_users: number;
  storage_gb: number;
  api_calls: number;
  currency: CurrencyCode;
}

export interface Quote {
  calculated_cost: number;
  currency: CurrencyCode;
  total_eur: number;
  rate: number;
  active_users: number;
  storage_gb: number;
  api_calls: number;
}

export interface SimulationResponse {
  message: string;
  simulation: Simulation;
}

export interface ExchangeRates {
  EUR: number;
  USD: number;
  GBP: number;
}
