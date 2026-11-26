import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api-url';
import {
  CustomerDraft,
  CustomerResponse,
  Quote,
  Simulation,
  SimulationDraft,
  SimulationResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  registerCustomer(draft: CustomerDraft): Observable<CustomerResponse> {
    return this.http.post<CustomerResponse>(`${API_URL}/customers`, draft);
  }

  quoteSimulation(draft: SimulationDraft): Observable<Quote> {
    return this.http.post<Quote>(`${API_URL}/quotes`, draft);
  }

  saveSimulation(draft: SimulationDraft): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${API_URL}/simulations`, draft);
  }

  getSimulations(customerId: number): Observable<Simulation[]> {
    return this.http.get<Simulation[]>(`${API_URL}/simulations/customer/${customerId}`);
  }
}

export function apiErrorMessage(err: HttpErrorResponse, fallback: string): string {
  const body = err.error as { error?: string } | null;
  return body?.error || fallback;
}
