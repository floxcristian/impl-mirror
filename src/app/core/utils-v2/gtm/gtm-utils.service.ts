import { CategoryDetail } from '@core/models-v2/article/article-response.interface';
import {
  IShoppingCart,
  IShoppingCartGroup,
  IShoppingCartProduct,
} from '@core/models-v2/cart/shopping-cart.interface';
import { IProductGtm } from './product-gtm.interface';
import { environment } from '@env/environment';

export class GtmUtils {
  /**
   * Formatear categorías para gtm.
   * @param categories
   * @returns
   */
  static formatCategories(categories: CategoryDetail[]): {
    firstCategory: string;
    secondCategory: string;
    thirdCategory: string;
  } {
    return categories.reduce(
      (acc, el) => {
        if (el.level === 1) acc.firstCategory = el.name || '';
        else if (el.level === 2) acc.secondCategory = el.name || '';
        else if (el.level === 3) acc.thirdCategory = el.name || '';
        return acc;
      },
      { firstCategory: '', secondCategory: '', thirdCategory: '' }
    );
  }

  /**
   * Formatear producto para gtm.
   * @param product
   * @returns
   */
  static formatGtmProduct(product: IShoppingCartProduct): IProductGtm {
    /*const netPrice = Math.round(
      product.price / (1 + (product.iva || environment.IVA))
    );*/
    return {
      item_id: product.sku,
      item_name: product.name,
      discount:
        product.commonPrice &&
        product.price &&
        product.commonPrice > product.price
          ? product.commonPrice - product.price
          : /* Math.round((el.commonPrice - el.price) / (1 + (el.iva || environment.IVA))*/
            0,
      item_brand: product.brand || 'IMPLEMENTOS',
      item_category: '',
      item_category2: '',
      item_category3: '',
      location_id: '',
      price: product.price, //netPrice
      quantity: product.quantity,
    };
  }

  /**
   * Obtener valor total del envío a domicilio de un carro.
   * @param shoppingCart
   * @returns
   */
  static getShipping(shoppingCart: IShoppingCart): number {
    return shoppingCart.groups
      ? shoppingCart.groups?.reduce(
          (acc, el) => acc + (el.shipment.price - el.shipment.discount),
          0
        )
      : (shoppingCart.shipment?.price || 0) -
          (shoppingCart.shipment?.discount || 0);
  }

  /**
   * Formatear carro de compras para GTM.
   * @param shoppingCart
   * @returns
   */
  static formatGtmCart(shoppingCart: IShoppingCart) {
    const { products, total, tax } = shoppingCart.products.reduce(
      (acc, el) => {
        const netPrice = Math.round(
          el.price / (1 + (el.iva || environment.IVA))
        );
        const tax = Math.round(el.price - netPrice);
        const gtmProduct = GtmUtils.formatGtmProduct(el);
        acc.products.push(gtmProduct);
        acc.total += netPrice * el.quantity;
        acc.tax += tax * el.quantity;
        return acc;
      },
      { products: [] as IProductGtm[], total: 0, tax: 0 }
    );
    const shipping = GtmUtils.getShipping(shoppingCart);
    return { products, total, tax, shipping };
  }
}
