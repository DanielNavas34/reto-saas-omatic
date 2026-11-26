import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api';
import { CustomerDraft } from '../models';

describe('ApiService', () => {
  let service: ApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('registers a customer with POST /customers', () => {
    const draft: CustomerDraft = {
      company_name: 'Acme',
      tax_id: '12345678Z',
      email: 'a@acme.test',
      country: 'España',
      plan_type: 'Básico',
    };

    service.registerCustomer(draft).subscribe((response) => {
      expect(response.customer.id).toBe(1);
      expect(response.customer.company_name).toBe('Acme');
    });

    const req = http.expectOne('http://localhost:3000/customers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(draft);
    req.flush({ message: 'Registrado', customer: { id: 1, ...draft } });
  });
});
