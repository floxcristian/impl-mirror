import { AbstractControl } from '@angular/forms';

export function isVacio(valor: any) {
  if (typeof valor === 'string') {
    valor = valor.trim();
  }
  return (
    valor === '' ||
    valor === undefined ||
    valor === 'undefined' ||
    valor === null ||
    valor === 'null' ||
    valor.length === 0
  );
}

export function dataURLtoFile(dataurl: any, filename: any) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

export function calculaIcono(extension: string) {
  let icono = '';

  switch (extension.toLowerCase()) {
    // case 'doc':
    // case 'docx':
    //     icono = 'fa fa-file-word-o text-primary fa-lg';
    //     break;
    case 'xls':
    case 'xlsx':
    case 'csv':
      icono = 'far fa-file-excel text-success fa-lg';
      break;
    case 'pdf':
      icono = 'far fa-file-pdf text-red-500 fa-lg';
      break;
    // case 'ppt':
    // case 'pptx':
    //     icono = 'fa fa-file-powerpoint-o text-red-500 fa-lg';
    //     break;
    // case 'txt':
    // case 'log':
    //     icono = 'fa fa-file-text-o text-muted fa-lg';
    //     break;
    // case 'xml':
    //     icono = 'fa fa-file-code-o text-success fa-lg';
    //     break;
    // case 'jpg':
    //     icono = 'fa fa-file-image-o text-red-500 fa-lg';
    //     break;
    // case 'gif':
    //     icono = 'fa fa-file-image-o text-muted fa-lg';
    //     break;
    // case 'png':
    //     icono = 'fa fa-file-image-o text-primary fa-lg';
    //     break;
    // case 'bmp':
    //     icono = 'fa fa-file-image-o text-info fa-lg';
    //     break;
    // case 'rar':
    // case 'zip':
    //     icono = 'fa fa-file-archive-o text-muted fa-lg';
    //     break;
    default:
      icono = 'far fa-file text-muted fa-lg';
      break;
  }
  return icono;
}

export function rutPersonaValidator(
  control: AbstractControl
): { [key: string]: boolean } | null {
  const rut = control.value;
  const rexp = new RegExp(/^([0-9])+\-([kK0-9])+$/);

  if (rut === null) {
    return { invalidDocumentId: true };
  }

  if (rut.match(rexp)) {
    const RUT = rut.split('-');
    const elRut = RUT[0];

    if (elRut < 50000000) {
      return null;
    } else {
      return { invalidDocumentId: true };
    }
  } else {
    return { invalidDocumentId: true };
  }
}

export function rutValidator(
  control: AbstractControl
): { [key: string]: boolean } | null {
  const rut = control.value;
  const rexp = new RegExp(/^([0-9])+\-([kK0-9])+$/);

  if (rut === null) {
    return { rutMalo: true };
  }

  if (rut.match(rexp)) {
    const RUT = rut.split('-');
    const elRut = RUT[0];
    let factor = 2;
    let suma = 0;
    let dv: string;
    for (let i = elRut.length - 1; i >= 0; i--) {
      factor = factor > 7 ? 2 : factor;
      // tslint:disable-next-line: radix
      suma += parseInt(elRut[i]) * factor++;
    }
    dv = (11 - (suma % 11)).toString();
    if (dv === '11') {
      dv = '0';
    } else if (dv === '10') {
      dv = 'k';
    }

    if (dv === RUT[1].toLowerCase()) {
      return null;
    } else {
      return { rutMalo: true };
    }
  } else {
    return { rutMalo: true };
  }
}
