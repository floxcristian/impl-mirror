import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tracking-steps',
  templateUrl: './tracking-steps.component.html',
  styleUrls: ['./tracking-steps.component.scss'],
})
export class TrackingStepsComponent implements OnInit {
  @Input() OVEstados: any[] = [];

  @Input() tipoEntrega = 'RPTDA';
  estado_envio: any = {};
  Informe_estado: any = [];
  seguimiento_estado = ['CREADO', 'ORIGEN', 'EN PREPARACIÓN', 'ESPERA CLIENTE', 'ENVIADO', 'RECIBIDO', 'N/A'];
  constructor() {}

  ngOnInit() {
    this.informarEstados();
  }

  ngOnChanges() {
    this.informarEstados();
  }

  async informarEstados() {
    this.Informe_estado = [];
    this.OVEstados.forEach((estado) => {
      if (
        estado.status == 'created' || estado.status == 'confirmed'
      ) this.Informe_estado[0] = estado;
      else if (estado.status == 'pickup' || estado.status == 'shipped') {
        this.Informe_estado[1] = 'prepared';
        this.Informe_estado[2] = estado;
      } else if (estado.status == 'prepared') this.Informe_estado[1] = estado;
      else if (
        estado.status == 'received' ||
        estado.status == 'cancelled'
      ) this.Informe_estado[3] = estado;
    });
  }
}
