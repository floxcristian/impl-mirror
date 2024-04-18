import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { StringUtilService } from '@core/utils-v2/string-util.service';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-vehicle-form-header',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="flex flex-column gap-2">
      <h1 class="m-0 text-900 font-semibold text-xl line-height-3">
        {{ action }} vehículo
      </h1>
      <span class="text-600 text-base"
        >Complete los campos del formulario para {{ action | lowercase }} el
        vehículo.</span
      >
    </div>
  `,
})
export class VehicleFormHeader {
  action: string;

  constructor(
    public readonly ref: DynamicDialogRef,
    private readonly config: DynamicDialogConfig
  ) {
    this.action = StringUtilService.capitalizeFirstLetter(
      this.config.data.action
    );
  }
}
