import { MetaTag } from '../article/article-response.interface';
import { IShoppingCartProductOrigin } from '../cart/shopping-cart.interface';

export interface ISpecialResponse {
  banners: IBanner[];
  specials: ISpecial[];
  data: ISpecialData[];
  total: number;
}

export interface ISpecial {
  _id: string;
  active: boolean;
  title: string;
  slug: string;
  order: number;
  expirationDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IBanner {
  _id: string;
  active: boolean;
  position: string;
  order: number;
  url: string;
  title: string;
  alt: string;
  target: string;
  imageFull: string;
  imageTablet: string;
  imageMobile: string;
  expirationDate: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ISpecialData {
  id: string;
  title: string;
  order: number;
}

export interface IPaginated {
  total: number;
  found: number;
  limit: number;
  page: number;
  firstPage: number;
  lastPage: number;
  data: IArticle[];
}

export interface IArticle {
  sku: string; // +
  name: string; // +
  description: string; // +
  brand: string; // +
  minimumPrice: number; // +
  images: IImage; // +
  priceInfo: IPriceInfo; // +
  deliverySupply?: IDeliverySupply; //
  stockSummary: IStockSummary; // +
  origin: IShoppingCartProductOrigin; // + /// ESTO LO AGREGARON A MANO?
  cyber: number; // +
  metaTags?: MetaTag[];
}

export interface IImage {
  '150': string[];
  '250': string[];
  '450': string[];
  '600': string[];
  '1000': string[];
  '2000': string[];
}

export interface IPriceInfo {
  sku: string; //
  price: number;
  netPrice: number;
  minimumPrice: number; //
  sellerMinimumPrice: number; //
  sellerMinimumNetPrice: number; //
  hasScalePrice: boolean; //
  scalePrice: IScalePrice[]; //
  commonPrice: number;
  commonNetPrice: number;
  discount: number;
  netDiscount: number;
  comments: string[];
  documentId: string;
  customerPrice: number;
  customerNetPrice: number;
}

export interface IScalePrice {
  fromQuantity: number;
  toQuantity: number;
  price: number;
  netPrice: number;
}

export interface IDeliverySupply {
  sku: string;
  deliveryLocation: string | null;
  deliveryBusinessDays: number | null;
  deliveryWarehouse: string | null;
  deliveryDate: string | null;
  deliveryIsToday: boolean | null;
  pickupLocation: string | null;
  pickupBusinessDays: number | null;
  pickupWarehouse: string | null;
  pickupDate: string | null;
  pickupIsToday: boolean | null;
}

export interface IStockSummary {
  sku: string;
  companyStock: number;
  branchStock: number;
  stocks: IStock[];
}

export interface IStock {
  branchCode: string;
  quantity: number;
}
