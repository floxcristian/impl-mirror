// Angular
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Environment
import { environment } from '@env/environment';
import { Observable, map } from 'rxjs';
import { VehicleType } from './vehicle-type.enum';
import { IVehicle, IVehicleResponse } from './vehicle-response.interface';
import {
  IFilterVehicle,
  IProductsVehicleResponse,
} from './products-vehicle-response.interface';

const API_VEHICLE = `${environment.apiEcommerce}/api/catalogo/`;

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Basic c2VydmljZXM6MC49ajNEMnNzMS53Mjkt`,
  });

  constructor(private http: HttpClient) {}
  /**
   * Obtener vehículo por patente o VIN.
   * @returns
   */
  getByPatentOrVin(type: VehicleType, search: string): Observable<IVehicle> {
    return this.http
      .get<IVehicleResponse>(`${API_VEHICLE}/vehiculofilter`, {
        params: {
          patente: type === VehicleType.PATENT ? search : '',
          vin: type === VehicleType.VIN ? search : '',
        },
      })
      .pipe(map((res) => res.data.vehiculo));
  }

  getProductsByVehicle(
    patent: string,
    SIICode: string
  ): Observable<IFilterVehicle[]> {
    return this.http
      .get<IProductsVehicleResponse>(`${API_VEHICLE}/vehiculofilterid`, {
        params: {
          codigoSII: SIICode,
          patente: patent,
        },
      })
      .pipe(map((res) => res.data.filtros));
  }

  searchVehicleFilters(params: any) {
    return this.http
      .post(environment.apiElastic + 'busquedaFiltros', params, {
        headers: this.headers,
      })
      .pipe(
        map((res: any) => {
          return {
            articles: res.articulos,
            banners: [],
            brands: res.marcas,
            categories: res.categorias,
          };
        })
      );
  }
}
