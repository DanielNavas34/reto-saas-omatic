import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api-url';
import { ExchangeRates } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  constructor(private http: HttpClient) {}

  /** Rates published by the API. The saved price does not use a rate typed in the browser. */
  getRates(): Observable<ExchangeRates> {
    return this.http.get<ExchangeRates>(`${API_URL}/rates`);
  }
}
