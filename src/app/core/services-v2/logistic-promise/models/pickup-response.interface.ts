import { ITripDate } from './availability-response.interface';

export interface IPickupResponse {
  tripDates: ITripDate[];
  maxStock: number;
  stock:number;
}
