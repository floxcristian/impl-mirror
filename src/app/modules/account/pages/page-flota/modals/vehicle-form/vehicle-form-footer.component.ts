import { Component } from '@angular/core';
import { StringUtilService } from '@core/utils-v2/string-util.service';
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
        (click)="closeDialog(true)"
      ></p-button>
    </div>
  `,
})
export class VehicleFormFooter {
  action: string;

  constructor(
    private readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) {
    this.action = StringUtilService.capitalizeFirstLetter(
      this.config.data.action
    );
  }

  closeDialog(confirm: boolean): void {
    const manufactureYear = this.formatYear(
      this.config.data.vehicle.manufactureYear
    );
    this.ref.close({
      confirm,
      newVehicle: { ...this.config.data.vehicle, manufactureYear },
    });
  }

  private formatYear(date: Date | number): number {
    return typeof date === 'number' ? date : date.getFullYear();
  }
}
