// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Env
import { environment } from '@env/environment';
// Rxjs
import { Observable } from 'rxjs';
// Models
import { ICustomerB2BParams } from './models/customer-b2b-request.interface';
import { ICustomerCreateParams } from './models/customer-create-params.interface';

const API_CUSTOMER = `${environment.apiEcommerce}/api/v1/customer`;

@Injectable({
  providedIn: 'root',
})
export class CustomerApiService {
  constructor(private http: HttpClient) {}

  // FIXME: pasar esto a un utils
  /**
   * Formatea rut.
   * Esto debe hacerse a nivel de api.
   * @param value
   * @returns
   */
  private formatDocumentId(value: string): string {
    return (
      value.substring(0, value.length - 1) +
      '-' +
      value.substring(value.length, value.length - 1)
    );
  }

  /**
   * Crear usuario.
   * @param params
   * @returns
   */
  createUser(params: ICustomerCreateParams): Observable<void> {
    const documentType = environment.country.toUpperCase();
    const userType = 0;
    const {
      firstName,
      lastName,
      city,
      street,
      streetNumber,
      documentId,
      businessLine,
      businessName,
      departmentOrHouse,
      contactDocumentId,
      locality,
      reference,
      latitude,
      longitude,
      phone,
      email,
      position,
      isCompanyUser,
      ..._params
    } = params;
    const [formattedCity, province, region] = city.split('@');
    const customerType = isCompanyUser ? 2 : 1;

    const formattedEmail = email.toLowerCase();

    return this.http.post<void>(`${API_CUSTOMER}/new`, {
      ..._params,
      documentId,
      documentType,
      userType,
      customerType,
      businessLine: businessLine || '',
      businessLineName: businessLine || '',
      email: formattedEmail,
      firstName : isCompanyUser ? businessName : firstName,
      lastName,
      contact: {
        documentId: isCompanyUser ? contactDocumentId : documentId,
        name: firstName,
        lastName,
        phone,
        position: isCompanyUser ? position : 'FACTURACION',
        email: formattedEmail,
      },
      address: {
        city: formattedCity,
        street,
        number: streetNumber,
        departmentOrHouse,
        reference,
        latitude,
        longitude,
        location: locality,
        region,
        province,
      },
    });
  }

  /**
   * Crear usuario B2B.
   * @param params
   * @returns
   */
  createUserB2B(params: ICustomerB2BParams): Observable<void> {
    const password = 'qwert1234';
    const documentType = environment.country.toUpperCase();
    const {
      firstName,
      lastName,
      city,
      street,
      addressNumber,
      departmentOrHouse,
      documentId,
      ..._params
    } = params;

    // const formatDocumentId = this.formatDocumentId(documentId);
    return this.http.post<void>(`${API_CUSTOMER}/new-b2b`, {
      ..._params,
      password,
      documentType,
      // documentId: formatDocumentId,
      documentId,
      firstName,
      lastName,
      address: {
        city,
        street,
        departmentOrHouse,
        number: addressNumber,
      },
    });
  }
}
