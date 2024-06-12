import * as moment from 'moment';

export class DateUtils {
  /**
   * @desc Verificar si la fecha es un dia sábado.
   * @params fecha en string
   * @return
   */
  static isSaturday(value: string): boolean {
    let isSabado = false;
    let dia =
      value && value.length > 0
        ? moment(value).locale('es').format('dddd')
        : null;
    isSabado = dia && dia === 'sábado' ? true : false;
    return isSabado;
  }
}
