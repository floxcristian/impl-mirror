// Angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// Rxjs
import { Observable } from 'rxjs';
// Env
import { environment } from '@env/environment';
// Models
import { IBusinessLine, ILegalBusinessLine } from './business-line.interface';

const API_CUSTOMER = `${environment.apiEcommerce}/api/v1/customer`;

@Injectable({
  providedIn: 'root',
})
export class CustomerBusinessLineApiService {
  constructor(private http: HttpClient) {}

  /**
   * Obtener giros.
   */
  getBusinessLines(): Observable<IBusinessLine[]> {
    return this.http.get<IBusinessLine[]>(`${API_CUSTOMER}/business-lines`);
  }

  /**
   *  Obtener giros Sii por documentId
   */
  getLegalBusinessLines(documentId: string): Observable<ILegalBusinessLine> {
    return this.http.get<ILegalBusinessLine>(
      `${API_CUSTOMER}/legal-business-lines`,
      { params: { documentId } }
    );
  }
}
