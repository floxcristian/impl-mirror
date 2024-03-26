// Angular
import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
// Rxjs
import { Subject } from 'rxjs';
// Libs
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
// Env
import { environment } from '@env/environment';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
import { IConfig } from '@core/config/config.interface';
// Services
import { ClientsService } from '../../../../shared/services/clients.service';
import { RootService } from '../../../../shared/services/root.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { ConfigService } from '@core/config/config.service';
import { CustomerSaleService } from '@core/services-v2/customer-sale/customer-sale.service';
import { IFormattedPaymentButton } from './models/formatted-payment-button.model';
import {
  ICustomerSale,
  IDebtSales,
} from '@core/services-v2/customer-sale/models/debt-sale.interface';

@Component({
  selector: 'app-page-payment-portal',
  templateUrl: './page-payment-portal.component.html',
  styleUrls: ['./page-payment-portal.component.scss'],
})
export class PagePaymentPortalComponent implements OnInit {
  @ViewChild('modalPaymentMethods', { static: false })
  modalPaymentMethods!: TemplateRef<any>;

  modalPaymentMethodsRef!: BsModalRef;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  user!: ISession;
  customerDebt!: ICustomerSale[];
  loading: boolean = true;
  documentToPay: ICustomerSale[] = [];
  documentsSelected: any[] = [];
  total: number = 0;
  totalExpired: number = 0;
  totalDocuments: number = 0;
  totalToPay: number = 0;
  paymentBtns!: IFormattedPaymentButton[];
  debtSales!: IDebtSales;

  paymentSelected: string = '';
  loadingPayment: boolean = false;
  paymentMsgSuccess: boolean = false;
  innerWidth: any;
  config!: IConfig;

  constructor(
    private clientsService: ClientsService,
    private root: RootService,
    private modalService: BsModalService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
    private readonly customerSaleService: CustomerSaleService
  ) {
    this.config = this.configService.getConfig();
    this.paymentBtns = this.config.salesDebtPage.paymentButtons.map(
      (item) => ({ ...item, selected: false })
    );
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  ngOnInit(): void {
    this.user = this.sessionService.getSession();
    this.dtOptions = this.root.simpleDtOptions;
    this.getSalesDebt();
  }

  /**
   * Obtener deudas del cliente.
   */
  private getSalesDebt(): void {
    this.customerSaleService.getCustomerSalesDebt().subscribe({
      next: (res) => {
        this.debtSales = res;
        const overSales: ICustomerSale[] =
          this.debtSales.overdueCustomerSales.map((m: ICustomerSale) => {
            return { ...m, status: 'VENCIDA' };
          });
        const dueSales: ICustomerSale[] = this.debtSales.dueCustomerSales.map(
          (m: ICustomerSale) => {
            return { ...m, status: 'PENDIENTE' };
          }
        );
        this.customerDebt = [...overSales, ...dueSales];
        this.dtTrigger.next('');
        this.addCheckBoxs(this.customerDebt);
        this.calcTotalSelected();
        this.customerDebt.forEach((e: ICustomerSale) => {
          let date_string = e.dueDate;
          let diff = +new Date() - +new Date(date_string);
          e.days = Math.ceil(diff / (1000 * 3600 * 24));
        });
        this.loading = false;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  addCheckBoxs(docs: ICustomerSale[]) {
    docs.map((item: any) => {
      item.check = false;
    });
  }

  addCheck(item: ICustomerSale) {
    item.check = !item.check;
    this.calcTotalSelected();
  }

  // calcula el total de documentos seleccionados
  calcTotalSelected() {
    this.documentToPay = [];
    this.documentsSelected = [];
    this.total = 0;
    this.totalDocuments =
      this.debtSales.totalDueAmount + this.debtSales.totalOverdueAmount;
    this.totalToPay = 0;
    this.totalExpired = this.debtSales.totalOverdueAmount;

    for (const item of this.customerDebt) {
      // guarda la seleccionadas
      if (item.check) {
        const obj = {
          folio: item.invoiceNumber,
          monto: item.dueBalanceAmount,
        };
        this.documentToPay.push(item);
        this.documentsSelected.push(obj);

        this.total += item.dueBalanceAmount;
        this.totalToPay += item.dueBalanceAmount;
      }
    }
  }

  openModal() {
    this.modalPaymentMethodsRef = this.modalService.show(
      this.modalPaymentMethods
    );
  }

  setPaymentMethod(item: any) {
    this.paymentBtns.map((i) => {
      i.selected = false;
    });
    item.selected = true;
    this.paymentSelected = item.id;
  }

  // cuando es pago seleccionado
  openModalSelectedItem() {
    this.calcTotalSelected();
    this.openModal();
  }

  // cuando es pago seleccionado
  openModalTotalExpired() {
    this.totalToPay = 0;
    this.totalExpired = 0;
    this.documentToPay = [];

    for (const item of this.customerDebt) {
      if (item.status === 'VENCIDA') {
        this.documentToPay.push(item);
        this.totalToPay += item.dueBalanceAmount;
        this.totalExpired += item.dueBalanceAmount;
      }
    }
    this.openModal();
  }

  // cuando es pago seleccionado
  openModalTotalDocuments() {
    this.totalToPay = 0;
    this.totalDocuments = 0;
    this.documentToPay = [];
    for (const item of this.customerDebt) {
      this.documentToPay.push(item);
      this.totalToPay += item.dueBalanceAmount;
      this.totalDocuments += item.dueBalanceAmount;
    }
    this.openModal();
  }

  generatePayment() {
    const data = {
      payment_method: this.paymentSelected,
      item: this.documentToPay,
      order_total: this.totalToPay,
      client_email: this.user.email,
      client_code: this.user.documentId,
      client_name: this.user.company,
    };

    this.loadingPayment = true;
    this.clientsService.generatePayment(data).subscribe(
      (r: any) => {
        this.loadingPayment = false;

        if (r.error) {
          this.toastr.error(r.msg, 'Error');
          this.paymentMsgSuccess = false;
          return;
        }

        // si el pago se ingreso redirijimos
        this.paymentMsgSuccess = true;
        this.redirectPaymentImplementos(r.data.order_id);
        this.resetPayment();
      },
      (err) => {
        this.toastr.error('Error de comunicación con el servidor');
        this.paymentMsgSuccess = false;
      }
    );
  }

  redirectPaymentImplementos(orderId: any) {
    const url = `${environment.urlPagosImplementos}metodo_pago/resumen.php?order_id=${orderId}`;
    window.open(url);
  }

  resetPayment() {
    this.calcTotalSelected();
    this.paymentMsgSuccess = true;
    this.modalPaymentMethodsRef.hide();

    for (const item of this.customerDebt) {
      item.check = false;
    }
  }

  closeAlert() {
    this.paymentMsgSuccess = false;
  }
  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }
}
