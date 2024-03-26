// Angular
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
// Libs
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
// Components
import { Modal_reciboComponent } from '../../components/modal_recibo/modal_recibo/modal_recibo.component';
import {
  IProduct,
  ITracking,
  IOrder,
} from '@core/models-v2/oms/order.interface';
import { EcommerceDocumentService } from '@core/services-v2/ecommerce-document.service';
import { IBackupOrder } from '@core/models-v2/ecommerce-document/backup-oder.interface';

@Component({
  selector: 'app-page-detalle-traking-ov',
  templateUrl: './page-detalle-traking-ov.component.html',
  styleUrls: ['./page-detalle-traking-ov.component.scss'],
})
export class DetalleTrakingOvComponent implements OnInit {
  @Input() Ov: string = '';
  @Input() detalle!: IOrder;
  recibo!: IBackupOrder;
  suma: number = 0;

  OVEstados: ITracking[] = [];
  loadingShippingAll: boolean;
  bsModalRef?: BsModalRef;

  constructor(
    private modalService: BsModalService,
    //Services v2
    private readonly ecommerceDocumentService: EcommerceDocumentService
  ) {
    this.loadingShippingAll = true;
  }

  async ngOnInit() {
    this.buscar_detalle_estado();
  }

  async ngOnChanges(changes: SimpleChanges) {
    this.loadingShippingAll = true;
    this.buscar_detalle_estado();
  }

  async buscar_detalle_estado() {
    this.suma = 0;
    this.detalle.products.forEach((r: IProduct) => {
      this.suma = this.suma + r.total;
    });
    this.OVEstados = this.detalle.tracking;
    if (this.OVEstados[this.OVEstados.length - 1].status === 'received') {
      this.ver_recibo();
    }
  }

  async ver_recibo() {
    this.ecommerceDocumentService
      .getSalesOrderBackup({ number: this.Ov })
      .subscribe({
        next: (res) => {
          this.recibo = res[0];
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  OpenModal() {
    this.bsModalRef = this.modalService.show(Modal_reciboComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        data: this.recibo,
      },
    });
    this.bsModalRef.content.closeBtnName = 'Close';
  }
}
