import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import {
  DynamicDialogConfig,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    ButtonModule,
    InputTextModule,
    DynamicDialogModule,
    ReactiveFormsModule,
    CalendarModule,
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
})
export class VehicleFormComponent implements OnInit {
  vehicleForm!: FormGroup;
  maxDate = new Date();
  minDate = new Date(1997, 1);

  constructor(
    private readonly fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    console.log('vehicle: ', this.config.data.vehicle);
    this.buildForm(this.config.data.vehicle);
  }

  private buildForm(vehicle: any) {
    if (vehicle) {
      this.vehicleForm = this.fb.group({
        _id: [vehicle._id],
        codeMotor: [vehicle.codeMotor],
        codeSii: [vehicle.codeSii],
        patent: [vehicle.patent, Validators.required],
        codeChasis: [vehicle.codeChasis, Validators.required],
        typeImp: [vehicle.typeImp, Validators.required],
        brand: [vehicle.brand, Validators.required],
        model: [vehicle.model, Validators.required],
        manufactureYear: [
          new Date(vehicle.manufactureYear, 1),
          Validators.required,
        ],
      });
    } else {
      this.vehicleForm = this.fb.group({
        _id: [null],
        codeMotor: [null],
        codeSii: [null],
        patent: [null, Validators.required],
        codeChasis: [null, Validators.required],
        typeImp: [null, Validators.required],
        brand: [null, Validators.required],
        model: [null, Validators.required],
        manufactureYear: [null, Validators.required],
      });
    }
    this.onFormChange();
  }

  onFormChange(): void {
    this.vehicleForm.valueChanges.subscribe({
      next: (vehicle) => (this.config.data.vehicle = vehicle),
    });
  }
}
