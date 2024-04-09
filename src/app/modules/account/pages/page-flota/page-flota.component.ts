import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, Subject } from 'rxjs';
import { AddFlotaModalComponent } from '../../../../shared/components/add-flota-modal/add-flota-modal.component';
import {
  DataModal,
  ModalComponent,
  TipoIcon,
  TipoModal,
} from '../../../../shared/components/modal/modal.component';
import { UpdateFlotaModalComponent } from '../../../../shared/components/update-flota-modal/update-flota-modal.component';
import { Flota } from '../../../../shared/interfaces/flota';
import { RootService } from '../../../../shared/services/root.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { FlotaService } from '@core/services-v2/flota.service';
import { Column } from './table-column.interface';
import { CustomerVehicleService } from '@core/services-v2/customer-vehicle/customer-vehicle.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { VehicleFormComponent } from './modals/vehicle-form/vehicle-form.component';
import { VehicleFormFooter } from './modals/vehicle-form/vehicle-form-footer.component';
import { VehicleFormHeader } from './modals/vehicle-form/vehicle-form-header.component';
import { VehicleAction } from './vehicle-action.enum';

@Component({
  providers: [ConfirmationService, DialogService, MessageService],
  selector: 'app-page-flota',
  templateUrl: './page-flota.component.html',
  styleUrls: ['./page-flota.component.scss'],
})
export class PageFlotaComponent implements OnInit, OnDestroy {
  @ViewChildren(DataTableDirective) dtElements!: QueryList<DataTableDirective>;

  VehicleAction = VehicleAction;
  session!: ISession;

  busquedasRecientes: any[] = [];
  flota: any[] = [];

  dtOptions: DataTables.Settings = {};
  dtTrigger1: Subject<any> = new Subject();
  dtTrigger2: Subject<any> = new Subject();
  collapsed1State = true;
  collapsed2State = false;
  cargando = true;
  // Table variables
  loading!: boolean;
  selectedColumns!: Column[];
  cols!: Column[];
  vehicles: any[] = [];
  totalRows: number = 0;
  rows: number = 10;
  first: number = 0;
  ref: DynamicDialogRef | undefined;

  constructor(
    private readonly customerVehicleService: CustomerVehicleService,
    public root: RootService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private readonly sessionService: SessionService,
    private readonly flotaService: FlotaService,
    private confirmationService: ConfirmationService,
    public dialogService: DialogService,
    private readonly messageService: MessageService
  ) {}

  fetchVehicles(event: TableLazyLoadEvent) {
    console.log('event: ', event);

    this.first = event.first || 0;
    this.rows = event.rows || this.rows;
    const sort = event.sortField
      ? `${event.sortField}|${event.sortOrder}`
      : '';

    this.loading = true;
    this.customerVehicleService
      .getPaginatedCustomerVehicles(this.session.documentId, {
        page: this.first / this.rows + 1,
        limit: this.rows,
        sort,
      })
      .subscribe((res: any) => {
        console.log('getPaginatedCustomerVehicles: ', res);
        this.vehicles = res.data;
        this.totalRows = res.total;
        this.loading = false;
      });
  }

  ngOnInit() {
    this.session = this.sessionService.getSession();
    // this.fetchVehicles();

    this.dtOptions = this.root.simpleDtOptions;
    this.dtOptions = {
      ...this.dtOptions,
      ...{ dom: '<"row"<"col-6"l><"col-6"f>><"row"<"col-6"i><"col-6"p>> t' },
    };

    this.getData();
  }

  ngOnDestroy(): void {
    this.dtTrigger1.unsubscribe();
    this.dtTrigger2.unsubscribe();
  }

  getData() {
    this.cargando = true;
    forkJoin([
      this.flotaService.getSearchVin(this.session.documentId),
      this.flotaService.getFlota(this.session.documentId),
    ]).subscribe((resp: any[]) => {
      this.busquedasRecientes = resp[0].data;
      this.flota = [
        ...resp[1].data,
        ...resp[1].data,
        ...resp[1].data,
        ...resp[1].data,
        ...resp[1].data,
        ...resp[1].data,
        ...resp[1].data,
        ...resp[1].data,
        ...resp[1].data,
        ...resp[1].data,
        ...resp[1].data,
      ];
      this.cargando = false;

      if (this.busquedasRecientes.length > 0) {
        // this.dtTrigger1.next();
      }
      if (this.flota.length > 0) {
        // this.dtTrigger2.next();
      }
    });
  }

  reDraw(): void {
    this.dtElements.forEach((dtElement: DataTableDirective) => {
      if (dtElement.dtInstance) {
        dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.clear().draw();
          dtInstance.destroy();
        });
      }
    });
  }

  clickCollapse(item: any) {
    switch (item) {
      case 1:
        if (
          document
            .getElementById('busquedasRecientes')
            ?.classList.contains('collapsing')
        ) {
          return;
        }
        this.collapsed1State = !this.collapsed1State;
        this.collapsed2State = true;
        break;
      case 2:
        if (
          document.getElementById('miFlota')?.classList.contains('collapsing')
        ) {
          return;
        }
        this.collapsed2State = !this.collapsed2State;
        this.collapsed1State = true;
        break;
    }
  }

  agregarVinFlota(busqueda: Flota) {
    const initialState = {
      vin: busqueda?.vehiculo?.chasis,
      closeToOk: false,
    };
    const bsModalRef: BsModalRef = this.modalService.show(
      AddFlotaModalComponent,
      { initialState }
    );
    bsModalRef.content.event.subscribe(async (res: any) => {
      if (res !== '') {
        const request: any = {
          idFlota: busqueda._id,
          alias: res,
        };
        const respuesta: any = await this.flotaService
          .setFlota(request)
          .toPromise();
        if (!respuesta.error) {
          this.toastr.success('VIN guardado exitosamente.');
          bsModalRef.hide();

          this.reDraw();
          this.getData();
        }
      }
    });
  }

  actualizarVinFlota(flota: Flota) {
    const initialState = {
      vin: flota.vehiculo?.chasis,
      alias: flota.alias,
      closeToOk: false,
    };
    const bsModalRef: BsModalRef = this.modalService.show(
      UpdateFlotaModalComponent,
      { initialState }
    );
    bsModalRef.content.event.subscribe(async (res: any) => {
      if (res !== '') {
        const request: any = {
          idFlota: flota._id,
          alias: res,
        };
        const respuesta: any = await this.flotaService
          .updatedFlota(request)
          .toPromise();
        if (!respuesta.error) {
          this.toastr.success('Vehículo actualizado exitosamente.');
          bsModalRef.hide();

          this.reDraw();
          this.getData();
        }
      }
    });
  }

  eliminarVinBusqueda(busqueda: Flota) {
    const initialState: DataModal = {
      titulo: 'Confirmación',
      mensaje: `¿Esta seguro que desea <strong>eliminar</strong> el VIN ${busqueda.vehiculo?.chasis} de las busquedas recientes?`,
      tipoIcon: TipoIcon.QUESTION,
      tipoModal: TipoModal.QUESTION,
    };
    const bsModalRef: BsModalRef = this.modalService.show(ModalComponent, {
      initialState,
    });
    bsModalRef.content.event.subscribe(async (res: any) => {
      if (res) {
        const respuesta: any = await this.flotaService
          .deleteSearchVin(busqueda)
          .toPromise();
        if (!respuesta.error) {
          this.toastr.success('VIN eliminado exitosamente.');

          this.reDraw();
          this.getData();
        } else {
          this.toastr.error(respuesta.msg);
        }
      }
    });
  }

  eliminarFlota(flota: Flota) {
    const initialState: DataModal = {
      titulo: 'Confirmación',
      mensaje: `¿Está seguro que desea <strong>eliminar</strong> el vehículo alias ${flota.alias} de tu flota?`,
      tipoIcon: TipoIcon.QUESTION,
      tipoModal: TipoModal.QUESTION,
    };
    const bsModalRef: BsModalRef = this.modalService.show(ModalComponent, {
      initialState,
    });
    bsModalRef.content.event.subscribe(async (res: any) => {
      if (res) {
        const respuesta: any = await this.flotaService
          .deleteFlota(flota)
          .toPromise();
        if (!respuesta.error) {
          this.toastr.success('Vehículo eliminado exitosamente.');

          this.reDraw();
          this.getData();
        } else {
          this.toastr.error(respuesta.msg);
        }
      }
    });
  }

  confirmDeleteVehicle(event: Event, id: string) {
    console.log('event: ', event);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Está seguro que desea eliminar este registro?',
      header: 'Confirmación de eliminación',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Vehículo eliminado',
          detail: 'El vehículo se ha eliminado correctamente.',
        });
      },
    });
  }

  deleteVehicle(id: string) {
    this.customerVehicleService.delete(id).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  openVehicleModal(action: VehicleAction, vehicle?: any): void {
    const ref = this.dialogService.open(VehicleFormComponent, {
      header: 'Actualizar vehículo',
      width: '50vw',
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      appendTo: 'body',
      data: {
        vehicle: action === VehicleAction.UPDATE ? vehicle : null,
        action,
      },
      templates: {
        footer: VehicleFormFooter,
        header: VehicleFormHeader,
      },
    });

    ref.onClose.subscribe(
      ({ confirm, newVehicle }: { confirm: boolean; newVehicle: any }) => {
        if (!confirm) return;
        if (vehicle) {
          this.updateVehicle(newVehicle);
        } else {
          this.createVehicle(newVehicle);
        }
      }
    );
  }

  createVehicle(vehicle: any) {
    console.log('vehicle create: ', vehicle);
    /*this.customerVehicleService
      .createCustomerVehicle(this.session.documentId, vehicle)
      .subscribe({
        next: (res) => {},
        error: (err) => {},
      });*/
  }

  updateVehicle(vehicle: any) {
    console.log('vehicle update: ', vehicle);
  }
}
