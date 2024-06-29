import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-camionero24-ok-modal',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './camionero24-ok-modal.component.html',
  styleUrl: './camionero24-ok-modal.component.scss',
})
export class Camionero24OkModalComponent {
  constructor(public readonly ModalRef: BsModalRef) {}
}
