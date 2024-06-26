import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  TemplateRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { ProductCart } from '../../../../shared/interfaces/cart-item';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { isPlatformBrowser } from '@angular/common';
import { IShoppingCartProduct } from '@core/models-v2/cart/shopping-cart.interface';
import { RootService } from '@shared/services/root.service';

@Component({
  selector: 'app-grupo-detalle-productos',
  templateUrl: './grupo-detalle-productos.component.html',
  styleUrls: ['./grupo-detalle-productos.component.scss'],
})
export class GrupoDetalleProductosComponent implements OnInit {
  @Input() grupo_producto: IShoppingCartProduct[] = [];
  @Input() index: any = 0;
  @Input() length: number = 0;
  products: ProductCart[] = [];
  innerWidth: number;
  suma = 0;
  @Output() eliminarGrupo = new EventEmitter();
  modalRef!: BsModalRef;

  constructor(
    private modalService: BsModalService,
    public root: RootService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  ngOnInit() {
    this.suma_cantidad();
  }

  ngOnDestroy() {
    this.eliminarGrupo.unsubscribe();
  }

  eliminar(index: any): void {
    this.eliminarGrupo.emit(index);
    this.modalRef.hide();
  }

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  suma_cantidad() {
    this.suma = 0;
    this.grupo_producto.forEach((item: IShoppingCartProduct) => {
      this.suma = this.suma + item.price * item.quantity;
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeModal() {
    this.modalRef.hide();
  }
}
