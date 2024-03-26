import { VehicleType } from "./vehicle-type.enum";

export interface IGetByPatentOrVin {
  type: VehicleType, search: string,
  username: string
}