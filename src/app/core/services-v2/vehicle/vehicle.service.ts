// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
// Environment
import { environment } from '@env/environment';
import { Observable, map } from 'rxjs';
import { VehicleType } from './vehicle-type.enum';
import { IVehicle, IVehicleResponse } from './vehicle-response.interface';

const API_VEHICLE = `${environment.apiEcommerce}/api/catalogo/`;

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
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

  getProductsByVehicle(patent: string, SIICode: string) {
    return this.http.get(`${API_VEHICLE}/vehiculofilterid`, {
      params: {
        codigoSII: SIICode,
        patente: patent,
      },
    });
  }
}
