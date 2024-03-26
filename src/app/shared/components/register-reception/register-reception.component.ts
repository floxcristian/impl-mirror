// Angular
import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
// Models
import { IReceive } from '@core/models-v2/storage/receive.interface';
import { IConfig } from '@core/config/config.interface';
// Services
import { DocumentValidator } from '@core/validators/document-form.validator';
import { ConfigService } from '@core/config/config.service';

@Component({
  selector: 'app-register-reception',
  templateUrl: './register-reception.component.html',
  styleUrls: ['./register-reception.component.scss'],
})
export class RegisterReceptionComponent {
  @Output() returnReceptionEvent: EventEmitter<IReceive> = new EventEmitter();
  @Input() entrega!: string;

  public formRecibe!: FormGroup;
  selectedPhoneCode: string;
  slices = 8;
  config: IConfig;
  maxPhone: number = 8;
  cantMaxRut: number = 10;

  constructor(
    private readonly fb: FormBuilder,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
    this.selectedPhoneCode = this.config.phoneCodes.mobile.code;
    this.buildForm();
  }

  private buildForm(): void {
    this.formRecibe = this.fb.group({
      firstName: [, Validators.required],
      lastName: [, Validators.required],
      phone: [, [Validators.required]],
      documentId: [
        null,
        [Validators.required, DocumentValidator.isValidDocumentId],
      ],
    });

    this.Select_fono(this.selectedPhoneCode);
  }

  async enviarReceptor() {
    const dataSave = { ...this.formRecibe.value };
    let usuarioVisita: IReceive;
    dataSave.telefono = this.selectedPhoneCode + dataSave.phone;
    usuarioVisita = await this.setUsuario(dataSave);

    this.returnReceptionEvent.emit(usuarioVisita);
  }

  async setUsuario(formulario: IReceive) {
    if (formulario.phone.slice(0, 4) !== this.config.phoneCodes.mobile.code) {
      this.slices = 9;
      this.selectedPhoneCode = this.config.phoneCodes.landline.code;
    }

    let usuario: IReceive = {
      company: formulario.firstName + ' ' + formulario.lastName,
      firstName: formulario.firstName,
      lastName: formulario.lastName,
      phone: formulario.phone.slice(-this.slices),
      documentId: formulario.documentId,
    };
    return await usuario;
  }

  Select_fono(phoneCode: string): void {
    this.selectedPhoneCode = phoneCode;

    if (this.selectedPhoneCode === this.config.phoneCodes.mobile.code) {
      this.formRecibe.controls['phone'].setValidators([
        Validators.required,
        Validators.minLength(this.config.phoneCodes.mobile.lengthRule),
        Validators.maxLength(this.config.phoneCodes.mobile.lengthRule),
      ]);
      this.maxPhone = this.config.phoneCodes.mobile.lengthRule;
    } else {
      this.formRecibe.controls['phone'].setValidators([
        Validators.required,
        Validators.minLength(this.config.phoneCodes.landline.lengthRule),
        Validators.maxLength(this.config.phoneCodes.landline.lengthRule),
      ]);
      this.maxPhone = this.config.phoneCodes.landline.lengthRule;
    }

    this.formRecibe.get('phone')?.updateValueAndValidity();
  }
}
