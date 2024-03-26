// Angular
import { Component } from '@angular/core';
// Libs
import { BsModalRef } from 'ngx-bootstrap/modal';
// Models
import { ITripDate } from '@core/services-v2/logistic-promise/models/availability-response.interface';
import { FiltrosMagicos } from '@shared/components/filtro-magico/interfaces/filtro-magico.interface';
// Services
import { LogisticPromiseApiService } from '@core/services-v2/logistic-promise/logistic-promise.service';
import { DeliveryMagicFilter } from './delivery-magic-filter';
import { ILocality } from '@core/services-v2/logistic-promise/models/locality.interface';

@Component({
  selector: 'app-modal-delivery',
  templateUrl: './modal-delivery.component.html',
  styleUrls: ['./modal-delivery.component.scss'],
})
export class ModalDeliveryComponent {
  productSku!: string;
  productQuantity!: number;
  magicFilters: FiltrosMagicos;
  deliveryAvailabilities: ITripDate[] = [];
  isLoading!: boolean;
  selectedLocality!: ILocality;

  constructor(
    public readonly modalRef: BsModalRef,
    private readonly logisticPromiseApiService: LogisticPromiseApiService
  ) {
    this.magicFilters = DeliveryMagicFilter(this.logisticPromiseApiService);
  }

  /**
   * Al seleccionar una ciudad busca las disponibilidades de despacho a domicilio.
   * @param filters
   */
  onSelectCity(filters: any): void {
    this.selectedLocality = filters?.localidad || null;
    if (this.selectedLocality) {
      this.getAvailability();
    }
  }

  /**
   * Obtener fechas de disponibilidad para despacho a domicilio.
   */
  getAvailability(): void {
    this.deliveryAvailabilities = [];
    if (!this.selectedLocality) return;

    this.isLoading = true;
    this.logisticPromiseApiService
      .getDeliveryAvailability({
        location: this.selectedLocality.name,
        regionCode: this.selectedLocality.regionCode.toString(),
        articles: [{ sku: this.productSku, quantity: this.productQuantity }],
      })
      .subscribe({
        next: (availabilities) => {
          this.isLoading = false;
          this.deliveryAvailabilities = availabilities;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}
