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
        (click)="closeDialog(false)"
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

  closeDialog(isVehicleCreated: boolean): void {
    this.ref.close({ isVehicleCreated });
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
    this.customerVehicleService
      .createCustomerVehicle(this.config.data.documentId, {
        manufactureYear: this.formatYear(manufactureYear),
        codeChasis,
        brand,
        model,
        patent,
        typeImp: selectedMotor.tipo || null,
        codeSii: selectedMotor.codigoSII || null,
        codeMotor: selectedMotor.codigo || null,
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Vehículo creado',
            detail: 'El vehículo se ha creado correctamente.',
          });
          this.closeDialog(true);
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Vehículo no creado',
            detail: 'Ha ocurrido un error al crear el vehículo.',
          });
        },
      });
  }
}
