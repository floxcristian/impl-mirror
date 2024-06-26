// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
// Rxjs
import { Observable, map } from 'rxjs';
// Env
import { environment } from '@env/environment';
import { IAvailabilityRequest } from './models/availability-request.interface';
import { ILocality } from './models/locality.interface';
import {
  IAvailabilityResponse,
  ITripDate,
} from './models/availability-response.interface';
import { IProductRequest } from './models/product-request.interface';
import { IPickupResponse } from './models/pickup-response.interface';

const API_LOGISTIC_PROMISE = `${environment.apiEcommerce}/api/v1/logistic-promise`;
// const API_LOGISTIC = `${environment.apiEcommerce}/api/v1/logistic/`;
@Injectable({
  providedIn: 'root',
})
export class LogisticPromiseApiService {
  private http = inject(HttpClient);

  /**
   * Obtener tiendas.
   * @returns
   */
  /*getStores(): Observable<any> {
    return this.http
      .get<any>(`${API_LOGISTIC_PROMISE}/stores`)
      .pipe(map((res) => res.data));
  }*/

  /**
   * Obtener localidades.
   */
  getLocalities(): Observable<ILocality[]> {
    return this.http.get<any>(`${API_LOGISTIC_PROMISE}/localities`);
  }

  /**
   * Obtener disponibilidad.
   * @param mode
   * @param location
   * @param products
   * @returns
   */
  /*getLogisticPromise(
    mode: string,
    location: any,
    products: IProductRequest[]
  ): Observable<any> {
    console.log(
      '🚀 ~ file: promesa.service.ts:33 ~ PromesaService ~ getpromesa ~ localidad:',
      location
    );
    const article = products[0];
    return this.http.post<any>(`${API_LOGISTIC_PROMISE}/${mode}`, {
      location,
      article,
    });
  }*/

  /**
   * Obtener disponibilidad de despacho a domicilio.
   * @returns
   */
  getDeliveryAvailability(
    params: IAvailabilityRequest
  ): Observable<ITripDate[]> {
    return this.http
      .post<IAvailabilityResponse>(`${API_LOGISTIC_PROMISE}/delivery`, {
        ...params,
        omni: false,
        securityStock: true,
        useRealStock: false,
      })
      .pipe(map((res) => res.subOrders[0].tripDates));
  }

  /**
   * Obtener disponibilidad de retiro en tienda.
   * @returns
   */
  getPickupAvailability(
    params: IAvailabilityRequest
  ): Observable<IPickupResponse> {
    return this.http
      .post<IAvailabilityResponse>(`${API_LOGISTIC_PROMISE}/pickup`, {
        ...params,
        omni: false,
        securityStock: true,
        useRealStock: false,
      })
      .pipe(
        map((res) => {
          const sku = params.articles[0].sku;
          // const maxStock = res.candidateWarehouses.reduce(
          //   (acc, warehouse) =>
          //     (acc += res.warehouses[warehouse].stock[sku] || 0),
          //   0
          // );
          const stock = res.warehouses[params.location].stock[sku] || 0;
          const maxStock = res.candidateWarehouses.reduce(
            (a, b) => Math.max(a, res.warehouses[b].stock[sku] || 0),
            -Infinity
          );
          const tripDates = res.subOrders[0].tripDates;
          return { stock, maxStock, tripDates };
        })
      );
  }
}
