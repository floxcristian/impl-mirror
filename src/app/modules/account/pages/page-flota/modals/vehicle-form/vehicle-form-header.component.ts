import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-vehicle-form-header',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="flex flex-column gap-2">
      <h1 class="m-0 text-900 font-semibold text-xl line-height-3">
        Actualizar vehículo
      </h1>
      <span class="text-600 text-base"
        >Quis enim lobortis scelerisque fermentum dui faucibus in ornare
        quam.</span
      >
    </div>
  `,
})
export class VehicleFormHeader {
  constructor(public ref: DynamicDialogRef) {}

  closeDialog(data: any) {
    this.ref.close(data);
  }
}
