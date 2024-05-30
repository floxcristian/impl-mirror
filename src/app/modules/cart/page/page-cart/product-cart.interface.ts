import { FormControl } from '@angular/forms';
import { IShoppingCartProduct } from '@core/models-v2/cart/shopping-cart.interface';

export interface IProductCart {
  ProductCart: IShoppingCartProduct;
  quantity: number;
  quantityControl: FormControl;
}
