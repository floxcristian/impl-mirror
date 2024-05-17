import { ICustomerAddress } from './customer.interface';

export interface ICreateGuest {
  email: string;
  documentId: string;
  documentType: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: ICreateGuestAddress;
}

export interface ICreateGuestAddress {
  location: string;
  city: string;
  region: string;
  province: string;
  number: string;
  street: string;
  departmentOrHouse: string;
  reference: string;
  latitude: number;
  longitude: number;
}

export interface ICreateGuestResponse {
  addresses: ICustomerAddress[];
}
