import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../../../../shared/interfaces/product';
import { IArticleResponse, IAttribute } from '@core/models-v2/article/article-response.interface';

@Component({
  selector: 'app-detalle-tecnicos',
  templateUrl: './detalle-tecnicos.component.html',
  styleUrls: ['./detalle-tecnicos.component.scss'],
})
export class DetalleTecnicosComponent implements OnInit {
  @Input() producto!: IArticleResponse | undefined;

  w100!: boolean;
  innerWidth!: number;
  videoWidth = 0;
  videoHeight = 0;
  attributes:IAttribute[] | undefined = []
  /**
   * Order Marca-largo-ancho-alto-peso
   */

  constructor() {}

  ngOnInit() {
    this.attributes = this.producto?.attributes
    this.orderAttributes()
  }

  getIdVideo(url: string) {
    const idVideo = url.split('/');
    return idVideo[idVideo.length - 1];
  }

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
    this.setVideoDimensiones();
  }

  setVideoDimensiones() {
    if (this.innerWidth > 1200) {
      this.videoWidth = 450;
      this.videoHeight = 250;
    } else {
      this.videoWidth = 300;
      this.videoHeight = 150;
    }
  }

  orderAttributes(){
    if(this.attributes !== undefined){
      let iPeso:number = this.attributes?.findIndex(x => x.name === 'PESO')
      if(iPeso != -1){
        let attPeso = this.attributes[iPeso]
        this.attributes.splice(iPeso,1)
        this.attributes.unshift(attPeso)
      }
      let iAlto:number = this.attributes?.findIndex(x => x.name === 'ALTO')
      if(iAlto != -1){
        let attAlto = this.attributes[iAlto]
        this.attributes.splice(iAlto,1)
        this.attributes.unshift(attAlto)
      }
      let iAncho:number = this.attributes?.findIndex(x => x.name === 'ANCHO')
      if(iAncho != -1){
        let attAncho = this.attributes[iAncho]
        this.attributes.splice(iAncho,1)
        this.attributes.unshift(attAncho)
      }
      let iLargo:number = this.attributes?.findIndex(x => x.name === 'LARGO')
      if(iLargo != -1){
        let attLargo = this.attributes[iLargo]
        this.attributes.splice(iLargo,1)
        this.attributes.unshift(attLargo)
      }
      let iMarca:number = this.attributes?.findIndex(x => x.name === 'MARCA')
      if(iMarca != -1){
        let attMarca = this.attributes[iMarca]
        this.attributes.splice(iMarca,1)
        this.attributes.unshift(attMarca)
      }
    }
  }
}
