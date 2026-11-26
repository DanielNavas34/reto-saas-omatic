import { Component } from '@angular/core';
import { Search } from './components/search/search';
import { CustomerCard } from './components/customer-card/customer-card';
import { SimulationForm } from './components/simulation-form/simulation-form';
import { Customer, Simulation } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Search, CustomerCard, SimulationForm],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'SaaS-O-Matic Dashboard';
  clienteActual: Customer | null = null;
  ultimaSimulacion: Simulation | null = null;

  onCustomerFound(customer: Customer): void {
    this.clienteActual = customer;
    this.ultimaSimulacion = null;
  }

  onSimulationSaved(simulation: Simulation): void {
    this.ultimaSimulacion = simulation;
  }
}
