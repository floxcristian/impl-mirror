// Angular
import { Component, Input, ChangeDetectorRef } from '@angular/core';
// Environment
import { environment } from '@env/environment';
// Services
import { CartService } from '@core/services-v2/cart.service';

@Component({
  selector: 'app-template-productos-vertical',
  templateUrl: './template-productos-vertical.component.html',
  styleUrls: ['./template-productos-vertical.component.scss'],
})
export class TemplateProductosVerticalComponent {
  readonly imageUrl: string = environment.imageUrl;
  @Input() objeto: any;
  @Input() innerWidth!: number;
  @Input() page: number = 0;
  @Input() tipoCatalogo!: string;
  addingToCart = false;

  ght = `height:${window.innerHeight - 60}px !important`;

  constructor(
    private cd: ChangeDetectorRef,
    private readonly cartService: CartService
  ) {}

  async addToCart(producto: any): Promise<void> {
    producto.images = {
      '150': [`${this.imageUrl}/img/250/${producto.sku}-1.jpg`],
    };
    if (this.addingToCart) {
      return;
    }
    producto = await this.cartService.setProducOrigin_cartDinamyc(
      producto,
      'vertical'
    );
    this.addingToCart = true;
    this.cartService.add(producto, 1).finally(() => {
      this.addingToCart = false;
      this.cd.markForCheck();
    });
  }
}
