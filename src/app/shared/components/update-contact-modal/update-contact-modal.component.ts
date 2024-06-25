// Angular
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// lIbs
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
// Models
import { ICustomerContact } from '@core/models-v2/customer/customer.interface';
import { IContactPosition } from '@core/models-v2/customer/contact-position.interface';
import { IError } from '@core/models-v2/error/error.interface';
import { IConfig } from '@core/config/config.interface';
// Services
import { isVacio } from '../../utils/utilidades';
import { AngularEmailAutocompleteComponent } from '../angular-email-autocomplete/angular-email-autocomplete.component';
import { SessionService } from '@core/services-v2/session/session.service';
import { CustomerContactService } from '@core/services-v2/customer-contact.service';
import { ConfigService } from '@core/config/config.service';
import { DocumentValidator } from '@core/validators/document-form.validator';

@Component({
  selector: 'app-update-contact-modal',
  templateUrl: './update-contact-modal.component.html',
  styleUrls: ['./update-contact-modal.component.scss'],
})
export class UpdateContactModalComponent implements OnInit {
  @Input() modalUpdateContactRef!: BsModalRef;
  @Input() contacto!: ICustomerContact;
  @Output() respuesta = new EventEmitter<boolean>();
  @ViewChild('emailValidate', { static: true })
  email!: AngularEmailAutocompleteComponent;

  formContacto!: FormGroup;
  cargos: IContactPosition[] = [];
  selectedPhoneCode: string;
  loadingForm = false;
  config!: IConfig;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private readonly sessionService: SessionService,
    private readonly customerContactService: CustomerContactService,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
    this.selectedPhoneCode = this.config.phoneCodes.mobile.code;
  }

  ngOnInit(): void {
    this.getCargos();
    this.formDefault();
  }

  formDefault(): void {
    let largo = 8;
    if (!this.contacto.phone) {
      this.contacto.phone = '';
      this.selectedPhoneCode = this.config.phoneCodes.mobile.code;
    } else {
      if (
        this.contacto.phone.slice(0, 4) === this.config.phoneCodes.mobile.code
      ) {
        largo = 8;
        this.selectedPhoneCode = this.config.phoneCodes.mobile.code;
      } else {
        largo = 9;
        this.selectedPhoneCode = this.config.phoneCodes.landline.code;
      }
    }

    this.formContacto = this.fb.group({
      contactRut: [
        this.contacto.documentId,
        [Validators.required, DocumentValidator.isValidDocumentId],
      ],
      nombre: [this.contacto.name, Validators.required],
      apellido: [this.contacto.lastName, Validators.required],
      telefono: [
        this.contacto.phone === '0' ? '' : this.contacto.phone.slice(-largo),
      ],
      cargo: [, Validators.required],
    });
    this.email.inputValue =
      this.contacto.email === '0' ? '' : this.contacto.email || '';
    this.email.isValidEmail = this.contacto.email === '0' ? false : true;
    if (this.contacto.documentId && this.contacto.documentId !== '') {
      this.formContacto.get('contactRut')?.disable();
    }
    this.Select_fono(this.selectedPhoneCode);
  }

  getCargos() {
    this.customerContactService.getPositions().subscribe((response) => {
      this.cargos = response;
      this.formContacto.controls['cargo'].setValue(this.contacto.position);
    });
  }

  actualizarContacto(email: any) {
    this.loadingForm = true;
    const data = { ...this.formContacto.value };
    const emailValidado = email.inputValue;
    const usuario = this.sessionService.getSession();

    if (data.telefono !== '' || emailValidado !== '') {
      if (!isVacio(usuario)) {
        const request: any = {
          customerDocumentId: usuario.documentId,
          documentId: data.contactRut,
          contactId: this.contacto.id,
          name: data.nombre,
          lastName: data.apellido,
          email: emailValidado,
          phone: this.selectedPhoneCode + data.telefono,
          position: data.cargo,
        };

        if (this.formContacto.get('contactRut')?.status !== 'DISABLED') {
          request.documentId = data.contactRut;
        } else {
          request.documentId = this.contacto.documentId;
        }

        this.customerContactService.updateContact(request).subscribe({
          next: (res) => {
            this.toastr.success('Contacto actualizado correctamente.');
            this.respuesta.emit(true);
            this.modalUpdateContactRef.hide();
            this.loadingForm = false;
          },
          error: (err: IError) => {
            this.toastr.error(err.message);
            this.respuesta.emit(false);
            this.modalUpdateContactRef.hide();
            this.loadingForm = false;
          },
        });
      } else {
        this.toastr.error(
          'Ocurrió un error al obtener los datos de su sesión.'
        );
        this.loadingForm = false;
      }
    } else {
      this.toastr.error('Debe ingresar al menos un correo o un celular.');
      this.loadingForm = false;
    }
  }

  Select_fono(tipo: any) {
    this.selectedPhoneCode = tipo;

    if (this.selectedPhoneCode === this.config.phoneCodes.mobile.code)
      this.formContacto.controls['telefono'].setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
      ]);
    else
      this.formContacto.controls['telefono'].setValidators([
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
      ]);

    this.formContacto.get('telefono')?.updateValueAndValidity();
  }
}
