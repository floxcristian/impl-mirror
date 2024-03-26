// Angular
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
// Libs
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import {
  ModalComponent,
  TipoIcon,
  TipoModal,
} from '../../../../shared/components/modal/modal.component';
import { RootService } from '../../../../shared/services/root.service';
import { EditarListaProductosComponent } from '../../../../shared/components/editar-lista-productos/editar-lista-productos.component';
import { AgregarListaProductosMasivaModalComponent } from '../../../../shared/components/agregar-lista-productos-masiva-modal/agregar-lista-productos-masiva-modal.component';
import { AgregarListaProductosUnitariaModalComponent } from '../../../../shared/components/agregar-lista-productos-unitaria-modal/agregar-lista-productos-unitaria-modal.component';
import { isPlatformBrowser } from '@angular/common';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { ISelectedStore } from '@core/services-v2/geolocation/models/geolocation.interface';
import { WishlistApiService } from '@core/services-v2/wishlist/wishlist-api.service';
import {
  IProductWishlist,
  IWishlist,
} from '@core/services-v2/wishlist/models/wishlist-response.interface';
import { CartService } from '@core/services-v2/cart.service';
import { IProduct } from '@core/models-v2/oms/order.interface';

@Component({
  selector: 'app-page-listas-de-productos',
  templateUrl: './page-listas-de-productos.component.html',
  styleUrls: ['./page-listas-de-productos.component.scss'],
})
export class PageListasDeProductosComponent implements OnInit {
  innerWidth: number;
  usuario!: ISession;
  tiendaSeleccionada!: ISelectedStore;
  origen!: string[];
  indexSelectedWishlist = 0;
  addingToCart = false;
  showLoading = true;
  listas: IWishlist[] = [];
  listas_temp: IWishlist[] = [];
  constructor(
    public rootService: RootService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly wishlistApiService: WishlistApiService,
    public readonly cartService: CartService
  ) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  ngOnInit(): void {
    this.usuario = this.sessionService.getSession();
    this.tiendaSeleccionada = this.geolocationService.getSelectedStore();
    this.getWishlists();
  }

  onResize(event: any): void {
    this.innerWidth = event.target.innerWidth;
  }

  /**
   * Obtener las listas de deseos.
   */
  private getWishlists(): void {
    this.listas = [];
    this.listas_temp = [];
    this.showLoading = true;
    this.wishlistApiService.getWishlists(this.usuario.documentId).subscribe({
      next: (wishlists) => {
        this.listas = wishlists;
        this.listas_temp = this.listas;
        this.showLoading = false;
      },
      error: () => {
        this.showLoading = false;
      },
    });
  }

  /**
   * Buscar producto en una lista específica.
   * @param event
   * @param index
   */
  searchProductOnList(event: any, index: number): void {
    this.listas = JSON.parse(JSON.stringify(this.listas_temp));
    const currentList = this.listas[index];
    const query = event.target.value.toLowerCase();

    currentList.articles = currentList.articles.filter(
      (product) =>
        product.name.toLocaleLowerCase().includes(query) ||
        product.sku.toLocaleLowerCase().includes(query)
    );
  }

  /**
   * Cambiar nombre de una lista de deseos.
   * @param wishlist
   */
  changeWishlistName(wishlist: IWishlist): void {
    const bsModalRef = this.modalService.show(EditarListaProductosComponent, {
      initialState: {
        nombre: wishlist.name,
        closeToOK: false,
      },
    });
    bsModalRef.content?.event.subscribe(async (wishlistName: string) => {
      if (!wishlistName) return;
      this.wishlistApiService
        .updateWishlist({
          documentId: this.usuario.documentId,
          wishlistId: wishlist.id,
          name: wishlistName,
        })
        .subscribe({
          next: () => {
            this.toastr.success(`Lista actualizada exitosamente.`);
            this.getWishlists();
            bsModalRef.hide();
          },
        });
    });
  }

  deleteWishlist(wishlist: IWishlist): void {
    const bsModalRef = this.modalService.show(ModalComponent, {
      initialState: {
        titulo: 'Confirmación',
        mensaje: `¿Está seguro que desea <strong>eliminar</strong> la lista <strong>${wishlist.name}</strong>?`,
        tipoIcon: TipoIcon.QUESTION,
        tipoModal: TipoModal.QUESTION,
      },
    });
    bsModalRef.content?.event.subscribe(async (hasAccepted: boolean) => {
      if (!hasAccepted) return;
      this.wishlistApiService
        .deleteWishlist(this.usuario.documentId, wishlist.id)
        .subscribe({
          next: () => {
            this.toastr.success(`Lista eliminada exitosamente.`);
            this.getWishlists();
          },
        });
    });
  }

  /**
   * Eliminar un producto de una lista de deseos.
   * @param wishlist
   * @param sku
   */
  deleteProductFromWishlist(wishlist: IWishlist, sku: string): void {
    const bsModalRef = this.modalService.show(ModalComponent, {
      initialState: {
        titulo: 'Confirmación',
        mensaje: `¿Está seguro que desea <strong>eliminar</strong> el producto SKU <strong>${sku}</strong> de la lista <strong>${wishlist.name}</strong>?`,
        tipoIcon: TipoIcon.QUESTION,
        tipoModal: TipoModal.QUESTION,
      },
    });
    bsModalRef.content?.event.subscribe(async (hasAccepted: boolean) => {
      if (!hasAccepted) return;

      this.wishlistApiService
        .deleteProductFromWishlist({
          sku,
          wishlistId: wishlist.id,
          documentId: this.usuario.documentId,
        })
        .subscribe({
          next: () => {
            this.toastr.success('Producto eliminado exitosamente.');
            this.getWishlists();
          },
        });
    });
  }

  /**
   * Establecer lista de desesos como predeterminada.
   * @param wishlist
   */
  setDefaultWishlist(wishlist: IWishlist) {
    this.wishlistApiService
      .setDefaultWishlist(this.usuario.documentId, wishlist.id)
      .subscribe({
        next: () => {
          this.getWishlists();
        },
      });
  }

  /**
   * Obtener el código de cliente de un producto (si es que tiene).
   * @param product
   * @returns
   */
  getCustomerCode(product: IProductWishlist): string {
    if (!product.customerCodes?.length) return '';
    const customerCode = product.customerCodes.find(
      (code) => code.documentId === this.usuario.documentId
    );
    return customerCode?.code || '';
  }

  /**
   * Añadir skus a una lista de deseos.
   */
  addProductsToWishlist(): void {
    const modal = this.modalService.show(
      AgregarListaProductosUnitariaModalComponent,
      {
        class: 'modal-lg modal-dialog-centered',
        ignoreBackdropClick: true,
      }
    );
    modal.content?.event.subscribe((hasChanges: boolean) => {
      if (!hasChanges) return;
      this.getWishlists();
    });
  }

  addProductsFromFileToWishlist() {
    const modal = this.modalService.show(
      AgregarListaProductosMasivaModalComponent,
      {
        class: 'modal-lg modal-dialog-centered',
        ignoreBackdropClick: true,
      }
    );
    modal.content?.event.subscribe((hasChanges) => {
      if (!hasChanges) return;
      this.getWishlists();
    });
  }

  addAllToCart(itemObject: any): void {
    if (this.addingToCart) {
      return;
    }

    this.addingToCart = true;
    const itemsToAdd = this.prepareItemsForCart(itemObject.articles);

    this.cartService.addLista(itemsToAdd).subscribe({
      next: (cart) => {
        this.addingToCart = false;
        this.toastr.success('Productos agregados al carrito correctamente.');
      },
      error: (error) => {
        this.addingToCart = false;
        this.toastr.error(
          'Hubo un error al agregar los productos al carrito.'
        );
        console.error('Error al agregar al carrito:', error);
      },
    });
  }

  addtoCart(item: any): void {
    if (this.addingToCart) {
      return;
    }
    this.addingToCart = true;

    const itemToAdd: any = [
      {
        sku: item.sku,
        name: item.name,
        origin: null,
        images: item.images,
        quantity: 1,
        price: 0,
      },
    ];

    this.cartService.addLista(itemToAdd).subscribe({
      next: () => {
        this.addingToCart = false;
        this.toastr.success(
          `Producto ${item.sku} agregado al carro correctamente.`
        );
      },
      error: (error) => {
        this.addingToCart = false;
        this.toastr.error('Hubo un error al agregar el producto al carro.');
        console.error('Error al agregar al carro:', error);
      },
    });
  }

  prepareItemsForCart(articles: any[]): any[] {
    return articles.map((article) => ({
      sku: article.sku,
      name: article.name,
      origin: null,
      images: [article.preview],
      quantity: 1,
    }));
  }
}
