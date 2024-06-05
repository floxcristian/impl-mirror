import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { isPlatformBrowser } from '@angular/common';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { CustomerSaleService } from '@core/services-v2/customer-sale/customer-sale.service';

@Component({
  selector: 'app-page-orders-list',
  templateUrl: './page-orders-list.component.html',
  styleUrls: ['./page-orders-list.component.scss'],
})
export class PageOrdersListComponent implements OnInit {
  usuario: ISession;
  loadingData = true;
  rows: any[] = [];
  datatableElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  innerWidth: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly customerSaleService: CustomerSaleService
  ) {
    this.usuario = this.sessionService.getSession(); // this.root.getDataSesionUsuario();
    this.loadingData = false;
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  ngOnInit() {
    this.initializeTable();
  }

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  async initializeTable() {
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      serverSide: true,
      responsive: true,
      searching: true,
      order: [[3, 'desc']],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
        processing: 'Cargando Ordenes de ventas..',
      },
      ajax: (dataTablesParameters: any, callback: any) => {
        this.loadingData = true;
        let params = {
          page:
            Math.floor(
              dataTablesParameters.start / dataTablesParameters.length
            ) + 1,
          search: dataTablesParameters.search.value,
          limit: dataTablesParameters.length,
        };
        this.customerSaleService.getSales(params).subscribe((resp: any) => {
          this.loadingData = false;
          this.rows = resp.data;
          this.loadingData = false;
          callback({
            recordsTotal: resp.total,
            recordsFiltered: resp.total,
            data: [],
          });
        });
      },

      columns: [
        { data: 'ordenVenta', width: '15%' },
        { data: 'ordenCompra' },
        { data: 'documento', width: '15%' },
        { data: 'fecha' },
        { data: 'sucursal' },
        { data: 'vendedor' },
        { data: 'neto' },
        { data: 'iva' },
        { data: 'total' },
      ],
    };
  }
}
