// Angular
import { Component, Input } from '@angular/core';
// Models
import { IStore } from '@core/services-v2/geolocation/models/store.interface';
import { IShoppingCartDetail } from '@core/models-v2/cart/shopping-cart-detail.interface';
// Services
import { RootService } from '../../services/root.service';
import { CartService } from '@core/services-v2/cart.service';
import { GeolocationApiService } from '@core/services-v2/geolocation/geolocation-api.service';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent {
  @Input() set id(value: any) {
    this.getData(value);
  }
  @Input() title = 'Detalle';

  data!: IShoppingCartDetail;
  deliveryText: any;

  config!: IConfig;

  constructor(
    public root: RootService,
    // Services V2
    private readonly geolocationApiService: GeolocationApiService,
    private readonly cartService: CartService,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
  }

  async getData(id: any) {
    this.cartService.getOneById(id).subscribe({
      next: async (res) => {
        this.data = res;
        if (res.shoppingCart.shipment?.deliveryMode == 'delivery') {
          this.deliveryText = 'Despacho';
        } else {
          let tiendas: IStore[] | any = await this.geolocationApiService
            .getStores()
            .toPromise();
          if (tiendas) {
            let tienda = tiendas.filter(
              (item: any) => item.code === this.data.shoppingCart.branchCode
            );
            this.deliveryText = 'Retiro en tienda ' + tienda[0].zone;
          }
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
