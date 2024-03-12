import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { CartService } from '@core/services-v2/cart.service';
import { IOrderDetail } from '@core/models-v2/cart/order-details.interface';
import { PaymentMethodPurchaseOrderRequestService } from '@core/services-v2/payment-method-purchase-order-request.service';

@Component({
  selector: 'app-purchase-request',
  templateUrl: './purchase-request.component.html',
  styleUrls: ['./purchase-request.component.scss'],
})
export class PurchaseRequestComponent implements OnInit {
  @ViewChild('modalApprove', { static: false })
  modalApprove!: TemplateRef<any>;
  modalApproveRef!: BsModalRef;

  @ViewChild('modalRefuse', { static: false }) modalRefuse!: TemplateRef<any>;
  modalRefuseRef!: BsModalRef;

  dtOptions: DataTables.Settings = {};
  usuario!: ISession;
  orders!: IOrderDetail[];
  title:string = '';
  viewActive = 'list';
  orderId: string = '';
  order!: IOrderDetail;
  loadingPage:boolean = false;
  obsRefuse:string = '';

  constructor(
    private router: Router,
    private modalService: BsModalService,
    private toast: ToastrService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly cartService: CartService,
    private readonly paymentPurchaseOrderService: PaymentMethodPurchaseOrderRequestService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.usuario = this.sessionService.getSession();
    if (!this.usuario.hasOwnProperty('username'))
      this.usuario.username = this.usuario.email;
    this.title = 'Solicitudes de compra pendientes de aprobación';
  }

  loadData() {
    const columns = [
      'updatedAt',
      'status',
      'total',
      'purchaseOrder.number',
      'purchaseOrder.amount',
      'user',
    ];
    this.dtOptions = {
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json',
      },
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      columnDefs: [{ orderable: false, targets: 6 }],
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
          statuses: ['pending', 'rejected'],
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

  viewOrderDetail(item: IOrderDetail) {
    this.viewActive = 'detail';
    this.orderId = item.id;
    this.order = item;
  }

  backToList() {
    this.viewActive = 'list';
  }

  approveOrder(item: any) {
    this.modalApproveRef = this.modalService.show(this.modalApprove);
    this.order = item;
  }

  confirmApproveOrder() {
    this.loadingPage = true;
    this.modalApproveRef.hide();
    let params = {
      shoppingCartId: this.order.id,
    };
    this.paymentPurchaseOrderService.approve(params).subscribe({
      next: (res) => {
        this.loadingPage = false;
        let params = {
          site_id: 'OC',
          external_reference: this.order.id,
          status: 'approved',
        };

        this.cartService.load();
        this.router.navigate(['/', 'carro-compra', 'gracias-por-tu-compra'], {
          queryParams: { ...params },
        });
      },
      error: (err) => {
        console.log(err);
        this.toast.error('Ha ocurrido  al generar la orden de venta');
      },
    });
  }

  refuseOrder(item: any) {
    this.modalRefuseRef = this.modalService.show(this.modalRefuse);
    this.order = item;
  }

  confirmRefuseOrder() {
    this.loadingPage = true;
    this.cartService
      .updateStatusShoppingCart(this.order.id, 'rejected', this.obsRefuse)
      .subscribe({
        next: (res) => {
          this.loadingPage = false;
          this.toast.success('Solitud rechazada correctamente');
          this.modalRefuseRef.hide();
          this.obsRefuse = ''
          this.loadData();
        },
        error: (err) => {
          this.toast.error(
            'Ha ocurrido un error al rechazar la orden de venta'
          );
        },
      });
  }
}
