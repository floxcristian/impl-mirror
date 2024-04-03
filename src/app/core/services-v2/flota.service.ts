// Angular
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

const API_CLIENTE = `https://b2b-api.implementos.cl/api/cliente`;

@Injectable({
    providedIn: 'root',
})
export class FlotaService {
    constructor(private http: HttpClient) {}

    getSearchVin(documentId:string){
        return this.http.get(`${API_CLIENTE}/busquedasVin`,{ params:{rutCliente:documentId}})
    }

    getFlota(documentId:string){
        return this.http.get(`${API_CLIENTE}/flota`,{params:{rutCliente:documentId}})
    }

    setFlota(flota:any){
        return this.http.post(`${API_CLIENTE}/flota`,flota)
    }

    updatedFlota(flota:any){
        return this.http.put(`${API_CLIENTE}/flota`,flota)
    }

    deleteSearchVin(search:any){
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: {
                idFlota: search._id
            }
        };
        return this.http.delete(`${API_CLIENTE}/busquedaVin`, options);
    }

    deleteFlota(flota:any){
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            body: {
                idFlota: flota._id
            }
        };
        return this.http.delete(`${API_CLIENTE}/flota`, options);
    }

}
