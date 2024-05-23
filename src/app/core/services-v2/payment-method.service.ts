// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConfirmedPayment } from '@core/models-v2/payment-method/confirmed-payment.interface';
import { IKhipuBank } from '@core/models-v2/payment-method/khipu-bank.interface';
import { IPaymentMethod } from '@core/models-v2/payment-method/payment-method.interface';
import { IPaymentTransaction } from '@core/models-v2/payment-method/payment-transaction.interface';
// Environment
import { environment } from '@env/environment';
import { Observable, Subject, firstValueFrom } from 'rxjs';

const API_PAYMENT = `${environment.apiEcommerce}/api/v1/payment`;
const API_GATEWAY = `${environment.apiEcommerce}`;

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  private close$: Subject<any> = new Subject();
  readonly closemodal$: Observable<any> = this.close$.asObservable();
  private bancokhipu$: Subject<any> = new Subject();
  readonly banco$: Observable<any> = this.bancokhipu$.asObservable();

  constructor(private http: HttpClient) {}

  getPaymentMethods(params: {
    username: string;
  }): Observable<IPaymentMethod[]> {
    return this.http.get<IPaymentMethod[]>(`${API_PAYMENT}/payment-methods`, {
      params,
    });
  }

  async redirectToWebpayTransaction(params: { shoppingCartId: string }) {
    const { shoppingCartId } = params;
    let qs = `shoppingCartId=${shoppingCartId}&redirect=0`;
    qs += '&nocache=' + new Date().getTime();
    const url = `${API_PAYMENT}/webpay/create-transaction?${qs}`;
    try {
      const result = await firstValueFrom(
        this.http.get<IPaymentTransaction>(url)
      );
      window.location.href = result.redirectUrl;
    } catch (e) {
      console.error(e);
    }
  }

  async redirectToMercadoPagoTransaction(params: { shoppingCartId: string }) {
    const { shoppingCartId } = params;
    let qs = `shoppingCartId=${shoppingCartId}&redirect=0`;
    qs += '&nocache=' + new Date().getTime();
    const url = `${API_PAYMENT}/mercadopago/create-transaction?${qs}`;
    try {
      const result = await firstValueFrom(
        this.http.get<IPaymentTransaction>(url)
      );
      window.location.href = result.redirectUrl;
    } catch (e) {
      console.error(e);
    }
  }

  async redirectToKhipuTransaction(params: {
    shoppingCartId: string;
    bankName?: string;
    bankId?: string;
    payerName?: string;
    payerEmail?: string;
  }) {
    const { shoppingCartId, bankName, bankId, payerName, payerEmail } = params;
    let qs = `shoppingCartId=${shoppingCartId}&bankId=${bankId}&bankName=${bankName}&payerName=${payerName}&payerEmail=${payerEmail}&redirect=0`;
    qs += '&nocache=' + new Date().getTime();
    const url = `${API_PAYMENT}/khipu/create-transaction?${qs}`;
    try {
      const result = await firstValueFrom(
        this.http.get<IPaymentTransaction>(url)
      );
      window.location.href = result.redirectUrl;
    } catch (e) {
      console.error(e);
    }
  }

  verifyPayment(url: string): Observable<IConfirmedPayment> {
    if (!url.startsWith('http')) {
      url = `${API_GATEWAY}${url}`;
    }
    return this.http.get<IConfirmedPayment>(url);
  }

  getKhipuBanks(): Observable<IKhipuBank[]> {
    return this.http.get<IKhipuBank[]>(`${API_PAYMENT}/khipu/banks`);
  }

  close(sentencia: any): void {
    this.close$.next(sentencia);
  }

  selectBancoKhipu(banco: any): void {
    this.bancokhipu$.next(banco);
  }
}
