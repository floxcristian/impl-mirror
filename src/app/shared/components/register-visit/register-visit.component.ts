// Angular
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// Libs
import { ToastrService } from 'ngx-toastr';
// Rxjs
import { firstValueFrom } from 'rxjs';
// Models
import { IEcommerceUser } from '@core/models-v2/auth/user.interface';
import { IGuest } from '@core/models-v2/storage/guest.interface';
import { IConfig } from '@core/config/config.interface';
// Services
import { SessionStorageService } from '@core/storage/session-storage.service';
import { AuthApiService } from '@core/services-v2/auth/auth.service';
import { CartService } from '@core/services-v2/cart.service';
import { ConfigService } from '@core/config/config.service';
// Validators
import { DocumentValidator } from '@core/validators/document-form.validator';
// Components
import { AngularEmailAutocompleteComponent } from '../angular-email-autocomplete/angular-email-autocomplete.component';

@Component({
  selector: 'app-register-visit',
  templateUrl: './register-visit.component.html',
  styleUrls: ['./register-visit.component.scss'],
})
export class RegisterVisitComponent implements OnInit, OnChanges {
  @ViewChild('emailValidate', { static: true })
  email!: AngularEmailAutocompleteComponent;
  @Output() returnLoginEvent: EventEmitter<any> = new EventEmitter();
  @Input() innerWidth!: number;
  @Input() invitado!: IEcommerceUser | IGuest;

  guestForm!: FormGroup;
  loadingForm = false;
  config: IConfig;

  selectedPhoneCode: string;
  phoneLength: number;

  constructor(
    private readonly toastr: ToastrService,
    private readonly fb: FormBuilder,
    private readonly cartService: CartService,
    private readonly sessionStorage: SessionStorageService,
    private readonly authService: AuthApiService,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
    this.selectedPhoneCode = this.config.phoneCodes.mobile.code;
    this.phoneLength = this.config.phoneCodes.mobile.lengthRule;
    this.buildForm();
  }

  ngOnChanges(): void {
    console.log('ngOnChanges====');
    console.log('invitado: ', this.invitado);
    if (!this.invitado) return;

    if (!this.invitado.phone.startsWith(this.config.phoneCodes.mobile.code)) {
      this.selectedPhoneCode = this.config.phoneCodes.landline.code;
      this.phoneLength = this.config.phoneCodes.landline.lengthRule;
    }

    this.guestForm.setValue({
      rut: this.invitado.documentId || '',
      nombre: this.invitado.firstName,
      apellido: this.invitado.lastName,
      telefono: this.invitado?.phone?.slice(-this.phoneLength),
      //email: this.invitado.email,
    });
    this.email.inputValue = this.invitado.email;
  }

  ngOnInit(): void {}

  /**
   * Construir formulario de visita.
   */
  private buildForm(): void {
    this.guestForm = this.fb.group({
      rut: [
        '',
        [
          Validators.required,
          Validators.maxLength(this.config.document.documentLength),
          DocumentValidator.isValidDocumentId,
        ],
      ],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', [Validators.required]],
      //email: ['', [Validators.required, Validators.email]],
    });
  }

  async registerUser(inputEmail: AngularEmailAutocompleteComponent) {
    const email = inputEmail.inputValue;
    const dataSave = { ...this.guestForm.value };
    try {
      const resp = await firstValueFrom(this.authService.checkEmail(email));
      if (!resp.exists || (resp.exists && resp.userType === 2)) {
        this.loadingForm = true;

        dataSave.email = email;
        dataSave.tipoCliente = 1;
        dataSave.telefono = this.selectedPhoneCode + dataSave.telefono;
        const session = this.sessionStorage.get();

        const guestUser = this.setUsuario(dataSave);

        if (session) {
          const guest: IGuest = {
            documentId: guestUser.documentId,
            firstName: guestUser.firstName,
            lastName: guestUser.lastName,
            phone: guestUser.phone,
            email,
            street: '',
            number: '',
            commune: '',
          };
          await firstValueFrom(
            this.cartService.setGuestUser(session.email, guest)
          );
        }

        this.returnLoginEvent.emit(guestUser);
      } else if(resp.exists && resp.userType != 2) {
        this.toastr.warning(
          'Hemos detectado que el email ingresado esta registrado, por favor inicie sesión para continuar.'
        );
      }
    } catch (e) {
      console.error(e);
      this.toastr.error('Ocurrió un error intentado validar correo');
    }
  }

  private setUsuario(formulario: any): IEcommerceUser {
    return {
      active: true,
      avatar: '',
      documentId: formulario.rut,
      company: formulario.nombre + ' ' + formulario.apellido,
      country: 'CL',
      email: String(formulario.email).toLowerCase(),
      firstName: formulario.nombre,
      lastName: formulario.apellido,
      loginTemp: true,
      phone: formulario.telefono,
      userRole: 'temp',
    };
  }

  /**
   * Seleccionar el código de área del teléfono y habilitar validaciones de formulario según la selección.
   * @param phoneCode
   */
  selectPhoneCode(phoneCode: string): void {
    this.selectedPhoneCode = phoneCode;
    this.phoneLength =
      this.selectedPhoneCode === this.config.phoneCodes.mobile.code
        ? this.config.phoneCodes.mobile.lengthRule
        : this.config.phoneCodes.landline.lengthRule;

    this.guestForm.controls['telefono'].setValidators([
      Validators.required,
      Validators.minLength(this.phoneLength),
      Validators.maxLength(this.phoneLength),
    ]);
    this.guestForm.get('telefono')?.updateValueAndValidity();
  }
}
