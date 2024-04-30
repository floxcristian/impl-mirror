export interface IVehicleResponse {
  data: IVehicleIData;
  error: boolean;
  msg: string;
}

export interface IVehicleIData {
  aplicaciones: any[];
  confirmaciones: any[];
  vehiculo: any;
}

export interface IVehicle {
  _id: string;
  ANO_FABRICACION: number;
  COD_CHASIS: string;
  COD_MOTOR: string; // ?
  IMPtipo: string;
  MARCA: string;
  MODELO: string;
  PLACA_PATENTE: string;
  TIPO_VEHICULO: string;
  cliente: string;
  detalle: string;
  codigoSii: string;
}
