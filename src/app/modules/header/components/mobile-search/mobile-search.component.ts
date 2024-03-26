import {
  Component,
  TemplateRef,
  ViewChild,
  OnInit,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { RootService } from '../../../../shared/services/root.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { DropdownDirective } from '../../../../shared/directives/dropdown.directive';
import { MenuCategoriasB2cService } from '../../../../shared/services/menu-categorias-b2c.service';
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { GoogleTagManagerService } from 'angular-google-tag-manager';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import {
  IArticleResponse,
  IBrand,
  ICategorySearch,
  ISuggestion,
} from '@core/models-v2/article/article-response.interface';
import { ArticleService } from '@core/services-v2/article.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { ISelectedStore } from '@core/services-v2/geolocation/models/geolocation.interface';
import { CartService } from '@core/services-v2/cart.service';

@Component({
  selector: 'app-mobile-search',
  templateUrl: './mobile-search.component.html',
  styleUrls: ['./mobile-search.component.scss'],
})
export class MobileSearchComponent implements OnInit {
  @ViewChild('modalSearch', { read: TemplateRef, static: false })
  template!: TemplateRef<any>;
  @ViewChild('menuSearch', { static: false }) listSearch!: ElementRef;
  @ViewChild('searchChasis', { static: false }) searchChasis!: ElementRef;
  @ViewChild('menuTienda', { static: false }) menuTienda!: DropdownDirective;
  @ViewChild('modalChasis', { static: false }) modalChasis!: DropdownDirective;
  @ViewChild(DropdownDirective, { static: false })
  dropdown!: DropdownDirective;

  destroy$: Subject<boolean> = new Subject<boolean>();
  modalRef!: BsModalRef;

  texto: string = '';
  textToSearch: string = '';
  categorias: ICategorySearch[] = [];
  marcas: IBrand[] = [];
  sugerencias: ISuggestion[] = [];
  productosEncontrados: IArticleResponse[] = [];
  mostrarContenido: boolean = false;
  mostrarCargando: boolean = false;
  linkBusquedaProductos = '#';
  searchControl!: FormControl;
  private debounce = 100;
  buscando = true;
  back_key = false;
  mostrarResultados = false;

  sessionNotStarted = false;
  loadCart = false;
  tiendaSeleccionada!: ISelectedStore;
  seleccionado = false;
  isFocusedInput = false;
  usuario!: ISession;
  usuarioRef!: Subscription;

  constructor(
    private router: Router,
    private modalService: BsModalService,
    public root: RootService,
    private toastr: ToastrService,
    public menuCategorias: MenuCategoriasB2cService,
    public localS: LocalStorageService,
    private readonly gtmService: GoogleTagManagerService,
    // Service V2
    private readonly geolocationService: GeolocationServiceV2,
    private readonly articleService: ArticleService,
    private readonly sessionService: SessionService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly cartService: CartService
  ) {}

  ngOnInit() {
    this.searchControl = new FormControl('');
    this.searchControl.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe((query) => {
        if (query.trim() !== '') {
          this.textToSearch = query;
          this.buscarSelect();
        } else {
          this.categorias = [];
          this.productosEncontrados = [];
        }
      });
    this.tiendaSeleccionada = this.geolocationService.getSelectedStore();
    //Usuario
    this.usuario = this.sessionService.getSession();
    this.usuarioRef = this.authStateService.session$.subscribe((user) => {
      this.usuario = user;
    });

    // Tienda seleccionada
    this.geolocationService.selectedStore$.subscribe({
      next: (res) => {
        this.tiendaSeleccionada = res;
        this.cartService.calc();
        if (res.isChangeToNearestStore) {
          setTimeout(() => {
            if (this.menuTienda) this.menuTienda.open();
          }, 700);
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  reset() {
    this.buscando = true;
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  buscar() {
    this.textToSearch = this.searchControl.value || '';

    this.gtmService.pushTag({
      event: 'search',
      busqueda: this.textToSearch,
    });

    if (this.textToSearch.trim() === '') {
      this.toastr.info('Debe ingresar un texto para buscar', 'Información');
      return;
    }
    let search = this.textToSearch.replace('/', '%2F');
    this.router.navigateByUrl('inicio/productos/' + search);
    this.mostrarContenido = true;
    this.mostrarCargando = true;
    this.mostrarResultados = false;

    setTimeout(() => {
      this.dropdown.close();
    }, 500);
  }

  buscarSelect() {
    this.mostrarContenido = true;
    this.mostrarCargando = true;
    this.linkBusquedaProductos = this.textToSearch;
    if (!this.back_key && this.textToSearch.length > 3) {
      this.back_key = false;
      let params = {
        word: this.textToSearch,
        documentId: this.usuario.documentId || '0',
        branchCode: this.tiendaSeleccionada.code,
        showPrice: 1,
      };
      this.articleService.search(params).subscribe({
        next: (res) => {
          if (!this.seleccionado) {
            this.dropdown.open();
          }
          this.mostrarCargando = false;
          this.categorias = res.categories;
          this.marcas = res.brands;
          this.productosEncontrados = res.articles;
          this.sugerencias = res.suggestions;
          if (this.productosEncontrados.length === 0) {
            this.buscando = false;
          }

          this.categorias.map((item) => {
            item.url = [
              '/',
              'inicio',
              'productos',
              this.textToSearch,
              'categoria',
              item.slug,
            ];
            if (typeof item.name === 'undefined') {
              item.name = 'Sin categorias';
            }
          });

          this.productosEncontrados.map((item) => {
            item.url = ['/', 'inicio', 'productos', item.sku];
          });
        },
        error: (err) => {
          this.toastr.error('Error de conexión con el servidor de Elastic');
          console.error('Error de conexión con el servidor de Elastic');
        },
      });
    }
  }

  mostraModalBuscador() {
    this.modalRef = this.modalService.show(this.template, {
      class: 'modal-xl modal-buscador',
    });
    this.root.setModalRefBuscador(this.modalRef);
  }

  focusInput() {
    this.isFocusedInput = true;
  }

  blurInput() {
    this.isFocusedInput = false;
  }
}
