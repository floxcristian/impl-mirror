import { Pipe, PipeTransform } from '@angular/core';

export const STATUS_TRANSLATIONS : { [key: string]: string } = {
  open : 'Abierto',
  pending : 'Pendiente',
  saved : 'Guardado',
  generated : 'Generado',
  deleted : 'Eliminado',
  finalized : 'Finalizado',
  rejected : 'Rechazado',
};

@Pipe({
  name: 'translateStatus'
})
export class TranslateStatusPipe implements PipeTransform {
  transform(value: string): string {
    if (value === undefined || value === null || value.trim() === '') {
      return 'Desconocido';
    }
    return STATUS_TRANSLATIONS[value] || value;
  }
}
