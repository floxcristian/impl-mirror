export interface Flota {
    _id?: string;
    rutCliente?: string;
    vehiculo?: Vehiculo;
    // chassis?: string;
    alias?: string;
    estado?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Vehiculo {
    _id: string;
    patente: string;
    marca: string;
    tipo: string;
    modelo: string;
    anio: number;
    chasis: string;
    imagen: string;
}

export interface MarcaModeloAnio {
    marca: string;
    modelo: string;
    anio: string;
}
