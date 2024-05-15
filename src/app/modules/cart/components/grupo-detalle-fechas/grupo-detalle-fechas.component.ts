// Angular
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
// Constants
import { DIAS, MESES } from './date-config';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-grupo-detalle-fechas',
  templateUrl: './grupo-detalle-fechas.component.html',
  styleUrls: ['./grupo-detalle-fechas.component.scss'],
})
export class GrupoDetalleFechasComponent implements OnInit {
  @Input() fletes: any = [];
  @Input() index: number = 0;
  @Input() DIAS_SEMANA = 10;
  @Output() itemSeleccionado = new EventEmitter();

  DIAS_SEMANA_STR = DIAS;
  MESES_STR = MESES;

  semanas: any = [];
  totalSemanas: number = 0;
  semanaActual: number = 0;
  itemSelectedindex: number = 0;
  paginasIndex = 0;
  //ver las fechas
  innerWidth: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
  }

  ngOnInit(): void {
    this.armarSemanas();
    this.setSemanaActual();
    if (this.innerWidth > 450) this.primeraFechaSeleccionda();
  }

  ngOnDestroy(): void {
    this.itemSeleccionado.unsubscribe();
  }

  /**
   * Obtener el total de semenas entre la fecha del último flete y la fecha de mañana.
   * @param fletes arreglo con los fletes disponibles.
   * @returns el número de semanas de diferencia entre el día de mañana y la fecha del último flete.
   */
  armarSemanas() {
    this.semanas = [];
    // Fecha actual y currentDate son distintas

    this.totalSemanas = this.fletes.length / this.DIAS_SEMANA;

    for (let weekIndex = 0; weekIndex < this.totalSemanas; weekIndex++) {
      const fechasSemana: any = [];
      // Por cada semana
      let dayIndex = 0;

      while (dayIndex < this.DIAS_SEMANA) {
        if(this.fletes[dayIndex]){
          const date = new Date(this.fletes[dayIndex].fecha);

        // Se modifica el mes de la fecha del flete (0-11)
        // Pasa al siguiente mes (en la fecha actual) si ve que el día (1-31) del primer flete queda mayor a la fecha actual.
        const flete = this.buscarFechaFlete(date);

        if (flete) {
          fechasSemana.push({
            index: dayIndex + 1,
            fecha: date,
            habilitado: flete !== null,
            valor: flete ? flete.precio : 999999, // $
            diaSemana: this.DIAS_SEMANA_STR[date.getDay()], // Ej: Mié
            numeroDia: date.getDate(), // Ej: 07
            mes: this.MESES_STR[date.getMonth()].substring(0, 3),
          });
          dayIndex = dayIndex + 1;
        }
        // Pasa al día siguiente (1-31).
        }else dayIndex = dayIndex + 1;
      }

      if (fechasSemana.length) {
        this.semanas.push({
          mes: this.MESES_STR[fechasSemana[0].fecha.getMonth()],
          year: fechasSemana[0].fecha.getFullYear(),
          fechas: fechasSemana,
        });
      }
    }
  }

  setSemanaActual() {
    for (let i = 0; i < this.semanas.length; i++) {
      if (this.semanas[i].fechas.some((f: any) => f.habilitado)) {
        this.semanaActual = i;
        break;
      }
    }
  }

  goToSemana(nuevaSemana: number) {
    this.itemSelectedindex = 0;
    if (nuevaSemana < 0 || nuevaSemana >= this.totalSemanas) {
      return;
    }
    this.semanaActual = nuevaSemana;
  }

  primeraFechaSeleccionda() {
    for (let i = 0; i < this.semanas[0].fechas.length; i++) {
      if (this.semanas[0].fechas[i].habilitado) {
        this.SeleccionarEnvio(this.semanas[0].fechas[i]);
        break;
      }
    }
  }

  SeleccionarEnvio(item: any) {
    let resultado: any = this.buscarFechaFlete(item.fecha);
    this.itemSelectedindex = item.index;
    this.paginasIndex = this.semanaActual;
    this.itemSeleccionado.emit(resultado);
  }

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
    // ver cambios de pantalla //
  }

  /**
   * Obtiene la fecha del día de mañana
   * @returns
   */
  private getTomorrowDate(): Date {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    return tomorrowDate;
  }

  /**
   * Obtiene un flete desde la lista de fletes según la fecha ingresada.
   * @param fecha fecha en la que se quiere obtener un flete.
   * @returns
   */
  buscarFechaFlete(fecha: Date) {
    return this.fletes.find((flete: any) => {
      const fleteFecha = new Date(flete.fecha);
      return (
        fecha.getFullYear() === fleteFecha.getFullYear() &&
        fecha.getMonth() === fleteFecha.getMonth() &&
        fecha.getDate() === fleteFecha.getDate()
      );
    });
  }
}
