import { Component } from '@angular/core';
import { CustomerVehicleService } from '@core/services-v2/customer-vehicle/customer-vehicle.service';
import { StringUtilService } from '@core/utils-v2/string-util.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-vehicle-form-footer',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div
      class="flex gap-3 justify-content-end border-top-1 surface-border pt-5"
    >
      <button
        pButton
        pRipple
        type="button"
        label="Cancelar"
        class="p-button-text"
        (click)="closeDialog()"
      ></button>
      <p-button
        type="button"
        [label]="action"
        [disabled]="
          !config.data.vehicleForm?.valid || !config.data.selectedMotor
        "
        (click)="createVehicle(config.data.vehicleForm.value)"
      ></p-button>
    </div>
  `,
})
export class VehicleFormFooter {
  action: string;

  constructor(
    private readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig,
    private readonly customerVehicleService: CustomerVehicleService,
    private readonly messageService: MessageService
  ) {
    this.action = StringUtilService.capitalizeFirstLetter(
      this.config.data.action
    );
  }

  closeDialog(/*confirm: boolean*/): void {
    this.ref.close({
      confirm,
      /*newVehicle: confirm
        ? {
            ...this.config.data.vehicle,
            manufactureYear: this.formatYear(
              this.config.data.vehicle.manufactureYear
            ),
          }
        : null,*/
    });
  }

  private formatYear(date: Date | number): number {
    return typeof date === 'number' ? date : date.getFullYear();
  }

  createVehicle({
    brand,
    codeChasis,
    model,
    patent,
    manufactureYear,
  }: any): void {
    const selectedMotor = this.config.data.selectedMotor;
    console.log('selectedMotor: ', this.config.data.selectedMotor);
    //console.log('createVehicle: ', vehicle);
    this.customerVehicleService
      .createCustomerVehicle(this.config.data.documentId, {
        manufactureYear: this.formatYear(manufactureYear),
        codeChasis,
        brand,
        model,
        patent,
        typeVehicle: '',
        //customer: '',
        typeImp: selectedMotor.tipo || null,
        detail: '',
        codeSii: selectedMotor.codigoSII || null,
        codeMotor: selectedMotor.codigo || null,
      })
      .subscribe({
        next: (res) => {
          this.closeDialog();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'danger',
            summary: 'Vehículo no creado',
            detail: 'Ha ocurrido un error al crear el vehículo.',
          });
        },
      });
  }
}
