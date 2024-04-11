export interface IPaginatedVehicleCustomerResponse{
    firstPage:number,
    found:number,
    lastPage:number,
    limit:number,
    page:number,
    total:number,
    data:IVehicleCustomer[]
}

export interface IVehicleCustomer {
    id?: string;
    brand: string;
    codeChasis: string;
    codeMotor: string;
    codeSii?: string;
    customer:string;
    detail:string;
    documentId:string;
    manuFactureYear:number;
    model:string;
    patent:string;
    typeImp:string;
    typeVehicle:string;
    createdAt?:string;
    updatedAt?:string;
}