import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CurrencyService } from './currency';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CurrencyService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads exchange rates from the backend', () => {
    service.getRates().subscribe((rates) => {
      expect(rates.USD).toBe(1.1);
      expect(rates.GBP).toBe(0.85);
    });

    const req = http.expectOne('http://localhost:3000/rates');
    expect(req.request.method).toBe('GET');
    req.flush({ EUR: 1, USD: 1.1, GBP: 0.85 });
  });
});
