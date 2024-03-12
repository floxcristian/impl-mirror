import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Usuario } from '../../../../shared/interfaces/login';
import { RootService } from '../../../../shared/services/root.service';
import { ClientsService } from '../../../../shared/services/clients.service';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CartService } from '@core/services-v2/cart.service';

@Component({
  selector: 'app-page-ovs-list',
  templateUrl: './page-ovs-list.component.html',
  styleUrls: ['./page-ovs-list.component.sass']
})
export class PageOvsListComponent implements OnInit {
  loadingData = true;
  carros: any[] = [];

  visible_columns = ['Fecha', 'Cliente', 'OC'];
  columns = ['modificacion', 'cliente', 'OrdenCompra'];

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  constructor(
    private root: RootService,
    private toastr: ToastrService,
    private carroService: ClientsService,
    //Services v2
    private cartSrv:CartService
  ) {
    this.loadingData = true;
  }

  ngOnInit() {
    this.dtOptions = this.root.simpleDtOptions;
    this.dtOptions = { ...this.dtOptions, ...{ order: [[0, 'desc']] } };
    let params={
      search:'',
      page: 1,
      limit: 10,
      sort: 'updatedAt|-1'
    }

    this.cartSrv.getAllOrderGenerated(params).subscribe({
      next:(r:any) => {
        console.log('response:',r)
        // if (r.data !== null) {
        //   const results = r.data.map((result:any) => {
        //     result.modificacion = moment(result.modificacion).format('DD/MM/YYYY');
        //     if (result.ordenCompra.monto != undefined) {
        //       result.ordenCompra.monto = result.ordenCompra.monto.toLocaleString('es-es', { minimumFractionDigits: 0 });
        //     }
        //     result.cliente.credito = result.cliente.credito.toLocaleString('es-es', { minimumFractionDigits: 0 });
        //     if (result.cliente.creditoUtilizado) {
        //       result.cliente.creditoUtilizado = result.cliente.creditoUtilizado.toLocaleString('es-es', {
        //         minimumFractionDigits: 0
        //       });
        //     } else {
        //       result.cliente.creditoUtilizado = '0';
        //     }

        //     return result;
        //   });

        //   this.carros = results;
        // }

        this.loadingData = false;
        // this.dtTrigger.next();
      },
      error:(error) => {
        this.loadingData = false;
        this.toastr.error('Error de conexión, para obtener ovs');
      }
    }
  );

    // this.carroService.buscarOvsGeneradas().subscribe(
    //   (r: any) => {
    //     if (r.data !== null) {
    //       const results = r.data.map(result => {
    //         result.modificacion = moment(result.modificacion).format('DD/MM/YYYY');
    //         if (result.ordenCompra.monto != undefined) {
    //           result.ordenCompra.monto = result.ordenCompra.monto.toLocaleString('es-es', { minimumFractionDigits: 0 });
    //         }
    //         result.cliente.credito = result.cliente.credito.toLocaleString('es-es', { minimumFractionDigits: 0 });
    //         if (result.cliente.creditoUtilizado) {
    //           result.cliente.creditoUtilizado = result.cliente.creditoUtilizado.toLocaleString('es-es', {
    //             minimumFractionDigits: 0
    //           });
    //         } else {
    //           result.cliente.creditoUtilizado = '0';
    //         }

    //         return result;
    //       });

    //       this.carros = results;
    //     }

    //     this.loadingData = false;
    //     this.dtTrigger.next();
    //   },
    //   error => {
    //     this.loadingData = false;
    //     this.toastr.error('Error de conexión, para obtener ovs');
    //   }
    // );
  }

  public confirmarOV(idCarro:any) {
    // this.carroService.confirmarOV(idCarro).subscribe((r: any) => {
    //   this.toastr.success('Error de conexión, para obtener ovs');
    //   window.location.reload();
    // });
  }
}
