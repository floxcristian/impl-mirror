import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment';
import { DataTablesResponse } from '../../../../shared/interfaces/data-table';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { CartService } from '@core/services-v2/cart.service';
import { IOrderDetail } from '@core/models-v2/cart/order-details.interface';

@Component({
  selector: 'app-page-pending-orders',
  templateUrl: './page-pending-orders.component.html',
  styleUrls: ['./page-pending-orders.component.scss'],
})
export class PagePendingOrdersComponent implements OnInit {
  dtOptions: DataTables.Settings = {};
  usuario!: ISession;
  orders!: IOrderDetail[];
  viewActive = 'list';
  orderId: string = '';
  title: string = '';

  constructor(
    private http: HttpClient,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.usuario = this.sessionService.getSession();
    if (!this.usuario.hasOwnProperty('username'))
      this.usuario.username = this.usuario.email;
  }

  loadData() {
    const columns = [
      'updatedAt',
      'status',
      'salesId',
      'total',
      'purchaseOrder.number',
      'purchaseOrder.amount',
      // 'purchaseOrder.costCenter',
      'user',
    ];
    this.dtOptions = {
      language: {
        // url: 'assets/js/datatable/Spanish.json'
        url: '//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json',
      },
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      order: [[0, 'desc']],
      columnDefs: [{ orderable: false, targets: 7 }],
      ajax: (dataTablesParameters: any, callback) => {
        let page_actual =
          dataTablesParameters.start === 0
            ? 1
            : dataTablesParameters.start / dataTablesParameters.length + 1;
        let sort_column = columns[dataTablesParameters.order[0].column];
        let sort_asc_desc =
          dataTablesParameters.order[0].dir === 'asc' ? 1 : -1;
        let sort_real = sort_column + '|' + sort_asc_desc;
        let params2 = {
          user: this.usuario.username || '',
          salesDocumentType: 2,
          search: dataTablesParameters.search.value,
          statuses: ['finalized', 'generated'],
          page: page_actual,
          limit: dataTablesParameters.length,
          sort: sort_real,
        };

        this.cartService.getOrderDetails(params2).subscribe({
          next: (res) => {
            this.orders = res.data;
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

  viewOrderDetail(item: any) {
    this.viewActive = 'detail';
    this.orderId = item.id;
    this.title = item.salesId;
  }

  backToList() {
    this.viewActive = 'list';
  }
}
