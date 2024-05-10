// Angular
import { Component, OnInit, Input, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
// Rxjs
import { Observable } from 'rxjs';
// Models
import { IShoppingCartProduct } from '@core/models-v2/cart/shopping-cart.interface';
// Services
import { CartService } from '@core/services-v2/cart.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-detalle-carro-productos',
  templateUrl: './detalle-carro-productos.component.html',
  styleUrls: ['./detalle-carro-productos.component.scss'],
})
export class DetalleCarroProductosComponent implements OnInit {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  // FIXME: al parecer no se usa.
  @Input() show = true;
  @Input() isOmni: boolean = false;
  @Input() shoppingCartProducts!: IShoppingCartProduct[];
  @Input() seeProducts = true;
  @Input() seePrices = true;
  @Input() shippingType: string | undefined = 'retiro';

  productsAvailable: IShoppingCartProduct[] = [];
  productsUnavailable: IShoppingCartProduct[] = [];
  shippingTypeTitle: string;

  constructor(
    public readonly cartService: CartService,
    public readonly router: Router
  ) {
    this.shippingTypeTitle = '';
  }

  private getShippingTypeTitle(shippingType: string): string {
    if (['retiro', 'TIENDA'].includes(shippingType)) {
      return 'Retiro en Tienda';
    } else if (['despacho', 'STD'].includes(shippingType)) {
      return 'Despacho a domicilio';
    } else {
      return 'Despacho a domicilio';
    }
  }

  ngOnInit(): void {
    this.shippingTypeTitle = this.getShippingTypeTitle(
      this.shippingType || ''
    );

    this.onShippingTypeChange();
    if (this.isOmni) {
      this.validateProductAvailability(this.shoppingCartProducts);
    } else {
      this.onShoppingCartProductsChange();
    }
  }

  /**
   * Al detectar un cambio en el tipo de envío, se establece el shippingType y el título del tipo de envío.
   */
  private onShippingTypeChange(): void {
    this.cartService.shippingType$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((shippingType) => {
        this.shippingType = shippingType;
        this.shippingTypeTitle = this.getShippingTypeTitle(
          this.shippingType || ''
        );
      });
  }

  /**
   * Al detectar un cambio en los productos del carro, se valida si los productos...
   */
  private onShoppingCartProductsChange(): void {
    (this.cartService.items$ as Observable<IShoppingCartProduct[]>)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((products: IShoppingCartProduct[]) => {
        if (products.length) {
          this.validateProductAvailability(products);
        }
      });
  }

  /**
   * Validar la disponibilidad de los productos.
   * @param products
   * @returns
   */
  validateProductAvailability(products: IShoppingCartProduct[]): void {
    this.productsAvailable = [];
    this.productsUnavailable = [];

    if (!products.length) return;

    products.map((item) => {
      if (['retiro', 'TIENDA'].includes(this.shippingType || '')) {
        if (!item.pickupConflict) {
          this.productsAvailable.push(item);
        } else {
          this.productsUnavailable.push(item);
        }
      } else {
        if (!item.deliveryConflict) {
          this.productsAvailable.push(item);
        } else {
          this.productsUnavailable.push(item);
        }
      }
    });

    this.cartService.emitValidateProducts(this.productsAvailable);
  }
}
