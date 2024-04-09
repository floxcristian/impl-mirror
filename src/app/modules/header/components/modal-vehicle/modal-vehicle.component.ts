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

@Component({
  selector: 'app-modal-vehicle',
  templateUrl: './modal-vehicle.component.html',
  styleUrls: ['./modal-vehicle.component.scss']
})
export class ModalVehicleComponent implements OnInit {

  session!: ISession;
  vehicleSearchType: string = 'patente';
  vehicleForm: FormGroup;
  selectedVehicle!: IVehicle | null;
  notVehicleFound!: boolean;
  isLoading:boolean = false

  constructor(
    private router: Router,
    private menuService:MenuCategoriasB2cService,
    public readonly activeModal: NgbActiveModal,
    private readonly fb: FormBuilder,
    private readonly vehicleService: VehicleService,
    private readonly sessionService: SessionService,
  ) {
    this.vehicleForm = this.fb.group({
      type: ['patent', Validators.required],
      search: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.session = this.sessionService.getSession();
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
  }

  searchVehicle({ type, search }: { type: VehicleType; search: string }) {
    this.isLoading = true
    this.vehicleService.getByPatentOrVin({type, search, username: this.session.username || ''}).subscribe({
      next: (vehicle) => {
        this.isLoading = false
        this.selectedVehicle = vehicle || null;
        this.notVehicleFound = vehicle ? false : true;
      },
      error: (err) => {
        this.isLoading = false
        this.notVehicleFound = true;
      },
    });
  }
  /**
   * Ir a la página de artículos para ver productos del vehículo seleccionado.
   */
  goToProductsPage() {
    if(this.selectedVehicle?.PLACA_PATENTE && this.selectedVehicle?.codigoSii){
      this.cleanSelectedVehicle()
      this.router.navigateByUrl(`inicio/productos/vehicle/${this.selectedVehicle?.PLACA_PATENTE}/${this.selectedVehicle?.codigoSii}`);
      this.searchVehicle(this.vehicleForm.value);
      this.activeModal.close();
      this.menuService.close()
    }
  }

}
