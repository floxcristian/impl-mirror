import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VehicleType } from '@core/services-v2/vehicle/vehicle-type.enum';
import { VehicleService } from '@core/services-v2/vehicle/vehicle.service';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
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
  tap,
} from 'rxjs/operators';
import { Message } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    DynamicDialogModule,
    ReactiveFormsModule,
    CalendarModule,
    MessagesModule,
    MessageModule,
    DropdownModule,
    TableModule,
  ],
  templateUrl: './vehicle-form.component.html',
  styleUrl: './vehicle-form.component.scss',
})
export class VehicleFormComponent implements OnInit {
  vehicleForm!: FormGroup;

  get patentInput() {
    return this.vehicleForm.get('patent');
  }

  get codeChasisInput() {
    return this.vehicleForm.get('codeChasis');
  }

  get brandInput() {
    return this.vehicleForm.get('brand');
  }

  get modelInput() {
    return this.vehicleForm.get('model');
  }

  get manufactureYearInput() {
    return this.vehicleForm.get('manufactureYear');
  }

  messages: Message[] = [
    {
      severity: 'warn',
      summary: 'Patente no encontrada',
      detail: 'Debe completar el formulario.',
    },
  ];

  isSearchingVehicle!: boolean;
  vehicleNotFound!: boolean;
  brands: string[] = [];
  models: string[] = [];
  motors: any[] = [];
  motorsOptions: any[] = [];
  loadingBrands: boolean = true;
  loadingModels!: boolean;
  loadingMotors!: boolean;
  yearsOptions: number[] = [];

  inputChangesSubscriptions$!: Subscription;
  isEnabledInputChanges!: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly vehicleService: VehicleService,
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.inputChangesSubscriptions$ = new Subscription();
    this.buildForm();
    this.fetchBrands();
  }

  /**
   * Obtener marcas de vehículos.
   */
  private fetchBrands(): void {
    this.vehicleService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        this.loadingBrands = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingBrands = false;
      },
    });
  }

  /**
   * Obtener modelos según marca.
   * @param brand
   */
  private fetchModels(brand: string) {
    this.loadingModels = true;
    this.vehicleService.getModels(brand).subscribe({
      next: (models) => {
        this.models = models;
        this.loadingModels = false;
        this.modelInput?.enable();
      },
      error: (err) => {
        console.error(err);
        this.loadingModels = false;
      },
    });
  }

  /**
   * Obtener motores según marca y modelo.
   * @param brand marca
   * @param model modelo
   */
  private fetchMotors(brand: string, model: string) {
    this.loadingMotors = true;
    this.vehicleService.getMotors(brand, model).subscribe({
      next: (res) => {
        this.motors = res.motors;
        this.motorsOptions = JSON.parse(JSON.stringify(res.motors));
        this.yearsOptions = res.years;
        this.loadingMotors = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingMotors = false;
      },
    });
  }

  onManufactureYearInputChange(): void {
    this.inputChangesSubscriptions$.add(
      this.manufactureYearInput?.valueChanges
        .pipe(distinctUntilChanged())
        .subscribe({
          next: (year) => {
            if (!year) {
              this.motorsOptions = [];
              this.config.data.selectedMotor = null;
            } else {
              this.motorsOptions = this.motors.filter((motor) =>
                motor.anios.includes(year)
              );
              if (this.motorsOptions.length === 1) {
                this.config.data.selectedMotor = this.motorsOptions[0];
              }
            }
          },
        })
    );
  }

  onBrandInputChange(): void {
    this.inputChangesSubscriptions$.add(
      this.brandInput?.valueChanges.pipe(distinctUntilChanged()).subscribe({
        next: (brand) => {
          if (brand) {
            this.fetchModels(brand);
          } else {
            this.modelInput?.setValue(null);
            this.models = [];
            this.modelInput?.disable();
          }
          this.manufactureYearInput?.setValue(null);
          this.motors = [];
          this.motorsOptions = [];
          this.config.data.selectedMotor = null;
          this.manufactureYearInput?.disable();
        },
      })
    );
  }

  onModelInputChange(): void {
    this.inputChangesSubscriptions$.add(
      this.modelInput?.valueChanges.pipe(distinctUntilChanged()).subscribe({
        next: (model) => {
          if (model) {
            this.fetchMotors(this.brandInput?.value, model);
            this.manufactureYearInput?.enable();
          } else {
            this.motors = [];
            this.motorsOptions = [];
            this.manufactureYearInput?.disable();
          }
          this.manufactureYearInput?.setValue(null);
          this.config.data.selectedMotor = null;
        },
      })
    );
  }

  /**
   * Construir el formulario.
   */
  private buildForm(): void {
    this.vehicleForm = this.fb.group({
      patent: [null, Validators.required],
      codeChasis: [{ value: null, disabled: true }],
      brand: [{ value: null, disabled: true }, Validators.required],
      model: [{ value: null, disabled: true }, Validators.required],
      manufactureYear: [{ value: null, disabled: true }, Validators.required],
    });
    this.config.data.vehicleForm = this.vehicleForm;
    this.onPatentInputChange();
  }

  /**
   * Habilitar o deshabilitar campos del formulario.
   * @param isEnable
   */
  private enableBodyForm(isEnable: boolean): void {
    if (isEnable) {
      this.codeChasisInput?.enable();
      this.brandInput?.enable();
    } else {
      this.codeChasisInput?.disable();
      this.brandInput?.disable();
      this.modelInput?.disable();
      this.manufactureYearInput?.disable();
    }
  }

  /**
   * Limpia el formulario y las opciones seleccionadas.
   */
  private cleanBodyForm(): void {
    this.vehicleForm.patchValue({
      codeChasis: null,
      brand: null,
      model: null,
      manufactureYear: null,
    });
    this.motors = [];
    this.motorsOptions = [];
    this.config.data.selectedMotor = null;
  }

  private enableInputsChange(): void {
    if (this.isEnabledInputChanges) return;
    this.isEnabledInputChanges = true;
    this.inputChangesSubscriptions$ = new Subscription();
    this.onBrandInputChange();
    this.onModelInputChange();
    this.onManufactureYearInputChange();
  }

  private disableInputChanges(): void {
    this.isEnabledInputChanges = false;
    this.inputChangesSubscriptions$.unsubscribe();
  }

  onPatentInputChange() {
    this.patentInput?.valueChanges
      .pipe(
        debounceTime(200),
        filter((value) => {
          const includeSpaces = value.includes(' ');
          if (includeSpaces) this.patentInput?.setValue(value.trim());
          return !includeSpaces;
        }),
        distinctUntilChanged(),
        tap(() => {
          this.isSearchingVehicle = true;
          // FIXME: emite un evento al hacer disable.
          //this.enableBodyForm(false);
        }),
        switchMap((value) =>
          this.vehicleService.getByPatentOrVin({
            type: VehicleType.PATENT,
            search: value,
            username: '',
          })
        )
      )
      .subscribe({
        next: (vehicle) => {
          this.isSearchingVehicle = false;

          if (vehicle) {
            this.disableInputChanges();

            if (vehicle.MARCA && !this.brands.includes(vehicle.MARCA)) {
              this.brands.push(vehicle.MARCA);
            }
            if (vehicle.MODELO && !this.models.includes(vehicle.MODELO)) {
              this.models = [vehicle.MODELO];
            }
            if (
              vehicle.ANO_FABRICACION &&
              !this.yearsOptions.includes(vehicle.ANO_FABRICACION)
            ) {
              this.yearsOptions = [vehicle.ANO_FABRICACION];
            }

            this.vehicleForm.patchValue({
              codeChasis: vehicle?.COD_CHASIS, // VIN
              brand: vehicle?.MARCA || null,
              model: vehicle?.MODELO || null,
              manufactureYear: vehicle?.ANO_FABRICACION,
            });
            this.config.data.selectedMotor = {
              tipo: vehicle.IMPtipo,
              codigoSII: vehicle.codigoSii,
              codigo: vehicle.COD_MOTOR,
              detail: vehicle.detalle,
            };

            this.enableBodyForm(false);
            this.vehicleNotFound = false;
          } else {
            this.cleanBodyForm();
            this.enableInputsChange();
            this.enableBodyForm(true);
            this.vehicleNotFound = true;
          }
        },
        error: () => {
          this.isSearchingVehicle = false;
          this.enableBodyForm(false);
        },
      });
  }
}
