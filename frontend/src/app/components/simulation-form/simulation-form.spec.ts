import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SimulationForm } from './simulation-form';
import { Customer } from '../../models';

describe('SimulationForm', () => {
  let component: SimulationForm;
  let fixture: ComponentFixture<SimulationForm>;
  let http: HttpTestingController;

  const customer: Customer = {
    id: 4,
    company_name: 'Acme',
    tax_id: '12345678Z',
    email: 'a@acme.test',
    country: 'España',
    plan_type: 'Básico',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulationForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulationForm);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not mark the simulation as saved when the API fails', () => {
    component.customer = customer;
    component.users = 15;
    component.guardarSimulacion();

    const req = http.expectOne('http://localhost:3000/simulations');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.calculated_cost).toBeUndefined();
    req.flush({ error: 'Cliente no encontrado.' }, { status: 404, statusText: 'Not Found' });

    expect(component.savedFlash).toBe(false);
    expect(component.saveError).toContain('Cliente no encontrado');
  });
});
