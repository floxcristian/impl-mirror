// Angular
import { Component, OnInit } from '@angular/core';
// Rxjs
import { Subscription } from 'rxjs';
// Libs
import { BsModalRef } from 'ngx-bootstrap/modal';
// Services
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
// Models
import { ISelectedStore } from '@core/services-v2/geolocation/models/geolocation.interface';
import { IStore } from '@core/services-v2/geolocation/models/store.interface';

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
    public readonly modalRef: BsModalRef,
    private readonly geolocationService: GeolocationServiceV2
  ) {}

  ngOnInit(): void {
    console.log('getSelectedStore desde ModalStoresComponent');
    this.tienda = this.geolocationService.getSelectedStore();

    this.geolocationService.stores$.subscribe({
      next: (stores) => {
        this.tiendas = stores;
      },
    });

    this.geoLocationServicePromise =
      this.geolocationService.selectedStore$.subscribe({
        next: (res) => {
          console.log('selectedStore$: ', res);
          console.log('getSelectedStore desde ModalStoresComponent 2');
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
    this.geolocationService.setSelectedStore(
      this.tiendaTemporal.zone,
      this.tiendaTemporal.code
    );

    console.log('getSelectedStore desde ModalStoresComponent 3');
    this.tienda = this.geolocationService.getSelectedStore();
    this.modalRef.hide();
  }
}
