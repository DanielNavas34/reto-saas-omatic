import { Component, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class Search {
  @Output() clienteEncontrado = new EventEmitter<any>();
  
  // Modelo de datos enlazado al formulario manual
  cliente = {
    tax_id: '',
    company_name: '',
    email: '',
    country: 'España',
    plan_type: 'Básico'
  };

  constructor(private cdr: ChangeDetectorRef) {}

  buscarCliente() {
    if (!this.cliente.tax_id.trim() || !this.cliente.company_name.trim() || !this.cliente.email.trim()) {
      alert('Por favor, rellena obligatoriamente el DNI, Nombre y Email.');
      return;
    }

    fetch('http://localhost:3000/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.cliente) // Enviamos los datos reales escritos por el comercial
    })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'El identificador no es válido.');
      }
      return data;
    })
    .then(data => {
      // Pasamos los datos completos a la tarjeta para que se visualicen correctamente
      const clienteFinal = { ...this.cliente, id: data.customerId };
      this.clienteEncontrado.emit(clienteFinal);
      this.cdr.detectChanges(); 
    })
    .catch(err => {
      console.error('Error de validación:', err.message);
      alert('Error: ' + err.message);
    });
  }
}