// Angular
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// Libs
import { ToastrService } from 'ngx-toastr';
// Models
import { IPaymentMethod } from '@core/models-v2/payment-method/payment-method.interface';
// Services
import { SessionService } from '@core/services-v2/session/session.service';
import { PaymentMethodOmniService } from '@core/services-v2/payment-method-omni.service';

@Component({
  selector: 'app-lista-pago',
  templateUrl: './lista-pago.component.html',
  styleUrls: ['./lista-pago.component.scss'],
})
export class ListaPagoComponent implements OnInit {
  paymentMethods: IPaymentMethod[] = [];
  activePaymentMethodCode: string | null = null;

  @Output() selectPaymentMethod: EventEmitter<IPaymentMethod> =
    new EventEmitter();

  constructor(
    private readonly toastr: ToastrService,
    private readonly sessionService: SessionService,
    private readonly paymentMethodOmniService: PaymentMethodOmniService
  ) {}

  ngOnInit(): void {
    const username = this.sessionService.getSession().username ?? '';
    this.paymentMethodOmniService.getPaymentMethods({ username }).subscribe({
      next: (data) => {
        this.paymentMethods = data;
        if (this.paymentMethods.length > 0)
          this.onSelectPaymentMethod(this.paymentMethods[0]);
      },
      error: (err) => {
        console.log(err);
        this.toastr.error('No se pudo cargar los métodos de pago');
      },
    });
  }

  /**
   * Seleccionar método de pago.
   * @param paymentMethod
   */
  onSelectPaymentMethod(paymentMethod: IPaymentMethod): void {
    this.activePaymentMethodCode = paymentMethod.code;
    this.selectPaymentMethod.emit(paymentMethod);
  }
}
