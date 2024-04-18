import { Component } from '@angular/core';
import { RootService } from '../../../../shared/services/root.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { Column } from './table-column.interface';
import { CustomerVehicleService } from '@core/services-v2/customer-vehicle/customer-vehicle.service';
import {
  ConfirmationService,
  FilterMetadata,
  MessageService,
} from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
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
export class PageFlotaComponent {
  VehicleAction = VehicleAction;
  session!: ISession;

  loading!: boolean;
  selectedColumns!: Column[];
  cols!: Column[];
  vehicles: any[] = [];
  totalRows: number = 0;
  rows: number = 10;
  first: number = 0;
  sortField: string | string[] = '';
  sortOrder: number = 1;

  constructor(
    private readonly customerVehicleService: CustomerVehicleService,
    public root: RootService,
    private readonly sessionService: SessionService,

    private confirmationService: ConfirmationService,
    public dialogService: DialogService,
    private readonly messageService: MessageService
  ) {
    this.session = this.sessionService.getSession();
  }

  /**
   * Obtener vehículos para la tabla.
   * @param event
   */
  fetchVehicles(event: TableLazyLoadEvent): void {
    this.first = event.first || 0;
    this.rows = event.rows || this.rows;
    this.sortField = event.sortField || '';
    this.sortOrder = event.sortOrder || 1;
    const sort = event.sortField
      ? `${event.sortField}|${event.sortOrder}`
      : '';
    const filters = [];
    for (let key in event.filters) {
      const item = event.filters[key] as FilterMetadata;

      if (item.value) {
        filters.push(`${key}|${item.value}`);
      }
    }

    this.loading = true;
    this.customerVehicleService
      .getPaginatedCustomerVehicles(this.session.documentId, {
        page: this.first / this.rows + 1,
        limit: this.rows,
        sort,
        search: filters.join(','),
      })
      .subscribe({
        next: (res) => {
          this.vehicles = res.data;
          this.totalRows = res.total;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'No se pueden obtener los vehículos',
            detail: 'Ha ocurrido un error al obtener los vehículos.',
          });
        },
      });
  }

  /**
   * Mostrar confirmación de eliminación de vehículo.
   * @param event
   * @param id
   */
  confirmDeleteVehicle(event: Event, id: string): void {
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
      accept: () => this.deleteVehicle(id),
    });
  }

  /**
   * Eliminar vehículo.
   * @param id
   */
  deleteVehicle(id: string): void {
    this.customerVehicleService.delete(this.session.documentId, id).subscribe({
      next: () => {
        this.first = 0;
        this.fetchVehicles({
          first: 0,
          rows: this.rows,
          sortField: this.sortField,
          sortOrder: this.sortOrder,
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Vehículo eliminado',
          detail: 'El vehículo se ha eliminado correctamente.',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Vehículo no eliminado',
          detail: 'Ha ocurrido un error al eliminar el vehículo.',
        });
      },
    });
  }

  /**
   * Mostrar modal para crear vehículo.
   * @param action
   * @param vehicle
   */
  openVehicleModal(action: VehicleAction): void {
    const ref = this.dialogService.open(VehicleFormComponent, {
      width: '50vw',
      contentStyle: { overflow: 'auto' },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
      appendTo: 'body',
      data: {
        documentId: this.session.documentId,
        action,
      },
      templates: {
        footer: VehicleFormFooter,
        header: VehicleFormHeader,
      },
    });

    ref.onClose.subscribe((isVehicleCreated: boolean) => {
      if (!isVehicleCreated) return;

      this.fetchVehicles({
        first: 0,
        rows: this.rows,
        sortField: this.sortField,
        sortOrder: this.sortOrder,
      });
    });
  }
}
