import { Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-card.html',
  styleUrl: './customer-card.css'
})
export class CustomerCard implements OnChanges {
  @Input() customer: any = null; 
  @Input() refreshTrigger: number = 0; 
  historialSimulaciones: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.customer && this.customer.id) {
      this.cargarHistorial(this.customer.id);
    } else {
      this.historialSimulaciones = [];
      this.cdr.detectChanges();
    }
  }

  cargarHistorial(customerId: number) {
    fetch(`http://localhost:3000/simulations/customer/${customerId}`)
      .then(res => res.json())
      .then(data => {
        this.historialSimulaciones = data;
        this.cdr.detectChanges(); // <-- Actualiza la lista al instante
      })
      .catch(err => console.error('Error al cargar historial:', err));
  }
}