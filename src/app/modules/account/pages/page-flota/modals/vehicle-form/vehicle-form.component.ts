import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomerVehicleService } from '@core/services-v2/customer-vehicle/customer-vehicle.service';
import { VehicleType } from '@core/services-v2/vehicle/vehicle-type.enum';
import { VehicleService } from '@core/services-v2/vehicle/vehicle.service';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import {
  DynamicDialogConfig,
  DynamicDialogModule,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';

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
    public config: DynamicDialogConfig,
    private readonly vehicleService: VehicleService
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
        typeImp: [{ value: null, disabled: true }, Validators.required],
        brand: [{ value: null, disabled: true }, Validators.required],
        model: [{ value: null, disabled: true }, Validators.required],
        manufactureYear: [
          { value: null, disabled: true },
          Validators.required,
        ],
      });
    }
    this.onFormChange();
    this.onPatentInputChange();
    this.onCodeChasisInputChange();
  }

  onFormChange(): void {
    this.vehicleForm.valueChanges.subscribe({
      next: (vehicle) => (this.config.data.vehicle = vehicle),
    });
  }

  onPatentInputChange() {
    this.vehicleForm
      .get('patent')
      ?.valueChanges.pipe(
        debounceTime(200),
        filter((value) => value?.length > 4),
        distinctUntilChanged(),
        switchMap((value) =>
          this.vehicleService.getByPatentOrVin({
            type: VehicleType.PATENT,
            search: value,
            username: '',
          })
        )
      )
      .subscribe({
        next: (res) => {
          console.log('onPatentInputChange: ', res);
        },
      });
  }

  onCodeChasisInputChange() {
    this.vehicleForm
      .get('codeChasis')
      ?.valueChanges.pipe(
        debounceTime(200),
        filter((value) => value?.length > 4),
        distinctUntilChanged(),
        switchMap((value) =>
          this.vehicleService.getByPatentOrVin({
            type: VehicleType.VIN,
            search: value,
            username: '',
          })
        )
      )
      .subscribe({
        next: (res) => {
          console.log('onVINInputChange: ', res);
          this.vehicleForm.patchValue({
            patent: res?.PLACA_PATENTE || null,
            typeImp: res?.TIPO_VEHICULO || null,
            brand: res?.MARCA || null,
            model: res?.MODELO || null,
            manufactureYear: res?.ANO_FABRICACION
              ? new Date(res?.ANO_FABRICACION, 1)
              : null,
          });
        },
      });
  }
}
