export interface IProductsVehicleResponse {
  data: IProductsVehicleData;
  error: boolean;
  msg: string;
}

export interface IProductsVehicleData {
  filtros: IFilterVehicle[];
  modelo: IVehicleModel;
}

export interface IFilterVehicle {
  atributos: IFilterAttribute[];
  codigo: string;
  crossReference: IFilterCrossReference[];
  imagen: string;
  marca: string;
  patente: string;
  sku: string;
  skus: string[];
  tipo: string;
  _id: string;
}

export interface IFilterAttribute {
  nombre: string;
  valor: string;
}

export interface IFilterCrossReference {
  fabricante: string;
  codigo: string;
}

export interface IVehicleModel {
  anio: number;
  codigo: string;
  codigoSII: string;
  marca: string;
  modelo: string;
  tipo: string;
  version: string;
  vin: string;
  _id: string;
}
