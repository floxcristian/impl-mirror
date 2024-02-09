// Angular
import { Component, OnInit } from '@angular/core';
// Rxjs
import { Subscription } from 'rxjs';
// Services
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
// Models
import { ISelectedStore } from '@core/services-v2/geolocation/models/geolocation.interface';
import { IStore } from '@core/services-v2/geolocation/models/store.interface';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-stores',
  templateUrl: './modal-stores.component.html',
  styleUrls: ['./modal-stores.component.scss'],
})
export class ModalStoresComponent implements OnInit {
  tiendas!: IStore[];
  tienda!: ISelectedStore;
  tiendaTemporal: any = null;
  geoLocationServicePromise!: Subscription;
  subscriptions: Subscription[] = [];

  constructor(
    // Services V2
    public readonly activeModal: NgbActiveModal,
    private readonly geolocationService: GeolocationServiceV2
  ) {}

  ngOnInit(): void {
    this.tienda = this.geolocationService.getSelectedStore();

    this.geolocationService.stores$.subscribe({
      next: (stores) => {
        this.tiendas = stores;
      },
    });

    this.geoLocationServicePromise =
      this.geolocationService.selectedStore$.subscribe({
        next: (res) => {
          this.tienda = this.geolocationService.getSelectedStore();
        },
      });
  }

  ngOndestroy(): void {
    this.geoLocationServicePromise
      ? this.geoLocationServicePromise.unsubscribe()
      : '';
  }

  cambiarTienda(): void {
    this.geolocationService.setSelectedStore({
      zone: this.tiendaTemporal.zone,
      code: this.tiendaTemporal.code,
      city: this.tiendaTemporal.city,
    });
    this.tienda = this.geolocationService.getSelectedStore();
    this.activeModal.close();
  }
}
