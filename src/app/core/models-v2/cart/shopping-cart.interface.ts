export interface IShoppingCart {
  _id?: string;
  cartNumber?: number;
  cartType?: string;
  status?: string;
  salesDocumentType?: number;
  invoiceType?: string;
  salesId?: string;
  observation?: string;
  customer?: IShoppingCartCustomer;
  shipment?: IShoppingCartShipment;
  products: IShoppingCartProduct[];
  deletedProducts?: ShoppingCartDeletedProduct[];
  purchaseOrder?: ShoppingCartPurchaseOrder;
  payment?: IShoppingCartPayment;
  notification?: IShoppingCartNotification;
  groups?: IShoppingCartGroup[];
  branchCode?: string;
  warehouse?: string;
  remarketing?: number;
  user?: string;
  thanksForYourPurchaseDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  guest?: IShoppingCartGuest;
  tags?: IShoppingCartTag;

  quantity: number;
  subtotal?: number;
  totals?: ICartTotal[];
  total?: number;
}

export interface IShoppingCartProduct {
  num?: number;
  detailId?: number;
  sku: string;
  name: string;
  brand?: string;
  quantity: number;
  price: number;
  commonPrice?: number;
  origin?: IShoppingCartProductOrigin;
  images?: {
    '150': string[];
    '250': string[];
    '450': string[];
    '600': string[];
    '1000': string[];
    '2000': string[];
  };
  image?: string;
  addedAt?: Date;
  deliveryConflict?: boolean;
  pickupConflict?: boolean;
  delivery?: {
    homeDelivery: boolean;
    pickup: boolean;
  };
  weight?: number;
  lading?: boolean;
  iva?: number;
}

export interface IShoppingCartProductOrigin {
  origin: string;
  subOrigin: string;
  section: string;
  recommended: string;
  sheet: boolean;
  cyber: number;
}

export interface IShoppingCartShipment {
  serviceType: string;
  deliveryMode: string;
  warehouse: string;
  addressId: string;
  address?: string;
  carrierCode: string;
  carrierName: string;
  dropshipmentType?: number;
  observation: string;
  price: number;
  discount: number;
  businessDays: number;
  pickingDate: Date;
  requestedDate: Date;
}

export interface IShoppingCartTripDate {
  pickingDate: Date;
  requestedDate: Date;
  price: number;
  identifier: string;
  warehouse: string;
  businessDays: number;
  serviceType: {
    code: string;
    description: string;
  };
  carrier: {
    code: string;
    description: string;
    internal: boolean;
  };
  dropshipmentType: {
    code: number;
    description: string;
  };
  scheduleEnabled: boolean;
  scheduleReference: string;
}

export interface IShoppingCartGroup {
  id: number;
  identifier: string;
  dropshipmentType: number;
  warehouse: string;
  shipment: IShoppingCartShipment;
  products: IShoppingCartProduct[];
  tripDates: IShoppingCartTripDate[];
}

export interface ShoppingCartDeletedProduct {
  sku: string;
  deletedAt: Date;
}

export interface ShoppingCartPurchaseOrder {
  number: string;
  amount: number;
  costCenter: string;
  mimeType: string;
  code: string;
  confirmationToken: string;
  defeated: boolean;
  status: number;
}

export interface IShoppingCartPayment {
  method: string;
  token: string;
  type: string;
  journalId: string;
}

export interface IShoppingCartCustomer {
  documentId: string;
}

export interface IShoppingCartNotification {
  phone: string;
  email: string;
  name: string;
}

export interface IShoppingCartGuest {
  documentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  commune: string;
}

export interface IShoppingCartTag {
  gtag: boolean;
}

export interface ICartTotal {
  title?: string;
  price?: number;
  type?: 'shipping' | 'fee' | 'tax' | 'other' | 'discount';
}
