import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, apiErrorMessage } from '../../services/api';
import { Customer, CustomerDraft } from '../../models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  @Output() customerFound = new EventEmitter<Customer>();

  draft: CustomerDraft = {
    tax_id: '',
    company_name: '',
    email: '',
    country: 'España',
    plan_type: 'Básico',
  };

  error = '';
  notice = '';

  constructor(private api: ApiService) {}

  buscarCliente(): void {
    this.error = '';
    this.notice = '';

    if (!this.draft.tax_id.trim() || !this.draft.company_name.trim() || !this.draft.email.trim()) {
      this.error = 'Rellena el identificador fiscal, el nombre y el email.';
      return;
    }

    this.api.registerCustomer(this.draft).subscribe({
      next: (response) => {
        if (response.message === 'Recuperado') {
          this.notice = 'Este identificador ya estaba registrado. Mostramos el cliente guardado.';
        }
        this.customerFound.emit(response.customer);
      },
      error: (err: HttpErrorResponse) => {
        this.error = apiErrorMessage(err, 'No se pudo validar el cliente.');
      },
    });
  }
}
