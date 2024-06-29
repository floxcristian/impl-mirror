// Angular
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// Env
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Basic c2VydmljZXM6MC49ajNEMnNzMS53Mjkt`
  });

  constructor(private http: HttpClient) {}

  generatePayment(data: any) {
    return this.http.post(environment.apiCustomer + `deuda/generaPago`, data);
  }

  setDevolucion(data: any) {
    return this.http.post(environment.apiCustomer + `devolucion`, data);
  }

  setMesDelCamionero(formData: FormData) {
    let consulta = null;
    const url = `${environment.apiCustomer}mesDelCamionero`;

    consulta = this.http.post<any>(url, formData);

    return consulta;
  }

  getMesDelCamionero() {
    let consulta = null;
    const url = `${environment.apiCustomer}mesDelCamionero`;

    consulta = this.http.get<any>(url);

    return consulta;
  }
}
