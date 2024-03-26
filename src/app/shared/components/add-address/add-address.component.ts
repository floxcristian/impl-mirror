// Angular
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
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
  formDireccion: FormGroup;
  // tienda: any;
  tienda: DireccionMap | null;
  coleccionComuna!: any[];
  autocompletado: boolean = true;
  disableDireccion: boolean = true;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly geolocationApiService: GeolocationApiService,
    private readonly customerAddressService: CustomerAddressApiService
  ) {
    this.formDireccion = this.fb.group({
      calle: new FormControl(null, {
        validators: [Validators.required],
      }),
      depto: new FormControl(null),
      numero: new FormControl(null, {
        validators: [Validators.required],
      }),
      comuna: new FormControl(null, {
        validators: [Validators.required],
      }),
      localizacion: new FormControl(null),
      latitud: new FormControl(null),
      longitud: new FormControl(null),
      referencia: new FormControl(null),
    });
    // this.tienda = {
    //   direccion: '',
    //   zona: '',
    // };
    this.tienda = null;
  }

  ngOnInit() {
    this.getCities();
  }

  set_direccion(data: any[]) {
    //this.clearAddress();

    /* if(this.getAddressData(data[0], 'street_number')){ */
    const buscar = this.getAddressData(data[0], 'locality').toUpperCase();

    const existe = this.cities.filter((item) => item.city == buscar);

    if (existe.length != 0) {
      this.formDireccion.controls['comuna'].setValue(
        this.getCityId(this.getAddressData(data[0], 'locality'))
      );
    } else {
      this.formDireccion.controls['comuna'].setValue(
        this.getCityId(
          this.getAddressData(data[0], 'administrative_area_level_3')
        )
      );
    }
    this.formDireccion.controls['calle'].setValue(
      this.getAddressData(data[0], 'route')
    );
    this.getAddressData(data[0], 'street_number')
      ? this.formDireccion.controls['numero'].setValue(
          this.getAddressData(data[0], 'street_number')
        )
      : this.formDireccion.controls['numero'].setErrors({ completar: true });

    this.formDireccion.controls['latitud'].setValue(data[1].lat);
    this.formDireccion.controls['longitud'].setValue(data[1].lng);

    this.obtenerLocalidades({
      id: this.formDireccion.controls['comuna'].value,
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
        this.formDireccion.controls['localizacion'].setValue(result.location);
      }
    }
    // nombre = nombre.split('@')[0];

    // if (nombre != '') {
    //   nombre = this.quitarAcentos(nombre);

    //   var result = this.localidades.find(
    //     (data) => this.quitarAcentos(data.localidad) === nombre
    //   );
    //   if (result && result.localidad) {
    //     this.formDireccion.controls['localizacion'].setValue(result.localidad);
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
    } = this.formDireccion.value;
    const comunaArr = comuna.split('@');
    const usuario = this.sessionService.getSession(); //: Usuario = this.root.getDataSesionUsuario();

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
    if (!this.formDireccion.valid) {
      return;
    }
    const { calle, numero, comuna, localizacion } = this.formDireccion.value;
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
    // this.findComunaLocalizacion(this.formDireccion.controls['comuna'].value);
  }

  geolocalizacion(event: any) {
    this.formDireccion.controls['latitud'].setValue(event.lat);
    this.formDireccion.controls['longitud'].setValue(event.lng);
  }

  clearAddress() {
    this.formDireccion.setValue({
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
    const dataSave = { ...this.formDireccion.value };
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
