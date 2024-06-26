import * as moment from 'moment';

export class DateUtils {
  /**
   * Verificar si la fecha es un dia sábado.
   * @params fecha en string
   * @return
   */
  static isSaturday(value: string): boolean {
    const dia = value?.length
      ? moment(value).locale('es').format('dddd')
      : null;
    return dia === 'sábado';
  }
}
