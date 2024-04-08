import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import {
  DynamicDialogConfig,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [ButtonModule, InputTextModule, DynamicDialogModule],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
})
export class VehicleFormComponent implements OnInit {
  vehicle: any;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit() {
    this.vehicle = this.config.data.vehicle;
  }
}
