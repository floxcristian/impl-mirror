// Angular
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Environment
import { environment } from '@env/environment';
import { Observable, map, of, switchMap } from 'rxjs';
import { VehicleType } from './vehicle-type.enum';
import { IVehicle, IVehicleResponse } from './vehicle-response.interface';
import {
  IFilterVehicle,
  IProductsVehicleResponse,
} from './products-vehicle-response.interface';
import { IGetByPatentOrVin } from './get-by-patent-request.interface';

const API_VEHICLE = `${environment.apiEcommerce}/api/catalogo`;
// const API_ARTICLE = `http://localhost:3400/api/v1/article`; //`${environment.apiEcommerce}/api/v1/article`;
const API_ARTICLE = `${environment.apiEcommerce}/api/v1/article`;

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
   * Obtener información de vehículo por patente o VIN.
   * @returns
   */
  getByPatentOrVin({
    type,
    search,
    username,
  }: IGetByPatentOrVin): Observable<IVehicle | null> {
    if (search.trim()?.length <= 4) return of(null);
    return this.http
      .get<IVehicleResponse>(`${API_VEHICLE}/vehiculofilter`, {
        params: {
          patente: type === VehicleType.PATENT ? search : '',
          vin: type === VehicleType.VIN ? search : '',
          usuario: username,
        },
      })
      .pipe(map((res) => res.data.vehiculo));
  }

  // getProductsByVehicleV2(
  //   patent: string,
  //   SIICode: string
  // ): Observable<any> {
  //   return this.http
  //     .get<IProductsVehicleResponse>(`${API_VEHICLE}/vehiculofilterid`, {
  //       params: {
  //         codigoSII: SIICode,
  //         patente: patent,
  //       },
  //     })
  //     .pipe(switchMap((res: any) => {
  //       return this.searchVehicleFilters({ rut: '',skus: [], sort: '',
  //       sucursal: '' })
  //     }))
  // }

  /**
   * Obtener marcas de vehículos.
   * @returns
   */
  getBrands(): Observable<string[]> {
    return this.http
      .get<any>(`${API_VEHICLE}/filtro/aplicacion/marcas`)
      .pipe(map((res) => res.data));
  }

  /**
   * Obtener modelos de vehículos según marca.
   * @param brand marca
   * @returns
   */
  getModels(brand: string): Observable<any> {
    return this.http
      .get<any>(`${API_VEHICLE}/filtro/aplicacion/modelos`, {
        params: { marca: brand },
      })
      .pipe(map((res) => res.data));
  }

  /**
   * Obtener motores de vehículos según marca y modelo.
   * @param brand
   * @param model
   * @returns
   */
  getMotors(brand: string, model: string) {
    return this.http
      .get<any>(`${API_VEHICLE}/filtro/aplicacion/motores`, {
        params: { marca: brand, modelo: model },
      })
      .pipe(
        map((res) => {
          const years: number[] = (res.data as any[]).reduce((acc, el) => {
            acc.push(...el.anios);
            return acc;
          }, []);
          return {
            motors: res.data,
            years: [...new Set(years)].sort((a, b) => a - b),
          };
        })
      );
  }

  /**
   * Obtener skus de filtros para un vehículo.
   * @param patent
   * @param SIICode
   * @returns
   */
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

  /**
   * Obtener detalle de filtros por vehículo.
   * @param params
   * @returns
   */
  searchVehicleFilters(params: {
    page?: number;
    pageSize?: number;
    showPrice?: number;
    documentId?: string;
    branchCode?: string;
    category?: string;
    order?: string;
    brand?: string;
    filters?: string;
    location?: string;
    skus?: string[];
  }) {
    return this.http.get(`${API_ARTICLE}/filters`, { params });
  }
}
