export interface IBusinessLine {
  name: string;
  code: string;
}

export interface ILegalBusinessLine {
  customerName: string;
  businessLines: IBusinessLine[];
}
