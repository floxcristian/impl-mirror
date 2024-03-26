// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Env
import { environment } from '@env/environment';
// Rxjs
import { Observable } from 'rxjs';
// Models
import { ICreateGuest } from '@core/models-v2/customer/create-guest.interface';
import { ICustomerBlocked } from '@core/models-v2/customer/customer-blocked.interface';
import { IUsersDetail } from '@core/models-v2/customer/users-detail.interface';
import {
  ICustomerCredit,
  ICustomerPriceListResponse,
} from '@core/models-v2/customer/customer.interface';
import { DefaultBranch } from '@core/utils-v2/default-branch.service';

const API_CUSTOMER = `${environment.apiEcommerce}/api/v1/customer`;

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  updateProfile(params: {
    documentId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) {
    const { documentId, firstName, lastName, email, phone } = params;
    return this.http.put(`${API_CUSTOMER}/${documentId}/profile`, {
      firstName,
      lastName,
      email,
      phone,
    });
  }

  getCustomerBlocked(documentId: string): Observable<ICustomerBlocked> {
    return this.http.get<ICustomerBlocked>(
      `${API_CUSTOMER}/${documentId}/blocked`
    );
  }

  getCustomerCredit(documentId: string): Observable<ICustomerCredit> {
    return this.http.get<ICustomerCredit>(
      `${API_CUSTOMER}/${documentId}/credit`
    );
  }

  getSupervisors(documentId: string): Observable<IUsersDetail> {
    return this.http.get<IUsersDetail>(
      `${API_CUSTOMER}/${documentId}/supervisor`
    );
  }

  createGuest(params: ICreateGuest) {
    const url = `${API_CUSTOMER}/new-guest`;
    return this.http.post(url, params);
  }

  getCustomerPriceList(
    documentId: string,
    params: {
      branchCode: string;
      page: number;
      limit: number;
      search?: string;
      urlCategory?: string;
    }
  ): Observable<ICustomerPriceListResponse> {
    params.branchCode = DefaultBranch.getBranchCode(params.branchCode);

    return this.http.get<ICustomerPriceListResponse>(
      `${API_CUSTOMER}/${documentId}/price-list`,
      { params }
    );
  }
}
