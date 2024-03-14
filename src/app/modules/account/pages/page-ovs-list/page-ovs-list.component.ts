import { Component, OnInit, ViewChild, TemplateRef, Inject, PLATFORM_ID } from '@angular/core'
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { CartService } from '@core/services-v2/cart.service';
import { DataTableDirective } from 'angular-datatables';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-page-ovs-list',
  templateUrl: './page-ovs-list.component.html',
  styleUrls: ['./page-ovs-list.component.sass']
})
export class PageOvsListComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  // orders!: IOrderDetail[];
  orders!:any[]
  innerWidth: any;
  loadingData:boolean = true;
  // visible_columns = ['Fecha', 'Cliente', 'OC'];
  columns = [
    'updatedAt',
    'salesId',
    'warehouse',
    'branchCode',
    'customer.documentId',
    // 'nombre cliente',
    'purchaseOrder.amount',
    'purchaseOrder.number',
    // 'purchaseOrder.costCenter',
    // 'credito',
    // 'saldo',
  ];

  constructor(
    private toastr: ToastrService,
    //Services v2
    private cartSrv:CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    this.loadingData = true;
  }

  ngOnInit() {
    this.loadData()
  }

  loadData(){
    this.dtOptions = {
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json',
      },
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      order: [[0, 'desc']],
      columnDefs:
        this.innerWidth < 450
          ? [{ orderable: false, targets: 0 }]
          : [{ orderable: false, targets: 4 }],
      // columnDefs: [{ orderable: false, targets: 6 }],
      ajax:(dataTablesParameters:any, callback) => {
        let page_actual =
          dataTablesParameters.start === 0
            ? 1
            : dataTablesParameters.start / dataTablesParameters.length + 1;
        let sort_column = this.columns[dataTablesParameters.order[0].column];
        let sort_asc_desc = dataTablesParameters.order[0].dir === 'asc' ? 1 : -1;
        let sort_real = sort_column + '|' + sort_asc_desc;
        let params = {
          search: dataTablesParameters.search.value,
          page: page_actual,
          limit: dataTablesParameters.length,
          sort: sort_real,
        };
        this.cartSrv.getAllOrderGenerated(params).subscribe({
          next:(res)=>{
            this.orders = res.data;
            callback({
              recordsTotal: res.total,
              recordsFiltered: res.total,
              data: [],
            });
          },
          error:(err)=>{
            console.log(err)
          }
        })

      }
    }
  }

  public confirmarOV(idCarro:any) {
    // this.carroService.confirmarOV(idCarro).subscribe((r: any) => {
    //   this.toastr.success('Error de conexión, para obtener ovs');
    //   window.location.reload();
    // });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  reloadGrilla(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(null);
    });
  }

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }
}
