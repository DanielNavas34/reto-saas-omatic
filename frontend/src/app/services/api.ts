import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // La dirección donde está escuchando tu servidor Node.js
  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) { }

  /**
   * Envía los datos del formulario al backend para registrar un cliente
   * y que el backend valide el DNI/NIF.
   */
  registrarCliente(clienteData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/customers`, clienteData);
  }

  /**
   * Envía los datos de uso para que el backend calcule los tramos 
   * y devuelva el precio total con impuestos.
   */
  calcularSimulacion(simulacionData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulations`, simulacionData);
  }

  // Obtener simulaciones por ID de cliente
  obtenerHistorialSimulaciones(customerId: number): Observable<any> {
    return this.http.get(`http://localhost:3000/simulations/customer/${customerId}`);
  }
}