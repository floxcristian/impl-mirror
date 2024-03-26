import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import {
  DataModal,
  ModalComponent,
  TipoIcon,
  TipoModal,
} from '../../../../shared/components/modal/modal.component';
import { RootService } from '../../../../shared/services/root.service';
import { AddCentroCostoModalComponent } from './components/add-centro-costo-modal/add-centro-costo-modal.component';
import { EditCentroCostoModalComponent } from './components/edit-centro-costo-modal/edit-centro-costo-modal.component';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { ICostCenter } from '@core/models-v2/customer/customer-cost-center.interface';
import { CustomerCostCenterService } from '@core/services-v2/customer-cost-center.service';

@Component({
  selector: 'app-page-centros-costo',
  templateUrl: './page-centros-costo.component.html',
  styleUrls: ['./page-centros-costo.component.scss'],
})
export class PageCentrosCostoComponent implements OnInit, OnDestroy {
  @ViewChildren(DataTableDirective) dtElements!: QueryList<DataTableDirective>;

  userSession!: ISession;
  centrosCosto: ICostCenter[] = [];

  dtOptions: DataTables.Settings = {};
  dtTrigger1: Subject<any> = new Subject();
  cargando = true;

  constructor(
    public root: RootService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly customerCostCenterService: CustomerCostCenterService
  ) {}

  ngOnInit() {
    this.userSession = this.sessionService.getSession();
    this.dtOptions = this.root.simpleDtOptions;
    this.dtOptions = {
      ...this.dtOptions,
      ...{ dom: '<"row"<"col-6"l><"col-6"f>><"row"<"col-6"i><"col-6"p>> t' },
    };

    this.getData();
  }

  ngOnDestroy(): void {
    this.dtTrigger1.unsubscribe();
  }

  getData() {
    this.cargando = true;
    this.customerCostCenterService
      .getCostCenters(this.userSession.documentId)
      .subscribe({
        next: (res) => {
          this.centrosCosto = res;
          this.cargando = false;

          if (this.centrosCosto.length > 0) {
            this.dtTrigger1.next('');
          }
        },
        error: (err) => {
          console.log(err);
        },
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

  agregarVinFlota() {
    const initialState = {
      closeToOK: false,
    };
    const bsModalRef: BsModalRef = this.modalService.show(
      AddCentroCostoModalComponent,
      { initialState }
    );
    bsModalRef.content.event.subscribe(async (res: any) => {
      if (res !== '') {
        const request: ICostCenter = {
          code: res.code,
          name: res.name,
        };
        this.customerCostCenterService
          .createCostCenter(request, this.userSession.documentId)
          .subscribe({
            next: (res) => {
              console.log('create centro costo', res);
              this.toastr.success('Centro de costo ingresado exitosamente.');
              bsModalRef.hide();
              this.reDraw();
              this.getData();
            },
            error: (err) => {
              this.toastr.error(err.msg);
              bsModalRef.hide();
            },
          });
      }
    });
  }

  actualizarCentroCosto(centroCosto: ICostCenter) {
    const initialState = {
      code: centroCosto.code,
      name: centroCosto.name,
      closeToOk: false,
    };
    const bsModalRef: BsModalRef = this.modalService.show(
      EditCentroCostoModalComponent,
      { initialState }
    );
    bsModalRef.content.event.subscribe(async (res: any) => {
      if (res !== '') {
        this.customerCostCenterService
          .updateCostCenter(res, this.userSession.documentId)
          .subscribe({
            next: (res) => {
              this.toastr.success('Centro de costo actualizado exitosamente.');
              bsModalRef.hide();
              this.reDraw();
              this.getData();
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    });
  }

  eliminarCentroCosto(centroCosto: ICostCenter) {
    const initialState: DataModal = {
      titulo: 'Confirmación',
      mensaje: `¿Esta seguro que desea <strong>eliminar</strong> el centro de costo código ${centroCosto.code}?`,
      tipoIcon: TipoIcon.QUESTION,
      tipoModal: TipoModal.QUESTION,
    };
    const bsModalRef: BsModalRef = this.modalService.show(ModalComponent, {
      initialState,
    });
    bsModalRef.content.event.subscribe(async (res: any) => {
      this.customerCostCenterService
        .deleteCostCenter(this.userSession.documentId, centroCosto.code)
        .subscribe({
          next: (res) => {
            this.toastr.success('Centro de costo eliminado exitosamente.');
            this.reDraw();
            this.getData();
          },
          error: (err) => {
            this.toastr.error(err.msg);
          },
        });
    });
  }
}
