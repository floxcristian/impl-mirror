// Angular
import { Injectable } from '@angular/core';
// Models
import { StorageKey } from './storage-keys.enum';
import { LocalStorageService } from '@core/modules/local-storage/local-storage.service';
import { IVehicle } from '@core/services-v2/vehicle/vehicle-response.interface';

@Injectable({
    providedIn: 'root',
})
export class SerchVehicleStorageService {
    constructor(private readonly localStorageService: LocalStorageService) {}

    get(): IVehicle | null {
        return this.localStorageService.get(StorageKey.busquedaVehiculo) || null;
    }

    set(vehicle: IVehicle | null): void {
        this.localStorageService.set(StorageKey.busquedaVehiculo, vehicle);
    }

    remove(): void {
        this.localStorageService.remove(StorageKey.busquedaVehiculo);
    }
}
