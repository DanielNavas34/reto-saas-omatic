import { Component } from '@angular/core';
import { Search } from './components/search/search';
import { CustomerCard } from './components/customer-card/customer-card';
import { SimulationForm } from './components/simulation-form/simulation-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Search, CustomerCard, SimulationForm],
  templateUrl: './app.html', 
  styleUrl: './app.css' 
})
export class App {
  title = 'SaaS-O-Matic Dashboard';
  clienteActual: any = null;
  contadorRefresco: number = 0; // Controla la actualización del historial
}