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
  customerVehiclesFilter!:IVehicle[]
  customerVehiclesOriginal!:IVehicle[]
  getTypeFilter(){
    return this.vehicleForm.get('type')?.value === 'patent' ? this.vehicleForm.get('type')?.value : 'codeChasis'
  }

  constructor(
    private router: Router,
    private menuService:MenuCategoriasB2cService,
    public readonly activeModal: NgbActiveModal,
    private readonly fb: FormBuilder,
    private readonly vehicleService: VehicleService,
    private readonly sessionService: SessionService,
    private readonly customerVehicleService: CustomerVehicleService
  ) {
    this.vehicleForm = this.fb.group({
      type: ['patent', Validators.required],
      search: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.session = this.sessionService.getSession();
    this.getAllCustomerVehicle()
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
      this.router.navigateByUrl(`inicio/productos/vehicle/${this.selectedVehicle?.PLACA_PATENTE}/${this.selectedVehicle?.codigoSii}`);
      this.searchVehicle(this.vehicleForm.value);
      this.cleanSelectedVehicle()
      this.activeModal.close();
      this.menuService.close()
    }
  }

  /**
   *  Obtiene vehiculos del cliente logueado
   */
  getAllCustomerVehicle(){
    if (this.session.documentId !== '0'){
      this.customerVehicleService.getAll(this.session.documentId).subscribe({
        next:(vehicles:any) =>{
          this.customerVehiclesOriginal = vehicles
          this.customerVehiclesFilter = vehicles
        },
        error:(err) =>{
          console.log(err)
        }
      })
    }
  }

  /**
   * Filtra los vehiculos
   */
  filterVehicle(){
    let valueSearch = this.vehicleForm.get('search')?.value
    if(!valueSearch || valueSearch === '') this.customerVehiclesFilter = this.customerVehiclesOriginal
    else {
      let typeFilter = this.getTypeFilter()
      if(typeFilter === 'patent') this.customerVehiclesFilter = this.customerVehiclesOriginal.filter((vehicle:any) => vehicle.patent.toUpperCase().includes(valueSearch.toUpperCase()))
      else this.customerVehiclesFilter = this.customerVehiclesOriginal.filter((vehicle:any) => vehicle.codeChasis.toUpperCase().includes(valueSearch.toUpperCase()))
    }
  }

}
