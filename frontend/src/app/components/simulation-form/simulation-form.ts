import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Subject, Subscription, catchError, debounceTime, switchMap, tap } from 'rxjs';
import { ApiService, apiErrorMessage } from '../../services/api';
import { CurrencyService } from '../../services/currency';
import { CurrencyCode, Customer, ExchangeRates, Quote, Simulation } from '../../models';

@Component({
  selector: 'app-simulation-form',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulation-form.html',
  styleUrl: './simulation-form.css',
})
export class SimulationForm implements OnInit, OnChanges, OnDestroy {
  @Input() customer: Customer | null = null;
  @Output() simulationSaved = new EventEmitter<Simulation>();

  users = 0;
  storageGb = 10;
  apiCalls = 1000;
  currencyCode: CurrencyCode = 'EUR';

  amount: number | null = null;
  amountCurrency: CurrencyCode = 'EUR';
  rates: ExchangeRates | null = null;
  calculating = false;
  saving = false;
  savedFlash = false;
  quoteError = '';
  saveError = '';

  private readonly quoteRequests = new Subject<void>();
  private quoteSubscription?: Subscription;
  private ratesSubscription?: Subscription;
  private flashTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private api: ApiService,
    private currency: CurrencyService,
  ) {}

  ngOnInit(): void {
    this.quoteSubscription = this.quoteRequests.pipe(
      debounceTime(200),
      switchMap(() => this.requestQuote()),
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.customer) {
      this.loadRates();
      this.scheduleQuote();
    }
    if (changes['customer'] && !this.customer) {
      this.amount = null;
      this.quoteError = '';
    }
  }

  ngOnDestroy(): void {
    this.quoteSubscription?.unsubscribe();
    this.ratesSubscription?.unsubscribe();
    if (this.flashTimer) {
      clearTimeout(this.flashTimer);
    }
  }

  onUsersInput(value: string): void {
    this.users = this.wholeNumber(value);
    this.scheduleQuote();
  }

  onStorageInput(value: string): void {
    this.storageGb = this.wholeNumber(value);
    this.scheduleQuote();
  }

  onApiCallsInput(value: string): void {
    this.apiCalls = this.wholeNumber(value);
    this.scheduleQuote();
  }

  onCurrencyChange(value: string): void {
    if (value === 'EUR' || value === 'USD' || value === 'GBP') {
      this.currencyCode = value;
      this.scheduleQuote();
    }
  }

  get rateLabel(): string {
    if (!this.rates || this.currencyCode === 'EUR') {
      return '';
    }
    const rate = this.rates[this.currencyCode];
    return `1 EUR = ${rate.toFixed(4)} ${this.currencyCode}`;
  }

  rangeValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  guardarSimulacion(): void {
    if (!this.customer || this.saving) {
      return;
    }

    this.saving = true;
    this.saveError = '';
    this.savedFlash = false;

    this.api.saveSimulation(this.payload()).subscribe({
      next: (response) => {
        this.saving = false;
        this.savedFlash = true;
        this.amount = response.simulation.calculated_cost;
        this.amountCurrency = this.currencyCode;
        this.simulationSaved.emit(response.simulation);
        this.flashTimer = setTimeout(() => {
          this.savedFlash = false;
        }, 2500);
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.savedFlash = false;
        this.saveError = apiErrorMessage(err, 'No se pudo guardar la simulación.');
      },
    });
  }

  private scheduleQuote(): void {
    if (!this.customer) {
      return;
    }
    this.calculating = true;
    this.quoteRequests.next();
  }

  private requestQuote() {
    if (!this.customer) {
      this.calculating = false;
      return EMPTY;
    }

    return this.api.quoteSimulation(this.payload()).pipe(
      tap((quote: Quote) => {
        this.amount = quote.calculated_cost;
        this.amountCurrency = quote.currency;
        this.quoteError = '';
        this.calculating = false;
      }),
      catchError((err: HttpErrorResponse) => {
        this.amount = null;
        this.quoteError = apiErrorMessage(err, 'No se pudo calcular el precio.');
        this.calculating = false;
        return EMPTY;
      }),
    );
  }

  private loadRates(): void {
    this.ratesSubscription?.unsubscribe();
    this.ratesSubscription = this.currency.getRates().subscribe({
      next: (rates) => {
        this.rates = rates;
      },
      error: () => {
        this.rates = null;
      },
    });
  }

  private payload() {
    return {
      customer_id: this.customer?.id ?? 0,
      active_users: this.users,
      storage_gb: this.storageGb,
      api_calls: this.apiCalls,
      currency: this.currencyCode,
    };
  }

  private wholeNumber(value: string): number {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0;
    }
    return parsed;
  }
}
