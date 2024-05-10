// Angular
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// Libs
import { ToastrService } from 'ngx-toastr';
// Services
import { SessionService } from '@core/services-v2/session/session.service';
import { GeolocationApiService } from '@core/services-v2/geolocation/geolocation-api.service';
import { ICity } from '@core/services-v2/geolocation/models/city.interface';
import { CustomerAddressApiService } from '@core/services-v2/customer-address/customer-address-api.service';
import { firstValueFrom } from 'rxjs';
import { AddressType } from '@core/enums/address-type.enum';
import { DireccionMap } from '../map/map.component';

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.component.html',
  styleUrls: ['./add-address.component.scss'],
})
export class AddAddressComponent implements OnInit {
  @Output() respuesta = new EventEmitter<any>();
  @Output() respuestaInvitado = new EventEmitter<any>();
  @Input() invitado: boolean = false;

  cities!: ICity[];
  localidades!: any[];
  addressForm!: FormGroup;
  // tienda: any;
  tienda: DireccionMap | null;
  coleccionComuna!: any[];
  autocompletado: boolean = true;
  disableDireccion: boolean = true;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private readonly sessionService: SessionService,
    private readonly geolocationApiService: GeolocationApiService,
    private readonly customerAddressService: CustomerAddressApiService
  ) {
    this.buildForm();
    // this.tienda = {
    //   direccion: '',
    //   zona: '',
    // };
    this.tienda = null;
  }

  /**
   * Construir formulario para dirección.
   */
  private buildForm(): void {
    this.addressForm = this.fb.group({
      calle: [null, Validators.required],
      depto: [null],
      numero: [null, Validators.required],
      comuna: [null, Validators.required],
      localizacion: [null],
      latitud: [null],
      longitud: [null],
      referencia: [null],
    });
  }

  ngOnInit(): void {
    this.getCities();
  }

  setAddress(data: any[]) {
    console.log('data: ', data);
    //this.clearAddress();

    /* if(this.getAddressData(data[0], 'street_number')){ */
    const buscar = this.getAddressData(data[0], 'locality').toUpperCase();

    const existe = this.cities.filter((item) => item.city == buscar);

    if (existe.length) {
      this.addressForm.controls['comuna'].setValue(
        this.getCityId(this.getAddressData(data[0], 'locality'))
      );
    } else {
      this.addressForm.controls['comuna'].setValue(
        this.getCityId(
          this.getAddressData(data[0], 'administrative_area_level_3')
        )
      );
    }
    this.addressForm.controls['calle'].setValue(
      this.getAddressData(data[0], 'route')
    );
    this.getAddressData(data[0], 'street_number')
      ? this.addressForm.controls['numero'].setValue(
          this.getAddressData(data[0], 'street_number')
        )
      : this.addressForm.controls['numero'].setErrors({ completar: true });

    this.addressForm.controls['latitud'].setValue(data[1].lat);
    this.addressForm.controls['longitud'].setValue(data[1].lng);

    this.obtenerLocalidades({
      id: this.addressForm.controls['comuna'].value,
    });
    if (!this.invitado) {
      this.cargarDireccion();
    }
    /*  } */
  }

  getAddressData(address_components: any[], tipo: string) {
    let value = '';

    address_components.forEach((element) => {
      if (element.types[0] == tipo) {
        value = element.long_name;
        return;
      }
    });
    return value;
  }

  findComuna(nombre: string) {
    if (nombre != '') {
      nombre = this.quitarAcentos(nombre);

      var result = this.cities.find(
        (item) => this.quitarAcentos(item.city) === nombre
      );

      if (result && result.id) {
        return result.id;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  /**
   * Obtener id de una ciudad.
   * @param city
   * @returns
   */
  private getCityId(city: string): string {
    if (!city) return '';

    city = this.quitarAcentos(city);
    const result = this.cities.find(
      (item) => this.quitarAcentos(item.city) === city
    );

    if (result && result.id) {
      this.obtenerLocalidades(result);
      this.findComunaLocalizacion(result.city);
      return result.id;
    } else {
      return '';
    }
  }

  findComunaLocalizacion(nombre: string) {
    if (nombre != '') {
      nombre = this.quitarAcentos(nombre);

      var result = this.localidades.find(
        (data) => this.quitarAcentos(data.location) === nombre
      );

      if (result && result.location) {
        this.addressForm.controls['localizacion'].setValue(result.location);
      }
    }
    // nombre = nombre.split('@')[0];

    // if (nombre != '') {
    //   nombre = this.quitarAcentos(nombre);

    //   var result = this.localidades.find(
    //     (data) => this.quitarAcentos(data.localidad) === nombre
    //   );
    //   if (result && result.localidad) {
    //     this.addressForm.controls['localizacion'].setValue(result.localidad);
    //   }
    // }
  }

  quitarAcentos(cadena: string) {
    // Definimos los caracteres que queremos eliminar
    var specialChars = '!@#$^&%*()+=-[]/{}|:<>?,.';

    // Los eliminamos todos
    for (var i = 0; i < specialChars.length; i++) {
      cadena = cadena.replace(new RegExp('\\' + specialChars[i], 'gi'), '');
    }

    // Lo queremos devolver limpio en minusculas
    cadena = cadena.toLowerCase();

    // Quitamos espacios y los sustituimos por _ porque nos gusta mas asi
    cadena = cadena.replace(/ /g, '_');

    // Quitamos acentos y "ñ". Fijate en que va sin comillas el primer parametro
    cadena = cadena.replace(/á/gi, 'a');
    cadena = cadena.replace(/é/gi, 'e');
    cadena = cadena.replace(/í/gi, 'i');
    cadena = cadena.replace(/ó/gi, 'o');
    cadena = cadena.replace(/ú/gi, 'u');
    cadena = cadena.replace(/ñ/gi, 'n');

    return cadena;
  }

  emitirDireccion() {
    if (!this.invitado) {
      this.agregarDireccion();
    } else {
      this.cargarDireccionInvitado();
    }
  }

  async agregarDireccion() {
    const {
      calle,
      depto,
      numero,
      comuna,
      localizacion,
      latitud,
      longitud,
      referencia,
    } = this.addressForm.value;
    const comunaArr = comuna.split('@');
    const usuario = this.sessionService.getSession();

    const direccion = {
      documentId: usuario.documentId,
      addressType: AddressType.DELIVERY,
      region: comunaArr[2],
      city: comunaArr[0],
      number: numero.toString(),
      province: comunaArr[1],
      street: calle,
      location: localizacion,
      latitude: latitud,
      longitude: longitud,
      departmentOrHouse: depto || '',
      reference: referencia,
    };

    try {
      await firstValueFrom(
        this.customerAddressService.createAddress(direccion)
      );

      this.toastr.success('Se agrego con exito la dirección');
      this.respuesta.emit(true);
    } catch (e) {
      console.error(e);
      this.toastr.error('No se logro agregar la direccion');
      this.respuesta.emit(false);
    }
  }

  cargarDireccion() {
    this.tienda = null;
    if (!this.addressForm.valid) {
      return;
    }
    const { calle, numero, comuna, localizacion } = this.addressForm.value;
    const comunaArr = comuna.split('@');

    this.tienda = {
      direccion: `${calle} ${numero}`,
      zona: `${comunaArr[0]} ${localizacion}`,
    };
  }

  /**
   * Obtener ciudades.
   */
  private getCities(): void {
    this.geolocationApiService.getCities().subscribe({
      next: (cities) => (this.cities = cities),
    });
  }

  obtenerLocalidades(event: any) {
    const localidades: any[] = [];
    const comunaArr = event.id.split('@');
    const comunas = this.cities.filter(
      (comuna) => comuna.city == comunaArr[0]
    );
    comunas.map((comuna) =>
      comuna.localities.map((localidad: any) => localidades.push(localidad))
    );
    // const comunas: any[] = (this.coleccionComuna || []).filter(
    //   (comuna) => comuna.comuna == comunaArr[0]
    // );
    // comunas.map((comuna) =>
    //   comuna.localidades.map((localidad: any) => localidades.push(localidad))
    // );
    this.localidades = localidades;
    // this.findComunaLocalizacion(this.addressForm.controls['comuna'].value);
  }

  /**
   * Establecer coordenadas en el formulario.
   * @param coordinates
   */
  setCoordinates({ lat, lng }: google.maps.LatLngLiteral): void {
    this.addressForm.patchValue({
      latitud: lat,
      longitud: lng,
    });
  }

  clearAddress() {
    this.addressForm.setValue({
      calle: '',
      depto: '',
      numero: '',
      comuna: '',
      localizacion: '',
      referencia: '',
      latitud: '',
      longitud: '',
    });
  }

  hideNewAddress() {
    this.respuesta.emit(false);
  }

  cargarDireccionInvitado() {
    const dataSave = { ...this.addressForm.value };
    const arr = dataSave.comuna.split('@');

    const direccion = {
      calle: dataSave.calle,
      comunaCompleta: dataSave.comuna,
      comuna: arr[0],
      numero: dataSave.numero,
      depto: dataSave.depto,
      referencia: dataSave.referencia,
    };
    this.respuestaInvitado.emit(direccion);
  }
}
