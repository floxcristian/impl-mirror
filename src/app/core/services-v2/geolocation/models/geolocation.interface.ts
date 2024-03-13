import { CallBackCartLoaded } from '@core/models-v2/cart/callback-cart-loaded.type';

export interface ISelectedStore {
  isChangeToNearestStore: boolean;
  isSelectedByClient: boolean;
  zone: string;
  code: string;
  city: string;
  callBackCartLoaded?: CallBackCartLoaded;
}
