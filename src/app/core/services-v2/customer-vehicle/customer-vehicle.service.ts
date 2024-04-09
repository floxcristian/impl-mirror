// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Environment
import { environment } from '@env/environment';

const API_CUSTOMER = `${environment.apiEcommerce}/api/v1/customer`;

@Injectable({
  providedIn: 'root',
})
export class CustomerVehicleService {
  constructor(private http: HttpClient) {}

  getAll(documentId: string) {
    return this.http.get(`${API_CUSTOMER}/${documentId}/customer-vehicle`);
  }

  getPaginatedCustomerVehicles(
    documentId: string,
    params: {
      page?: number;
      limit?: number;
      sort?: string;
      search?:string
    }
  ) {
    return this.http.get(
      `${API_CUSTOMER}/${documentId}/paginated-customer-vehicle`,
      { params: params }
    );
  }

  createCustomerVehicle(
    documentId: string,
    params: {
      patent: string;
      brand: string;
      model: string;
      typeVehicle: string;
      manufactureYear: number;
      codeMotor: string;
      codeChasis: string;
      customer: string;
      typeImp: string;
      detail: string;
      codeSii: string;
    }
  ) {
    return this.http.post(
      `${API_CUSTOMER}/${documentId}/customer-vehicle`,
      params
    );
  }

  delete(documentId:string,customerVehicleId: string) {
    return this.http.delete(`${API_CUSTOMER}/${documentId}/customer-vehicle`,{params:{customerVehicleId}});
  }
}
