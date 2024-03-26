// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Rxjs
import { Observable } from 'rxjs';
// Environment
import { environment } from '@env/environment';
// Models
import { ICustomerAddress } from '@core/models-v2/customer/customer.interface';
// Constants
import { AddressType } from '@core/enums/address-type.enum';

const API_CUSTOMER = `${environment.apiEcommerce}/api/v1/customer`;

@Injectable({
  providedIn: 'root',
})
export class CustomerAddressApiService {
  constructor(private http: HttpClient) {}

  getAddresses(
    documentId: string,
    type: number
  ): Observable<ICustomerAddress[]> {
    return this.http.get<ICustomerAddress[]>(
      `${API_CUSTOMER}/${documentId}/addresses`,
      {
        params: { type },
      }
    );
  }

  getInvoiceAddresses(documentId: string): Observable<ICustomerAddress[]> {
    return this.http.get<ICustomerAddress[]>(
      `${API_CUSTOMER}/${documentId}/addresses`,
      {
        params: { type: AddressType.INVOICE },
      }
    );
  }

  getDeliveryAddresses(documentId: string): Observable<ICustomerAddress[]> {
    return this.http.get<ICustomerAddress[]>(
      `${API_CUSTOMER}/${documentId}/addresses`,
      {
        params: { type: AddressType.DELIVERY },
      }
    );
  }

  createAddress(params: {
    documentId: string;
    addressType: number;
    location: string;
    city: string;
    region: string;
    province: string;
    number: string;
    street: string;
    departmentOrHouse: string;
    reference: string;
    latitude: number;
    longitude: number;
  }) {
    const {
      documentId,
      addressType,
      location,
      city,
      region,
      province,
      number,
      street,
      departmentOrHouse,
      reference,
      latitude,
      longitude,
    } = params;
    return this.http.post(`${API_CUSTOMER}/${documentId}/address`, {
      addressType,
      location,
      city,
      region,
      province,
      number,
      street,
      departmentOrHouse,
      reference,
      latitude,
      longitude,
    });
  }

  updateAddress(params: {
    documentId: string;
    addressId: string;
    addressType: number;
    location: string;
    city: string;
    region: string;
    province: string;
    number: string;
    street: string;
    departmentOrHouse: string;
    reference: string;
    latitude: number;
    longitude: number;
  }) {
    const {
      documentId,
      addressId,
      addressType,
      location,
      city,
      region,
      province,
      number,
      street,
      departmentOrHouse,
      reference,
      latitude,
      longitude,
    } = params;
    return this.http.put(
      `${API_CUSTOMER}/${documentId}/address/${addressId}`,
      {
        addressType,
        location,
        city,
        region,
        province,
        number,
        street,
        departmentOrHouse,
        reference,
        latitude,
        longitude,
      }
    );
  }

  deleteAddress(documentId: string, addressId: string) {
    return this.http.delete(
      `${API_CUSTOMER}/${documentId}/address/${addressId}`
    );
  }
}
