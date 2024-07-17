import {
  Component,
  TemplateRef,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { RootService } from '../../../../shared/services/root.service';

import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { DropdownDirective } from '../../../../shared/directives/dropdown.directive';
import { environment } from '@env/environment';
import { MenuCategoriasB2cService } from '../../../../shared/services/menu-categorias-b2c.service';
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { CartService } from '@core/services-v2/cart.service';

@Component({
  selector: 'app-mobile-header',
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.scss'],
})
export class MobileHeaderComponent implements OnInit, OnDestroy {
  @ViewChild('menuSearch', { static: false }) dropdown!: DropdownDirective;
  @ViewChild('modalSearch', { read: TemplateRef, static: false })
  template!: TemplateRef<any>;
  @ViewChild('modalsearchVin', { read: TemplateRef, static: false })
  templateVin!: TemplateRef<any>;
  @ViewChild('menuTienda', { static: false }) menuTienda!: DropdownDirective;
  destroy$: Subject<boolean> = new Subject<boolean>();
  logoSrc = environment.logoSrc;
  modalRef!: BsModalRef;
  modalRefVin!: BsModalRef;
  isFocusedInput: boolean = false;
  templateTiendaModal!: TemplateRef<any>;
  texto: string = '';

  numeroVIN: any = '';
  textToSearch: string = '';
  categorias: any[] = [];
  marcas: any[] = [];
  sugerencias: any[] = [];
  productosEncontrados: any[] = [];
  mostrarContenido = false;
  mostrarCargando = false;
  linkBusquedaProductos = '#';
  searchControl!: FormControl;
  buscando = true;

  mostrarResultados = false;

  constructor(
    public menuCategorias: MenuCategoriasB2cService,
    private router: Router,
    public root: RootService,
    public cart: CartService,
    public localS: LocalStorageService
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  Hidebar(): boolean {
    /*let url = null;
    if (this.router.url.split('?')[0] != undefined) {
      url = '' + this.router.url.split('?')[0];
    }*/
    if (this.router.url.includes('/carro-compra/')) {
      return false;
    } else {
      return true;
    }
  }
}
