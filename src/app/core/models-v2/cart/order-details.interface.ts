import { IShoppingCart, IShoppingCartProduct } from './shopping-cart.interface';

export interface IShoppingCartResponse {
  total: number;
  found: number;
  limit: number;
  page: number;
  firstPage: number;
  lastPage: number;
  data: IShoppingCart[];
}

export interface IOrderDetailResponse {
  total: number;
  found: number;
  limit: number;
  page: number;
  firstPage: number;
  lastPage: number;
  data: IOrderDetail[];
}

export interface IOrderDetail {
  id: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  salesId: string;
  status: string;
  purchaseOrder: IPurchaseOrder;
  deliveryMode: string;
  shipmentPrice: number;
  total: number;
  productQuantity: number;
  saler: string;
  products: IShoppingCartProduct[];
}

export interface IPurchaseOrder {
  number: string;
  amount: number;
  costCenter: string;
}
