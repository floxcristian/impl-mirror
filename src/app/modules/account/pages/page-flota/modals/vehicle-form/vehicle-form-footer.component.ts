import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-vehicle-form-footer',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div
      class="flex gap-3 justify-content-end border-top-1 surface-border pt-5"
    >
      <button pButton pRipple label="Cancelar" class="p-button-text"></button>
      <p-button
        type="button"
        label="Actualizar"
        (click)="
          closeDialog({ buttonType: '', summary: 'No Product Selected' })
        "
      ></p-button>
    </div>
  `,
})
export class VehicleFormFooter {
  constructor(public ref: DynamicDialogRef) {}

  closeDialog(data: any) {
    this.ref.close(data);
  }
}
