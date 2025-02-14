// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Environment
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import {
  IPaginatedVehicleCustomerResponse,
  IVehicleCustomer,
} from './vehicle-customer-response.interface';

const API_CUSTOMER = `${environment.apiEcommerce}/api/v1/customer`;

@Injectable({
  providedIn: 'root',
})
export class CustomerVehicleService {
  constructor(private http: HttpClient) {}

  getAll(documentId: string): Observable<IVehicleCustomer[]> {
    return this.http.get<IVehicleCustomer[]>(
      `${API_CUSTOMER}/${documentId}/customer-vehicle`
    );
  }

  getPaginatedCustomerVehicles(
    documentId: string,
    params: {
      page?: number;
      limit?: number;
      sort?: string;
      search?: string;
    }
  ): Observable<IPaginatedVehicleCustomerResponse> {
    return this.http.get<IPaginatedVehicleCustomerResponse>(
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
      typeVehicle?: string;
      manufactureYear: number;
      codeMotor: string;
      codeChasis: string;
      typeImp: string;
      detail?: string;
      codeSii: string;
    }
  ) {
    return this.http.post(
      `${API_CUSTOMER}/${documentId}/customer-vehicle`,
      params
    );
  }

  delete(documentId: string, customerVehicleId: string) {
    return this.http.delete(`${API_CUSTOMER}/${documentId}/customer-vehicle`, {
      params: { customerVehicleId },
    });
  }
}
