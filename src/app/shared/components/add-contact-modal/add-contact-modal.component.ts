// Angular
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Libs
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
// Models
import { IError } from '@core/models-v2/error/error.interface';
import { ISession } from '@core/models-v2/auth/session.interface';
import { IContactPosition } from '@core/models-v2/customer/contact-position.interface';
// Services
import { CustomerContactService } from '@core/services-v2/customer-contact.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { DocumentValidator } from '@core/validators/document-form.validator';
import { IConfig } from '@core/config/config.interface';
import { ConfigService } from '@core/config/config.service';

@Component({
  selector: 'app-add-contact-modal',
  templateUrl: './add-contact-modal.component.html',
  styleUrls: ['./add-contact-modal.component.scss'],
})
export class AddContactModalComponent implements OnInit {
  @Input() modalAddContactRef!: BsModalRef;
  @Output() respuesta = new EventEmitter<boolean>();

  formContacto!: FormGroup;
  cargos: IContactPosition[] = [];
  selectedPhoneCode: string;
  loadingForm = false;
  usuario!: ISession;
  config: IConfig;

  constructor(
    public ModalRef: BsModalRef,
    private fb: FormBuilder,
    private toastr: ToastrService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly customerContactService: CustomerContactService,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
    this.selectedPhoneCode = this.config.phoneCodes.mobile.code;
  }

  ngOnInit(): void {
    this.usuario = this.sessionService.getSession();
    this.getCargos();
    this.formDefault();
  }

  formDefault() {
    this.formContacto = this.fb.group({
      contactRut: [
        ,
        [Validators.required, DocumentValidator.isValidDocumentId],
      ],
      nombre: [, Validators.required],
      apellido: [, Validators.required],
      telefono: [, [Validators.required]],
      cargo: [, Validators.required],
    });
    this.Select_fono(this.selectedPhoneCode);
  }

  getCargos() {
    this.customerContactService.getPositions().subscribe((response) => {
      this.cargos = response;
    });
  }

  registrarContacto(email: any) {
    this.loadingForm = true;
    const data: any = { ...this.formContacto.value };
    const emailValidado = email.inputValue;

    const request: any = {
      customerDocumentId: this.usuario.documentId,
      documentId: data.contactRut,
      name: data.nombre,
      lastName: data.apellido,
      email: emailValidado,
      phone: this.selectedPhoneCode + data.telefono,
      position: data.cargo,
    };

    this.customerContactService.createContact(request).subscribe({
      next: (_) => {
        this.toastr.success('Contacto creado correctamente.');
        this.respuesta.emit(true);
        this.modalAddContactRef.hide();
        this.loadingForm = false;
      },
      error: (err: IError) => {
        this.toastr.error(err.message);
        this.respuesta.emit(false);
        this.modalAddContactRef.hide();
        this.loadingForm = false;
      },
    });
  }

  Select_fono(tipo: any) {
    this.selectedPhoneCode = tipo;
    if (this.selectedPhoneCode === this.config.phoneCodes.mobile.code) {
      this.formContacto.controls['telefono'].setValidators([
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(8),
      ]);
    } else {
      this.formContacto.controls['telefono'].setValidators([
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
      ]);
    }
    this.formContacto.get('telefono')?.updateValueAndValidity();
  }
}
