import { ShippingDateItem } from '@shared/interfaces/address';
import * as moment from 'moment';

export class CartShippingUtils {
  /**
   * Obtener descripción para el retiro en tienda.
   * @param shippingDates
   * @param currentDate
   * @returns
   */
  static getPickupDescription(
    shippingDates: ShippingDateItem[],
    currentDate: string
  ) {
    if (!shippingDates.length) return '';
    let menor = shippingDates[0].fechas?.[0].fecha;
    let menor_fecha: any = new Date(menor);
    shippingDates.map((item) => {
      let fecha_comparar: any = new Date(item.fechas?.[0].fecha);
      if (menor_fecha.getTime() >= fecha_comparar.getTime()) {
        menor = item.fechas?.[0].fecha;
        menor_fecha = new Date(menor);
      }
    });

    if (moment(menor).startOf('day').toISOString() === currentDate) {
      return 'Retira Hoy';
    } else if (moment(menor).weekday() == 1) return 'Retira el día lunes';
    else if (moment(menor).weekday() == 2) return 'Retira el día martes';
    else if (moment(menor).weekday() == 3) return 'Retira el día miercoles';
    else if (moment(menor).weekday() == 4) return 'Retira el día jueves';
    else if (moment(menor).weekday() == 5) return 'Retira el día viernes';
    else if (moment(menor).weekday() == 6) return 'Retira el día  sabado';
    else if (moment(menor).weekday() == 7) return 'Retira el día  domingo';
    else return '';
  }
}
