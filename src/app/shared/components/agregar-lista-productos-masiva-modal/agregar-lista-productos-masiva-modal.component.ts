// Angular
import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Libs
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
import { IWishlist } from '@core/services-v2/wishlist/models/wishlist-response.interface';
// Services
import { RootService } from '../../services/root.service';
import { isVacio } from '../../utils/utilidades';
import { SessionService } from '@core/services-v2/session/session.service';
import { WishlistApiService } from '@core/services-v2/wishlist/wishlist-api.service';
import {
  IProductFromFile,
  IRegisteredProductFromFile,
} from '@core/services-v2/wishlist/models/product-from-file-response.interface';

@Component({
  selector: 'app-agregar-lista-productos-masiva-modal',
  templateUrl: './agregar-lista-productos-masiva-modal.component.html',
  styleUrls: ['./agregar-lista-productos-masiva-modal.component.scss'],
})
export class AgregarListaProductosMasivaModalComponent implements OnInit {
  listas: IWishlist[] = [];
  productosCargados: IRegisteredProductFromFile[] = [];
  productosNoCargados: IProductFromFile[] = [];
  modo: 'lotes' | 'lista' = 'lotes';

  lista!: IWishlist;
  nombre = '';
  file!: File;
  isCollapsed = false;

  creandoLista = false;
  seleccionandoLista = false;
  procesandoExcel = false;
  procesado = false;
  cantCaracteres = 0;
  maxCaracteres = 40;
  alertClass!: string;
  mensaje!: string;
  collapsed1State = true;
  collapsed2State = true;

  usuario!: ISession;
  form!: FormGroup;

  event: EventEmitter<boolean> = new EventEmitter();

  constructor(
    public ModalRef: BsModalRef,
    private fb: FormBuilder,
    public rootService: RootService,
    private toast: ToastrService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly wishlistApiService: WishlistApiService
  ) {}

  ngOnInit() {
    this.usuario = this.sessionService.getSession();
    this.form = this.fb.group({
      file: [{ value: '', disabled: false }, Validators.required],
    });
    this.seleccionandoLista = this.modo === 'lista';
    this.getWishlists();
  }

  getWishlists(): void {
    this.wishlistApiService.getWishlists(this.usuario.documentId).subscribe({
      next: (wishlists) => {
        this.listas = wishlists;
      },
    });
  }

  onFileChange(event: any): void {
    if (event.target.files.length) {
      const file = event.target.files[0];
      this.file = file;
    }
  }

  clickCollapse(item: number): void {
    switch (item) {
      case 1:
        if (
          document
            .getElementById('productosOK')
            ?.classList.contains('collapsing')
        ) {
          return;
        }
        this.collapsed1State = !this.collapsed1State;
        this.collapsed2State = true;
        break;
      case 2:
        if (
          document
            .getElementById('productosERROR')
            ?.classList.contains('collapsing')
        ) {
          return;
        }
        this.collapsed2State = !this.collapsed2State;
        this.collapsed1State = true;
        break;
    }
  }

  ingresaNombre(): void {
    this.cantCaracteres = this.nombre.length;
  }

  procesarArchvo(): void {
    if (this.procesandoExcel) {
      return;
    }
    if (this.creandoLista && (isVacio(this.nombre) || isVacio(this.file))) {
      this.toast.error('Debe ingresar un nombre y un archivo Excel.');
      return;
    }
    if (
      this.seleccionandoLista &&
      (isVacio(this.lista) || isVacio(this.file))
    ) {
      this.toast.error(
        'Debe seleccionar una lista e ingresar un archivo Excel.'
      );
      return;
    }
    if (!this.creandoLista && !this.seleccionandoLista) {
      this.toast.error('Debe crear una lista o seleccionar una existente.');
      return;
    }

    this.procesandoExcel = true;
    this.form.get('file')?.disable();

    this.wishlistApiService
      .addProductsFromFileToWishlist({
        documentId: this.usuario.documentId,
        wishlistId: this.lista.id,
        file: this.file,
      })
      .subscribe({
        next: (res) => {
          this.productosCargados = res.registered;
          this.productosNoCargados = res.notFound;

          if (
            this.productosCargados.length &&
            !this.productosNoCargados.length
          ) {
            this.alertClass = 'alert alert-success';
            this.mensaje = 'Se cargaron todos los productos correctamente.';
          }

          if (
            this.productosCargados.length &&
            this.productosNoCargados.length
          ) {
            this.alertClass = 'alert alert-warning';
            this.mensaje = `Se cargaron ${this.productosCargados.length} de ${
              this.productosCargados.length + this.productosNoCargados.length
            } productos.`;
          }

          if (
            !this.productosCargados.length &&
            this.productosNoCargados.length
          ) {
            this.alertClass = 'alert alert-danger';
            this.mensaje = 'No se cargó ningún producto.';
          }

          this.procesandoExcel = false;
          this.form.get('file')?.enable();
          this.procesado = true;
          this.form.reset();
        },
        error: () => {
          this.toast.error(
            `Ha ocurrido un error al cargar los productos a la lista.`
          );
          this.procesandoExcel = false;
          this.form.get('file')?.enable();
          this.form.reset();
        },
      });
  }

  close(hasChanges: boolean): void {
    this.event.emit(hasChanges);
    this.ModalRef.hide();
  }
}
