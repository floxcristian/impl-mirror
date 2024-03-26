// Angular
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
// Libs
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
// Constants
import { AddressType } from '@core/enums/address-type.enum';
// Models
import { IError } from '@core/models-v2/error/error.interface';
// Services
import { SessionService } from '@core/services-v2/session/session.service';
import { CustomerAddressApiService } from '@core/services-v2/customer-address/customer-address-api.service';
import { GeolocationApiService } from '@core/services-v2/geolocation/geolocation-api.service';
import { ICity } from '@core/services-v2/geolocation/models/city.interface';
import { DireccionMap } from '../map/map.component';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.scss'],
})
export class AddressModalComponent implements OnInit {
  @Input() modalAddressRef!: BsModalRef;
  @Output() respuesta = new EventEmitter<any>();

  comunas!: any[];
  cities!: ICity[];
  localidades!: any[];
  formDireccion: FormGroup;
  tienda: DireccionMap | null;
  // tienda: any;
  coleccionComuna!: any[];
  autocompletado = true;
  loadingForm = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly customerAddressService: CustomerAddressApiService,
    private readonly geolocationApiService: GeolocationApiService
  ) {
    this.formDireccion = this.fb.group({
      calle: new FormControl(
        { value: null, disabled: true },
        { validators: [Validators.required] }
      ),
      depto: new FormControl(''),
      numero: new FormControl(null),
      comuna: new FormControl(null, { validators: [Validators.required] }),
      localizacion: new FormControl(null, {
        validators: [Validators.required],
      }),
      latitud: new FormControl(null),
      longitud: new FormControl(null),
      referencia: new FormControl(null),
    });
    this.tienda = null;
  }

  ngOnInit(): void {
    this.getCities();
  }

  set_direccion(data: any[]) {
    this.clearAddress();

    if (this.getAddressData(data[0], 'street_number')) {
      this.formDireccion.controls['calle'].enable();

      if (this.getAddressData(data[0], 'locality')) {
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
      this.formDireccion.controls['numero'].setValue(
        this.getAddressData(data[0], 'street_number')
      );
      this.formDireccion.controls['latitud'].setValue(data[1].lat);
      this.formDireccion.controls['longitud'].setValue(data[1].lng);

      this.cargarDireccion();
    }
  }

  getAddressData(address_components: any[], tipo: string) {
    let value = '';

    address_components.forEach((element: any) => {
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

      var result = this.comunas.find(
        (data) => this.quitarAcentos(data.value) === nombre
      );

      if (result && result.id) {
        this.obtenerLocalidades(result);
        this.findComunaLocalizacion(result.value);
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

  async agregarDireccion() {
    this.loadingForm = true;
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

    this.customerAddressService.createAddress(direccion).subscribe({
      next: (_) => {
        this.toastr.success('Se agrego con exito la dirección');
        this.respuesta.emit(true);
        this.modalAddressRef.hide();
        this.loadingForm = false;
      },
      error: (err: IError) => {
        this.toastr.error('No se logro agregar la direccion');
        this.respuesta.emit(false);
        this.loadingForm = false;
      },
    });
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
    const localidades: any = [];
    const comunaArr = event.id.split('@');
    const comunas = this.cities.filter(
      (comuna) => comuna.city == comunaArr[0]
    );
    comunas.map((comuna) =>
      comuna.localities.map((localidad: any) => localidades.push(localidad))
    );
    this.localidades = localidades;
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
}
