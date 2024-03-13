// Angular
import { Injectable } from '@angular/core';
// Rxjs
import { BehaviorSubject, Observable, Subject } from 'rxjs';
// Models
import { ISelectedStore } from '@core/services-v2/geolocation/models/geolocation.interface';
import { IStore } from './models/store.interface';
// Services
import { GeolocationStorageService } from '@core/storage/geolocation-storage.service';
import { GeolocationApiService } from './geolocation-api.service';
import { environment } from '@env/environment';
import { CallBackCartLoaded } from '@core/models-v2/cart/callback-cart-loaded.type';

@Injectable({
  providedIn: 'root',
})
export class GeolocationServiceV2 {
  private selectedStoreSubject: Subject<ISelectedStore> = new Subject();
  readonly selectedStore$: Observable<ISelectedStore> =
    this.selectedStoreSubject.asObservable();

  // Necesito que sea `BehaviorSubject` para poder obtener el valor actual, ya que este mantiene el último valor emitido.
  private storesSubject: BehaviorSubject<IStore[]> = new BehaviorSubject<
    IStore[]
  >([]);
  readonly stores$: Observable<IStore[]> = this.storesSubject.asObservable();

  // FIXME: quitar dependencia de esta variable.
  geolocation!: ISelectedStore;
  secondCallbackTimer!: ReturnType<typeof setTimeout>;

  constructor(
    private readonly geolocationApiService: GeolocationApiService,
    private readonly geolocationStorage: GeolocationStorageService
  ) {}

  /**
   * Establecer tienda.
   * @param params
   */
  setSelectedStore(params: {
    zone: string;
    code: string;
    city: string;
    callBackCartLoaded?: CallBackCartLoaded;
  }): void {
    const { zone, code, city } = params;
    this.geolocation = {
      zone,
      code,
      city,
      isChangeToNearestStore: false,
      isSelectedByClient: true,
      callBackCartLoaded: params.callBackCartLoaded,
    };
    this.geolocationStorage.set(this.geolocation);
    this.selectedStoreSubject.next(this.geolocation);
  }

  /**
   * Obtener tienda seleccionada.
   * @returns
   */
  getSelectedStore(): ISelectedStore {
    let geolocation = this.geolocationStorage.get();
    if (geolocation) {
      this.geolocation = geolocation;
      return this.geolocation;
    } else {
      geolocation = this.setDefaultLocation();
      return geolocation;
    }
  }

  /**
   * Establecer tienda por defecto.
   * En storage y variable global (se debe quitar esta última).
   * @returns
   */
  setDefaultLocation(): ISelectedStore {
    const stores = this.storesSubject.value;
    const defaultStore = stores.find((store) => store.default);
    if (defaultStore) {
      this.geolocation = {
        isChangeToNearestStore: false,
        isSelectedByClient: false,
        zone: defaultStore.zone,
        code: defaultStore.code,
        city: defaultStore.city,
      };
    } else {
      if (stores.length > 0) {
        const firstLocation = stores[0];
        this.geolocation = {
          isChangeToNearestStore: false,
          isSelectedByClient: false,
          zone: firstLocation.zone,
          code: firstLocation.code,
          city: firstLocation.city,
        };
      } else {
        this.geolocation = {
          isChangeToNearestStore: false,
          isSelectedByClient: false,
          zone: environment.defaultBranch.zone,
          code: environment.defaultBranch.code,
          city: environment.defaultBranch.city,
        };
      }
    }

    this.geolocationStorage.set(this.geolocation);
    return this.geolocation;
  }

  /**
   * Se llama solo una vez en el app.component.
   */
  initGeolocation(): void {
    this.geolocationApiService.getStores().subscribe({
      next: (stores) => {
        this.storesSubject.next(stores);
        let geolocation = this.geolocationStorage.get();

        if (!geolocation) {
          geolocation = this.setDefaultLocation();
        }
        // Si el navegador soporta geolocalización automática y la tienda no fue seleccionada por el cliente.
        if (navigator.geolocation && !geolocation.isSelectedByClient) {
          this.setNearestStore();
        } else {
          this.selectedStoreSubject.next(this.geolocation);
        }
      },
    });
  }

  /**
   * Establecer tienda más cercana.
   */
  private setNearestStore(): void {
    let isFirstCallback = true;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        if (isFirstCallback) {
          isFirstCallback = false;
          const hasSecondCallback = await this.hasSecondCallback();
          if (hasSecondCallback) return;
        } else {
          clearTimeout(this.secondCallbackTimer);
        }

        const { latitude, longitude } = coords;
        this.geolocationApiService
          .getNearestStore(latitude, longitude)
          .subscribe({
            next: (res) => {
              this.geolocation = {
                isSelectedByClient: false,
                isChangeToNearestStore:
                  this.geolocation && this.geolocation.code !== res.code,
                zone: res.zone,
                code: res.code,
                city: res.city,
              };
              this.geolocationStorage.set(this.geolocation);

              this.selectedStoreSubject.next(this.geolocation);
            },
            error: () => {
              console.warn(
                'No se ha podido establecer la tienda más cercana.'
              );
              this.selectedStoreSubject.next(this.geolocation);
            },
          });
      },
      async (err) => {
        if (isFirstCallback) {
          isFirstCallback = false;
          const hasSecondCallback = await this.hasSecondCallback();
          if (hasSecondCallback) return;
        } else {
          clearTimeout(this.secondCallbackTimer);
        }
        console.error(err);
        this.selectedStoreSubject.next(this.geolocation);
      }
    );
  }

  /**
   * Espera un segundo callback para el `navigator.geolocation.getCurrentPosition`.
   * @returns
   */
  private hasSecondCallback(): Promise<boolean> {
    const timeout = 500;
    return new Promise(async (resolve) => {
      this.secondCallbackTimer = setTimeout(() => resolve(false), timeout);
      await new Promise(async (innerResolve) =>
        setTimeout(() => innerResolve(null), timeout)
      );
      resolve(true);
    });
  }
}
