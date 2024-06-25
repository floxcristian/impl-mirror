export interface IConfig {
  country: string;
  url: string;
  fullUrl: string;
  shortUrl: string;
  document: IDocument;
  phoneCodes: IPhoneCodes;
  storesPage: IStoresPage;
  salesDebtPage: ISalesDebtPage;
  sampleFiles: ISampleFiles;
  company: ICompany;
  mapCoordinates: google.maps.LatLngLiteral;
  googleTagManager: IGoogleTagManager;
}

export interface ISampleFiles {
  productUploadFile: string;
  customerUploadFile: string;
}

export interface ICompany {
  phone: string;
  formattedPhone: string;
  whatsapp: string;
  formattedWhatsapp: string;
  address: string;
  email: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
}

export interface IPhoneCodes {
  mobile: IPhoneItem;
  landline: IPhoneItem;
}

export interface IPhoneItem {
  code: string;
  lengthRule: number;
}

export interface IStoresPage {
  title: string;
  subtitle: string;
}

export interface ISalesDebtPage {
  paymentButtons: IPaymentButton[];
}

export interface IPaymentButton {
  id: string;
  title: string;
  image: string;
}

export interface IDocument {
  name: string;
  sample: string;
  documentLength: number;
}

export interface IGoogleTagManager {
  currency: string;
}
