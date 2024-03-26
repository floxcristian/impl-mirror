import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from '@core/services-v2/notification.service';
import { DocumentValidator } from '@core/validators/document-form.validator';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';

@Component({
  selector: 'app-contact-us',
  templateUrl: './page-contact-us.component.html',
  styleUrls: ['./page-contact-us.component.scss'],
})
export class PageContactUsComponent {
  formContacto: FormGroup;
  asuntos = ['Cotización', 'Información'];
  config: IConfig;
  constructor(
    private formGroup: FormBuilder,
    private toastr: ToastrService,
    //ServicesV2
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
    this.formContacto = this.formGroup.group({
      nombre: new FormControl(null, Validators.required),
      para: new FormControl(null, [
        Validators.required,
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'),
      ]),
      asunto: new FormControl(null, Validators.required),
      rut: [null, DocumentValidator.isValidDocumentId],
      telefono: new FormControl(null),
      html: new FormControl(null, Validators.required),
    });
  }

  async enviarCorreo() {
    let { nombre, para, asunto, html, rut, telefono } =
      this.formContacto.value;

    let rutAux = rut;
    let existe = rut ? rutAux.indexOf('-') : null;
    if (existe == -1) {
      let dv = rutAux.substring(rutAux.length - 1, rutAux.length);
      rutAux = rutAux.substring(0, rutAux.length - 1);
      rut = `${rutAux}-${dv}`;
    }

    let params = {
      documentId: rut,
      phone: telefono,
      name: nombre,
      email: para,
      subject: asunto,
      text: html,
    };

    this.notificationService.sendContactFormEmail(params).subscribe({
      next: (res) => {
        this.toastr.success(`Correo Enviado correctamente`);
        this.formContacto.reset();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(`No se logro enviar el correo`);
      },
    });
  }

  tipoAsunto(event: any) {
    let asunto = this.formContacto.get('asunto')?.value;
    if (asunto == 'Cotización') {
      this.formContacto.get('rut')?.reset();

      this.formContacto.get('rut')?.setValidators([Validators.required]);
      this.formContacto.get('telefono')?.reset();
      this.formContacto
        .get('telefono')
        ?.setValidators([
          Validators.required,
          Validators.pattern('[1-9][0-9]{0,9}'),
          Validators.minLength(8),
          Validators.maxLength(8),
        ]);
    } else {
      this.formContacto.get('rut')?.clearValidators();
      this.formContacto.get('telefono')?.clearValidators();
    }
    this.formContacto.get('rut')?.updateValueAndValidity();
    this.formContacto.get('telefono')?.updateValueAndValidity();
  }
}
