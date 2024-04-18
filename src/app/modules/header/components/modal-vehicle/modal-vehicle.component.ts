import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IVehicle } from '@core/services-v2/vehicle/vehicle-response.interface';
import { VehicleService } from '@core/services-v2/vehicle/vehicle.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VehicleType } from '@core/services-v2/vehicle/vehicle-type.enum';
import { ISession } from '@core/models-v2/auth/session.interface';
import { SessionService } from '@core/services-v2/session/session.service';
import { Router } from '@angular/router';
import { MenuCategoriasB2cService } from '@shared/services/menu-categorias-b2c.service';
import { CustomerVehicleService } from '@core/services-v2/customer-vehicle/customer-vehicle.service';
import { IVehicleCustomer } from '@core/services-v2/customer-vehicle/vehicle-customer-response.interface';
import { ToastrService } from 'ngx-toastr';
import { Message } from 'primeng/api';

@Component({
  selector: 'app-modal-vehicle',
  templateUrl: './modal-vehicle.component.html',
  styleUrls: ['./modal-vehicle.component.scss'],
})
export class ModalVehicleComponent implements OnInit {
  get searchInput() {
    return this.vehicleForm.get('search');
  }

  messages: Message[] = [
    {
      severity: 'warn',
      detail:
        'Esta funcionalidad esta disponible solo para usuario registrados.',
    },
  ];
  isClickedVehicleSearch!: boolean;

  session!: ISession;
  vehicleSearchType: string = 'patente';
  vehicleForm: FormGroup;
  selectedVehicle!: IVehicle | null;
  notVehicleFound!: boolean;
  customerVehiclesFilter!: IVehicleCustomer[];
  customerVehiclesOriginal!: IVehicleCustomer[];
  isLoadingVehicles: boolean = false;
  existInFlota: boolean = false;
  isLoadingCreate: boolean = false;
  getTypeFilter() {
    return this.vehicleForm.get('type')?.value === 'patent'
      ? this.vehicleForm.get('type')?.value
      : 'codeChasis';
  }

  constructor(
    private router: Router,
    private menuService: MenuCategoriasB2cService,
    public readonly activeModal: NgbActiveModal,
    private readonly fb: FormBuilder,
    private readonly vehicleService: VehicleService,
    private readonly sessionService: SessionService,
    private readonly customerVehicleService: CustomerVehicleService,
    private toastr: ToastrService
  ) {
    this.vehicleForm = this.fb.group({
      type: ['patent', Validators.required],
      search: [null],
    });
  }

  ngOnInit() {
    this.session = this.sessionService.getSession();
    this.getAllCustomerVehicle();
  }

  /**
   * Quitar vehículo seleccionado.
   */
  cleanSelectedVehicle(): void {
    this.vehicleForm.setValue({
      type: 'patent',
      search: null,
    });
    this.selectedVehicle = null;
    this.customerVehiclesFilter = this.customerVehiclesOriginal;
  }

  searchVehicle({
    type,
    search,
  }: {
    type: VehicleType;
    search: string;
  }): void {
    if (this.session.documentId === '0') {
      this.isClickedVehicleSearch = true;
      return;
    }
    this.isLoadingVehicles = true;
    this.vehicleService
      .getByPatentOrVin({
        type,
        search,
        username: this.session.username || '',
      })
      .subscribe({
        next: (vehicle) => {
          this.isLoadingVehicles = false;
          this.selectedVehicle = vehicle || null;
          this.notVehicleFound = vehicle ? false : true;
          this.existVehicleInFlota(this.selectedVehicle);
        },
        error: (err) => {
          this.isLoadingVehicles = false;
          this.notVehicleFound = true;
          this.existInFlota = false;
        },
      });
  }
  /**
   * Ir a la página de artículos para ver productos del vehículo seleccionado.
   */
  goToProductsPage() {
    if (
      this.selectedVehicle?.PLACA_PATENTE &&
      this.selectedVehicle?.codigoSii
    ) {
      this.router.navigateByUrl(
        `inicio/productos/vehicle/${this.selectedVehicle?.PLACA_PATENTE}/${this.selectedVehicle?.codigoSii}`
      );
      this.searchVehicle(this.vehicleForm.value);
      this.cleanSelectedVehicle();
      this.activeModal.close();
      this.menuService.close();
      this.existInFlota = false;
    }
  }

  /**
   *  Obtiene vehiculos del cliente logueado
   */
  getAllCustomerVehicle() {
    if (this.session.documentId !== '0') {
      this.customerVehicleService.getAll(this.session.documentId).subscribe({
        next: (vehicles: any) => {
          this.customerVehiclesOriginal = vehicles;
          this.customerVehiclesFilter = vehicles;
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  /**
   * Filtra los vehiculos
   */
  filterVehicle() {
    let valueSearch = this.vehicleForm.get('search')?.value;
    if (!valueSearch || valueSearch === '')
      this.customerVehiclesFilter = this.customerVehiclesOriginal;
    else {
      let typeFilter = this.getTypeFilter();
      if (typeFilter === 'patent')
        this.customerVehiclesFilter = this.customerVehiclesOriginal.filter(
          (vehicle: any) =>
            vehicle.patent.toUpperCase().includes(valueSearch.toUpperCase())
        );
      else
        this.customerVehiclesFilter = this.customerVehiclesOriginal.filter(
          (vehicle: any) =>
            vehicle.codeChasis
              .toUpperCase()
              .includes(valueSearch.toUpperCase())
        );
    }
  }

  /**
   * Verifica si el vehiculo esta en la flota del cliente
   */
  existVehicleInFlota(vehicleFind: any) {
    if (vehicleFind) {
      let typeFilter = this.getTypeFilter();
      if (typeFilter === 'patent') {
        let existVehicle = this.customerVehiclesOriginal.find(
          (vehicle: any) => vehicleFind.PLACA_PATENTE === vehicle.patent
        );
        if (existVehicle) this.existInFlota = true;
      } else {
        let existVehicle = this.customerVehiclesOriginal.find(
          (vehicle: any) => vehicleFind.COD_CHASIS === vehicle.codeChasis
        );
        if (existVehicle) this.existInFlota = true;
      }
    } else this.existInFlota = false;
  }

  /**
   * Agregar vehiculo a flota
   */
  addMyFlota() {
    if (this.selectedVehicle) {
      let createVehicle = {
        patent: this.selectedVehicle.PLACA_PATENTE,
        brand: this.selectedVehicle.MARCA,
        model: this.selectedVehicle.MODELO,
        typeVehicle: this.selectedVehicle.TIPO_VEHICULO,
        manufactureYear: this.selectedVehicle.ANO_FABRICACION,
        codeMotor: this.selectedVehicle.COD_MOTOR,
        codeChasis: this.selectedVehicle.COD_CHASIS,
        customer: this.selectedVehicle.cliente,
        typeImp: this.selectedVehicle.IMPtipo,
        detail: this.selectedVehicle.detalle,
        codeSii: this.selectedVehicle.codigoSii,
      };
      this.isLoadingCreate = true;
      this.customerVehicleService
        .createCustomerVehicle(this.session.documentId, createVehicle)
        .subscribe({
          next: () => {
            this.isLoadingCreate = false;
            this.toastr.success('Vehiculo Agregado a la flota', '');
          },
          error: (err) => {
            console.log(err);
            this.isLoadingCreate = false;
          },
        });
    }
  }
}
