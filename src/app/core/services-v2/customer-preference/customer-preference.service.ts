// Angular
import { Injectable } from '@angular/core';
// Rxjs
import { Observable, map, of } from 'rxjs';
// Models
import { ICustomerPreference } from './models/customer-preference.interface';
// Services
import { SessionService } from '@core/services-v2/session/session.service';
import { CustomerPreferencesStorageService } from '@core/storage/customer-preferences-storage.service';
import { CustomerAddressApiService } from '../customer-address/customer-address-api.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerPreferenceService {
  constructor(
    private readonly customerPreferenceStorage: CustomerPreferencesStorageService,
    private readonly sessionService: SessionService,
    private readonly customerAddressApiService: CustomerAddressApiService
  ) {}

  /**
   * Obtener preferencias del cliente.
   * @returns
   */
  getCustomerPreferences(): Observable<ICustomerPreference> {
    const preferences = this.customerPreferenceStorage.get();
    if (preferences.deliveryAddress) {
      return of(preferences);
    }

    const { documentId } = this.sessionService.getSession();
    return this.customerAddressApiService
      .getDeliveryAddresses(documentId)
      .pipe(
        map((addresses) => {
          if (addresses.length) {
            preferences.deliveryAddress = addresses[0];
          }
          this.customerPreferenceStorage.set(preferences);
          return preferences;
        })
      );
  }
}
