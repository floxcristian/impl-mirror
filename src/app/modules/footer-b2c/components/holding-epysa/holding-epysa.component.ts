// Angular
import { Component } from '@angular/core';

@Component({
  selector: 'app-holding-epysa',
  templateUrl: './holding-epysa.component.html',
  styleUrls: ['./holding-epysa.component.scss'],
})
export class HoldingEpysaComponent {
  terminos = false;
  links = [
    {
      rel: 'noopener',
      label: 'EPYSA Buses',
      link: 'https://www.epysabuses.cl',
    },
    {
      rel: 'noopener',
      label: 'EPYSA Equipos',
      link: 'https://www.epysaequipos.cl',
    },
    {
      rel: 'noopener',
      label: 'Servi Bus',
      link: 'http://www.epysabuses.cl/red-servicio-tecnico-servibus/',
    },
    { rel: 'noopener', label: 'FITRANS', link: 'http://www.fitrans.cl' },
    { rel: 'noopener', label: 'Mundo LCV', link: 'https://mundobuses.cl/' },
    { rel: 'noopener', label: 'Bus Market', link: 'https://www.busmarket.cl' },
    {
      rel: 'noopener',
      label: 'Implementos Perú',
      link: 'https://implementos.com.pe',
    },
    {
      rel: 'noopener',
      label: 'Implementos España',
      link: 'https://www.implementos.eu/',
    },
    { rel: 'noopener', label: 'Mercobus', link: 'http://www.mercobus.com.pe' },
  ];
}
