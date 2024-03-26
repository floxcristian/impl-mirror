import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, Subject } from 'rxjs';
import { RootService } from '../../../../shared/services/root.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { CustomerService } from '@core/services-v2/customer.service';
import { IArticlePrice } from '@core/models-v2/customer/customer.interface';
import { environment } from '@env/environment';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-page-lista-precios',
  templateUrl: './page-lista-precios.component.html',
  styleUrls: ['./page-lista-precios.component.scss'],
})
export class PageListaPreciosComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective;
  innerWidth!: number;
  precios!: IArticlePrice[];
  loadingData = true;
  paginaActual: number = 1;
  totalPaginas!: number;
  preciosPorPagina: number = 20;
  iva = true;
  categoria: string = '';

  dtOptions: DataTables.Settings = {};

  showLoading = true;
  IVA = environment.IVA;

  private localizacion$: Subject<any> = new Subject();
  readonly localizacionObs$: Observable<any> =
    this.localizacion$.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public root: RootService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly customerService: CustomerService
  ) {
    // cambio de sucursal
    this.geolocationService.selectedStore$.subscribe({
      next: () => {
        this.reDraw();
        this.buscarPrecios();
      },
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.innerWidth = window.innerWidth;
    }

    if (this.innerWidth >= 1200) {
      this.paginaActual = null || 0;
      this.preciosPorPagina = null || 0;
    }
    this.buscarPrecios();
  }

  reDraw(): void {}

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  izquierda() {
    if (this.showLoading) {
      return;
    }
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.buscarPrecios();
    }
  }

  derecha() {
    if (this.showLoading) {
      return;
    }
    if (this.paginaActual <= this.totalPaginas) {
      this.paginaActual++;
      this.buscarPrecios();
    }
  }

  async buscarPrecios() {
    this.showLoading = true;
    const tiendaSeleccionada = this.geolocationService.getSelectedStore();
    const user = this.sessionService.getSession();

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthMenu: [
        [10, 15, 20],
        [10, 15, 20],
      ],
      serverSide: true,
      responsive: true,
      searching: true,
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json',
        processing: 'Cargando Órdenes de ventas..',
      },
      ajax: (dataTablesParameters: any, callback) => {
        this.loadingData = true;
        let page_actual =
          dataTablesParameters.start === 0
            ? 1
            : dataTablesParameters.start / dataTablesParameters.length + 1;
        let params: any = {
          branchCode: tiendaSeleccionada.code,
          page: page_actual,
          limit: dataTablesParameters.length,
          search: dataTablesParameters.search.value,
          urlCategory: this.categoria,
        };

        this.customerService
          .getCustomerPriceList(user.documentId, params)
          .subscribe({
            next: async (res) => {
              this.precios = res.data;
              this.precios = await Promise.all(
                this.precios.map((p) => {
                  if (p.price > p.commonPrice) p.price = p.commonPrice;
                  p.priceBruto = Math.round(p.price / (1 + this.IVA));
                  p.commonPriceBruto = Math.round(
                    p.commonPrice / (1 + this.IVA)
                  );
                  return { ...p };
                })
              );
              this.showLoading = false;
              this.loadingData = false;
              callback({
                recordsTotal: res.total,
                recordsFiltered: res.total,
                data: [],
              });
            },
            error: (err) => {
              console.log(err);
            },
          });
      },
    };
  }

  busquedaCategoria(event: any) {
    this.categoria = event;
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) =>
      dtInstance.draw()
    );
  }
}
