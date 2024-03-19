// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
// Environment
import { environment } from '@env/environment';

const API_DOCUMENT_DOWNLOAD = `${environment.apiEcommerce}/api/v1/document`;
const API_PAYMENT_DOWNLOAD = `${environment.apiEcommerce}/api/v1/payment`;

@Injectable({
  providedIn: 'root',
})
export class DocumentDownloadService {
  private http = inject(HttpClient);

  downloadSalesOrder(code: string) {
    const encoded = encodeURIComponent(code);
    const url = `${API_DOCUMENT_DOWNLOAD}/download/sales-order/${encoded}`;
    return this.http.get(url, { responseType: 'arraybuffer' });
  }

  downloadFacturaPdf(code: string) {
    const encoded = encodeURIComponent(code);
    const url = `${API_DOCUMENT_DOWNLOAD}/downloadBase64/document/${encoded}`;
    return this.http.get(url);
  }

  downloadOcPdf(shoppingCartId:string){
    const url = `${API_PAYMENT_DOWNLOAD}/purchase-order/download/${shoppingCartId}`
    return this.http.get(url, { responseType: 'arraybuffer' });
  }
}
