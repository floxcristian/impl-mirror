// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IKhipuBank } from '@core/models-v2/payment-method/khipu-bank.interface';
import { IPaymentMethod } from '@core/models-v2/payment-method/payment-method.interface';
// Environment
import { environment } from '@env/environment';
import { Observable, Subject } from 'rxjs';

const API_PAYMENT = `${environment.apiEcommerce}/api/v1/payment`;

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodOmniService {
  private close$: Subject<any> = new Subject();
  readonly closemodal$: Observable<any> = this.close$.asObservable();
  private bancokhipu$: Subject<any> = new Subject();
  readonly banco$: Observable<any> = this.bancokhipu$.asObservable();

  successUrl = environment.urlPaymentOmniVoucher;
  rejectUrl = environment.urlPaymentOmniCanceled;

  constructor(private http: HttpClient) {}

  getPaymentMethods(params: {
    username: string;
  }): Observable<IPaymentMethod[]> {
    return this.http.get<IPaymentMethod[]>(
      `${API_PAYMENT}/payment-methods-omni`,
      {
        params,
      }
    );
  }

  redirectToWebpayTransaction(params: { shoppingCartId: string }) {
    const { shoppingCartId } = params;
    let qs = `shoppingCartId=${shoppingCartId}&redirect=1`;
    qs += `&successUrl=${this.successUrl}&rejectUrl=${this.rejectUrl}`;
    qs += '&nocache=' + new Date().getTime();
    const url = `${API_PAYMENT}/webpay/create-transaction-omni?${qs}`;
    window.location.href = url;
  }

  redirectToMercadoPagoTransaction(params: { shoppingCartId: string }) {
    const { shoppingCartId } = params;
    let qs = `shoppingCartId=${shoppingCartId}&redirect=1`;
    qs += `&successUrl=${this.successUrl}&rejectUrl=${this.rejectUrl}`;
    qs += '&nocache=' + new Date().getTime();
    const url = `${API_PAYMENT}/mercadopago/create-transaction?${qs}`;
    window.location.href = url;
  }

  redirectToKhipuTransaction(params: {
    shoppingCartId: string;
    bankName?: string;
    bankId?: string;
    payerName?: string;
    payerEmail?: string;
  }) {
    const { shoppingCartId, bankName, bankId, payerName, payerEmail } = params;
    let qs = `shoppingCartId=${shoppingCartId}&bankId=${bankId}&bankName=${bankName}&payerName=${payerName}&payerEmail=${payerEmail}&redirect=1`;
    qs += `&successUrl=${this.successUrl}&rejectUrl=${this.rejectUrl}`;
    qs += '&nocache=' + new Date().getTime();
    const url = `${API_PAYMENT}/khipu/create-transaction?${qs}`;
    window.location.href = url;
  }

  getKhipuBanks(): Observable<IKhipuBank[]> {
    const url = `${API_PAYMENT}/khipu/banks`;
    return this.http.get<IKhipuBank[]>(url);
  }

  close(sentencia: any): void {
    this.close$.next(sentencia);
  }

  selectBancoKhipu(banco: any): void {
    this.bancokhipu$.next(banco);
  }
}
