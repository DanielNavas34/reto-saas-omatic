import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // API pública y gratuita de tipos de cambio (base EUR)
  private apiUrl = 'https://open.er-api.com/v6/latest/EUR';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene los tipos de cambio actuales actualizados.
   */
  getExchangeRates(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}