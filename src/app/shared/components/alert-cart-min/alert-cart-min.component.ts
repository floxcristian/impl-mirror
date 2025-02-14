import { Component, Input } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { IShoppingCartProduct } from '@core/models-v2/cart/shopping-cart.interface';

@Component({
  selector: 'app-alert-cart-min',
  templateUrl: './alert-cart-min.component.html',
  styleUrls: ['./alert-cart-min.component.scss'],
})
export class AlertCartMinComponent {
  showAlert!: boolean;
  productDef!: IShoppingCartProduct;

  @Input() set product(value: IShoppingCartProduct) {
    if (value) {
      this.productDef = value;
    }
  }

  constructor(public bsModalRef: BsModalRef, public router: Router) {}

  show(): void {
    this.showAlert = this.router.url !== '/carro-compra/resumen';
  }

  hide(): void {
    this.showAlert = false;
  }

  go_to(): void {
    this.showAlert = false;
    this.router.navigate(['/carro-compra/resumen']);
  }
}
