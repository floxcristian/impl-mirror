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
        (click)="createVehicle(config.data.vehicleForm)"
      ></p-button>
    </div>
  `,
})
export class VehicleFormFooter {
  action: string;

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly customerVehicleService: CustomerVehicleService,
    private readonly messageService: MessageService,
    public readonly config: DynamicDialogConfig
  ) {
    this.action = StringUtilService.capitalizeFirstLetter(
      this.config.data.action
    );
  }

  /**
   * Cerrar modal.
   * @param isVehicleCreated indica si se creo un vehículo.
   */
  closeDialog(isVehicleCreated: boolean): void {
    this.ref.close(isVehicleCreated);
  }

  /**
   * Crear vehículo.
   * @param vehicleForm
   */
  createVehicle(vehicleForm: any): void {
    const selectedMotor = this.config.data.selectedMotor;
    this.customerVehicleService
      .createCustomerVehicle(this.config.data.documentId, {
        manufactureYear: vehicleForm.get('manufactureYear').value,
        codeChasis: vehicleForm.get('codeChasis').value,
        brand: vehicleForm.get('brand').value,
        model: vehicleForm.get('model').value,
        patent: vehicleForm.get('patent').value,
        typeImp: selectedMotor.tipo || null,
        codeSii: selectedMotor.codigoSII || null,
        codeMotor: selectedMotor.codigo || null,
        detail: selectedMotor.detalle || null,
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
