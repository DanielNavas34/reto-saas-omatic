import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService, apiErrorMessage } from '../../services/api';
import { Customer, Simulation } from '../../models';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-card.html',
  styleUrl: './customer-card.css',
})
export class CustomerCard implements OnChanges {
  @Input() customer: Customer | null = null;
  @Input() latestSimulation: Simulation | null = null;

  historialSimulaciones: Simulation[] = [];
  historialError = '';

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer']) {
      this.historialSimulaciones = [];
      this.historialError = '';
      if (this.customer?.id) {
        this.loadHistory(this.customer.id);
      }
      return;
    }

    if (
      changes['latestSimulation'] &&
      this.latestSimulation &&
      this.customer?.id === this.latestSimulation.customer_id
    ) {
      this.loadHistory(this.customer.id);
    }
  }

  private loadHistory(customerId: number): void {
    this.api.getSimulations(customerId).subscribe({
      next: (rows) => {
        this.historialSimulaciones = rows;
        this.historialError = '';
      },
      error: (err: HttpErrorResponse) => {
        this.historialError = apiErrorMessage(err, 'No se pudo cargar el historial.');
      },
    });
  }
}
