// Angular
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
// Libs
import { ToastrService } from 'ngx-toastr';
import { Context } from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartOptions } from 'chart.js';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
import {
  ISalesBySbu,
  ISalesMonth,
} from '@core/services-v2/customer-sale/models/customer-sale.interface';
import { Data } from '../../../../shared/components/card-dashboard-no-chart/card-dashboard-no-chart.component';
// Services
import { isVacio } from '../../../../shared/utils/utilidades';
import { SessionService } from '@core/services-v2/session/session.service';
import { CustomerSaleService } from '@core/services-v2/customer-sale/customer-sale.service';
import { CustomerService } from '@core/services-v2/customer.service';

@Component({
  selector: 'app-page-dashboard',
  templateUrl: './page-dashboard.component.html',
  styleUrls: ['./page-dashboard.component.scss'],
})
export class PageDashboardComponent {
  // graficos
  chartHistorySale: any;
  session: ISession;

  ventaMes: any;
  detalleVenta: any;

  miCredito!: Data[];
  misFacturas!: Data[];
  innerWidth: number;
  anio = new Date().getFullYear();
  mes = new Date().getMonth() + 1;

  ESTADO = { BUSCANDO: 1, OK: 2, NO_ENCONTRADO: 3, ERROR: 4 };
  lineEstado = this.ESTADO.BUSCANDO;
  lineChartData!: ChartConfiguration['data'];
  lineChartOptions: ChartOptions = {};

  barEstado = this.ESTADO.BUSCANDO;
  barChartData!: ChartConfiguration['data'];
  barChartLabels!: any[];
  barChartOptions: ChartOptions = {};
  isB2B: boolean = false;

  constructor(
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly customerSaleService: CustomerSaleService,
    private readonly customerService: CustomerService
  ) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;

    this.session = this.sessionService.getSession();
    this.isB2B = this.sessionService.isB2B();
    this.loadChart();
  }

  loadChart() {
    this.customerSaleService.getLastwoYearsSalesByMonth(this.anio).subscribe({
      next: (res) => {
        const data: ISalesMonth[] = res.data;
        const ventaActual = data.find((m) => {
          return m.year === this.anio && m.month === this.mes;
        });

        const hoy = new Date();
        hoy.setMonth(hoy.getMonth() - 1);
        const anioAnterior = hoy.getFullYear();
        const mesAnterior = hoy.getMonth() + 1;
        const ventaAnterior = data.find(
          (m) => m.year === anioAnterior && m.month === mesAnterior
        );
        this.ventaMes = !isVacio(ventaActual) ? ventaActual?.total : 0;
        const ventaMesAnterior = !isVacio(ventaAnterior)
          ? ventaAnterior?.total
          : 0;

        const porcentaje = Math.round(
          ventaMesAnterior !== 0
            ? (this.ventaMes * 100) / (ventaMesAnterior || 0)
            : 0
        );

        this.detalleVenta = {
          text: 'Desde el mes pasado',
          value: porcentaje - 100,
          icon: porcentaje - 100 >= 0 ? 'fa fa-arrow-up' : 'fa fa-arrow-down',
          textClass: porcentaje - 100 >= 0 ? 'text-success' : 'text-red-500',
        };
        this.cargaDatosVentaValorada(data);
      },
      error: (err) => {
        console.log(err);
        this.lineEstado = this.ESTADO.ERROR;
      },
    });

    this.customerSaleService
      .getOneMonthSalesGroupedBySbu(this.anio, this.mes)
      .subscribe({
        next: (res) => {
          const data: ISalesBySbu[] = res.data;
          this.barChartLabels = data.map((r) => r.name);
          this.cargaDatosVentaPorUen(data);
        },
        error: (err) => {
          console.log(err);
          this.barEstado = this.ESTADO.ERROR;
        },
      });
    this.customerService.getCustomerCredit(this.session.documentId).subscribe({
      next: (res) => {
        const utilizado = res.used;
        const asignado = res.assigned;
        const pUtilizado =
          asignado !== 0 ? Math.round((utilizado * 100) / asignado) : 0;
        const pSaldo = pUtilizado !== 0 ? Math.round(100 - pUtilizado) : 0;

        this.miCredito = [
          {
            label: 'Asignado',
            valor: asignado,
          },
          {
            label: 'Utilizado',
            valor: utilizado,
            porcentaje: pUtilizado,
          },
          {
            label: 'Saldo',
            valor: asignado - utilizado,
            porcentaje: pSaldo,
          },
        ];
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(
          'Error de comunicación para obtener pendientes de entrega'
        );
      },
    });

    this.customerSaleService.getCustomerSalesDebt().subscribe({
      next: (res) => {
        const porVencer = res.totalOverdueAmount;
        const vencido = res.totalDueAmount;
        const totalDeuda = res.totalDueAmount + res.totalOverdueAmount;
        const pVencido =
          totalDeuda !== 0 ? Math.round((vencido * 100) / totalDeuda) : 0;
        const pPorVencer = Math.round(100 - pVencido);

        this.misFacturas = [
          {
            label: 'Por Vencer',
            valor: porVencer,
            porcentaje: pPorVencer,
          },
          {
            label: 'Vencido',
            valor: vencido,
            porcentaje: pVencido,
          },
          {
            label: 'Total adeudado',
            valor: totalDeuda,
          },
        ];
      },
      error: (err) => {
        console.log(err);
        this.toastr.error(
          'Error de comunicación para obtener pendientes de entrega'
        );
      },
    });
  }

  cargaDatosVentaValorada(data: ISalesMonth[]) {
    const anioConsultado = [];
    const anioAnterior = [];
    let max = 0;

    for (let i = 1; i < 13; i++) {
      const datoConsultado = data.find(
        (r) => r.year === this.anio && r.month === i
      );
      if (datoConsultado) {
        max =
          datoConsultado.total > max ? Math.trunc(datoConsultado.total) : max;
        anioConsultado.push(datoConsultado.total);
      } else {
        anioConsultado.push(null);
      }
      const datoAnterior = data.find(
        (r) => r.year === this.anio - 1 && r.month === i
      );
      if (datoAnterior) {
        max = datoAnterior.total > max ? Math.trunc(datoAnterior.total) : max;
        anioAnterior.push(datoAnterior.total);
      } else {
        anioAnterior.push(null);
      }
    }

    this.lineChartData = {
      labels: [
        'Enero',
        'Febrero',
        'Marzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre',
      ],
      datasets: [
        {
          data: anioConsultado,
          label: this.anio.toString(),
          yAxisID: 'yAxes',
          datalabels: {
            align: (context: Context) => {
              const data1 = context.dataset.data[context.dataIndex] || 0;
              const data2 =
                context.chart.data.datasets[1].data[context.dataIndex] || 0;
              return data1 > data2 ? 'end' : 'start';
            },
            formatter: (value: any, context: any) => {
              if (value >= 1000000) {
                return (
                  (Math.round((value / 1000000) * 100) / 100).toString() +
                  ' MM'
                );
              }
              return value;
            },
          },
          backgroundColor: 'rgba(0,175,238,0.2)',
          borderColor: 'rgba(0,175,238,1)',
          pointBackgroundColor: 'rgba(148,159,177,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(148,159,177,0.8)',
          fill: true,
        },
        {
          data: anioAnterior,
          label: (this.anio - 1).toString(),
          yAxisID: 'yAxes',
          datalabels: {
            align: (context: Context) => {
              const data1 = context.dataset.data[context.dataIndex] || 0;
              const data2 =
                context.chart.data.datasets[0].data[context.dataIndex] || 0;
              return data1 > data2 ? 'end' : 'start';
            },
            formatter: (value: any) => {
              if (value >= 1000000) {
                return (
                  (Math.round((value / 1000000) * 100) / 100).toString() +
                  ' MM'
                );
              }
              return value;
            },
          },
          backgroundColor: 'rgba(77,83,96,0.2)',
          borderColor: 'rgba(77,83,96,1)',
          pointBackgroundColor: 'rgba(77,83,96,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(77,83,96,1)',
          fill: true,
        },
      ],
    };
    /* calcula scala eje Y */
    const steps = 5;

    const digitos = max.toString().length - 1;
    const newMax =
      (Math.trunc(max / Math.pow(10, digitos)) + 1) * Math.pow(10, digitos);

    this.lineChartOptions = {
      responsive: true,
      plugins: {
        datalabels: {
          backgroundColor: (context: Context) => {
            return context.dataset?.borderColor?.toString() || '';
          },
          borderRadius: 4,
          color: 'white',
          formatter: Math.round,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Meses',
          },
        },
        yAxes: {
          position: 'left',
          min: 0,
          max: newMax,
          ticks: {
            stepSize: Math.ceil(newMax / steps),
          },
          display: true,
          title: {
            display: true,
            text: 'Pesos ($)',
          },
        },
      },
    };
    this.lineEstado = this.ESTADO.OK;
  }

  cargaDatosVentaPorUen(data: ISalesBySbu[]) {
    let max = 0;

    data.forEach((e) => {
      max = e.total > max ? Math.trunc(e.total) : max;
    });

    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: data.map((r) => r.total),
          datalabels: {
            formatter: (value: any, context: any) => {
              if (value >= 1000000) {
                return (
                  (Math.round((value / 1000000) * 100) / 100).toString() +
                  ' MM'
                );
              } else {
                return Math.round(value);
              }
            },
          },
          backgroundColor: 'rgba(0,175,238,0.2)',
          borderColor: 'rgba(0,175,238,1)',
          pointBackgroundColor: 'rgba(148,159,177,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(148,159,177,0.8)',
        },
      ],
    };
    /* calcula scala eje X */
    const steps = 5;

    const digitos = max.toString().length - 1;
    const newMax =
      (Math.trunc(max / Math.pow(10, digitos)) + 1) * Math.pow(10, digitos);

    this.barChartOptions = {
      responsive: true,
      indexAxis: 'y',
      plugins: {
        datalabels: {
          backgroundColor: (context: Context) => {
            return context.dataset.borderColor?.toString() || '';
          },
          borderRadius: 4,
          font: {
            size: 11,
          },
          color: 'white',
          formatter: Math.round,
        },
      },
      aspectRatio: 3 / 1,
      scales: {
        x: {
          min: 0,
          max: newMax,
          ticks: {
            stepSize: Math.ceil(newMax / steps),
          },
          display: true,
          title: {
            display: true,
            text: 'Pesos ($)',
          },
        },
        y: {
          position: 'left',
          display: true,
          title: {
            display: true,
            text: 'Categorías',
          },
        },
      },
    };
    this.barEstado = this.ESTADO.OK;
  }

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }
}
