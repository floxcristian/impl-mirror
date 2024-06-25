// Angular
import { Component } from '@angular/core';
// Libs
import { BsModalRef } from 'ngx-bootstrap/modal';
// Models
import { IStore } from '@core/services-v2/geolocation/models/store.interface';
import { ITripDate } from '@core/services-v2/logistic-promise/models/availability-response.interface';
import { ISelectedStore } from '@core/services-v2/geolocation/models/geolocation.interface';
// Services
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { FiltrosMagicos } from '@shared/components/filtro-magico/interfaces/filtro-magico.interface';
import { PickupMagicFilter } from '../modal-pickup/pickup-magic-filter';
import { LogisticPromiseApiService } from '@core/services-v2/logistic-promise/logistic-promise.service';

@Component({
  selector: 'app-modal-pickup-today',
  templateUrl: './modal-pickup-today.component.html',
  styleUrls: ['./modal-pickup-today.component.scss'],
})
export class ModalPickupTodayComponent {
  productSku!: string;
  productQuantity!: number;
  selectedStore!: ISelectedStore;
  magicFilters!: FiltrosMagicos;
  isLoading!: boolean;
  currentSelectedStore!: IStore;
  availabilities: ITripDate[] = [];
  stock: number = 0;

  constructor(
    public readonly modalRef: BsModalRef,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly logisticPromiseApiService: LogisticPromiseApiService
  ) {}

  ngOnInit(): void {
    this.geolocationService.stores$.subscribe({
      next: (stores) => {
        this.magicFilters = PickupMagicFilter(this.selectedStore, stores);
      },
    });
  }

  /**
   * Al seleccionar una tienda busca las disponibilidades de retiro en tienda.
   * @param filters
   */
  onSelectStore(filter: any): void {
    this.currentSelectedStore = filter.tienda;
    this.getAvailability();
  }
  /**
   * Obtener fechas de disponibilidad para retiro en tienda.
   */
  getAvailability(): void {
    this.availabilities = [];
    if (!this.currentSelectedStore) return;

    this.isLoading = true;
    this.logisticPromiseApiService
      .getPickupAvailability({
        location: this.currentSelectedStore.code,
        regionCode: this.currentSelectedStore.regionCode,
        articles: [{ sku: this.productSku, quantity: this.productQuantity }],
      })
      .subscribe({
        next: ({ stock, tripDates }) => {
          this.availabilities = tripDates;
          this.isLoading = false;
          this.stock = stock;
        },
      });
  }
}
