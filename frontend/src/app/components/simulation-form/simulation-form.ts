import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simulation-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulation-form.html',
  styleUrl: './simulation-form.css'
})
export class SimulationForm implements OnChanges {
  @Input() customer: any = null;
  @Output() simulacionRealizada = new EventEmitter<void>();

  // CONEXIÓN DIRECTA CON EL NAVEGADOR
  @ViewChild('txtUsos') txtUsos!: ElementRef;
  @ViewChild('txtPrecio') txtPrecio!: ElementRef;

  usos: number = 0;
  monedaSeleccionada: string = 'EUR';
  tasaCambioActual: number = 1;
  proyeccionNumerica: number = 0;

  guardando: boolean = false;
  exitoTransitorio: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['customer'] && this.customer) {
      this.calcular();
    }
  }

  alMoverBarra(valorHTML: string) {
    this.usos = parseInt(valorHTML, 10) || 0;
    this.calcular();
  }

  alCambiarMoneda(valorHTML: string) {
    this.monedaSeleccionada = valorHTML;
    if (this.monedaSeleccionada === 'EUR') {
      this.tasaCambioActual = 1;
      this.calcular();
    } else {
      fetch('https://open.er-api.com/v6/latest/EUR')
        .then(res => res.json())
        .then(data => {
          this.tasaCambioActual = data.rates[this.monedaSeleccionada] || 1;
          this.calcular();
        })
        .catch(() => {
          this.monedaSeleccionada = 'EUR';
          this.tasaCambioActual = 1;
          this.calcular();
        });
    }
  }

  calcular() {
    let coste = 0;
    let u = this.usos;

    if (u > 50) { coste += (u - 50) * 5; u = 50; }
    if (u > 10) { coste += (u - 10) * 8; u = 10; }
    if (u > 0) { coste += u * 10; }

    let impuesto = 0;
    if (this.customer && this.customer.country) {
      const pais = String(this.customer.country).toLowerCase();
      if (pais === 'españa' || pais === 'spain') {
          impuesto = 0.21;
      }
    }

    const totalEuros = coste + (coste * impuesto);
    this.proyeccionNumerica = totalEuros * this.tasaCambioActual;
    
    // PINTADO MANUAL POR FUERZA BRUTA: Obligamos al HTML a cambiar sí o sí
    if (this.txtUsos && this.txtPrecio) {
      this.txtUsos.nativeElement.innerText = this.usos + ' usuarios';
      this.txtPrecio.nativeElement.innerText = this.proyeccionNumerica.toFixed(2) + ' ' + this.monedaSeleccionada;
    }
  }

  guardarSimulacion() {
    if (!this.customer || !this.customer.id) return;
    this.guardando = true;

    const datosSimulacion = {
      customer_id: this.customer.id,
      active_users: this.usos,
      storage_gb: 10,
      api_calls: 1000,
      calculated_cost: Number(this.proyeccionNumerica.toFixed(2)),
      currency: this.monedaSeleccionada
    };

    fetch('http://localhost:3000/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosSimulacion)
    }).then(() => {
      this.guardando = false;
      this.exitoTransitorio = true;
      this.simulacionRealizada.emit();
      setTimeout(() => { this.exitoTransitorio = false; }, 2500);
    });
  }
}