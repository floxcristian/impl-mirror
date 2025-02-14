// Angular
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
// Libs
import { ToastrService } from 'ngx-toastr';
import { BsModalRef } from 'ngx-bootstrap/modal';
// Models
import { AddressType } from '@core/enums/address-type.enum';
// Services
import { DireccionMap } from '../map/map.component';
import { SessionService } from '@core/services-v2/session/session.service';
import { ICustomerAddress } from '@core/models-v2/customer/customer.interface';
import { CustomerAddressApiService } from '@core/services-v2/customer-address/customer-address-api.service';
import { IError } from '@core/models-v2/error/error.interface';
import {
  ICity,
  ILocality,
} from '@core/services-v2/geolocation/models/city.interface';
import { GeolocationApiService } from '@core/services-v2/geolocation/geolocation-api.service';

@Component({
  selector: 'app-update-address-modal',
  templateUrl: './update-address-modal.component.html',
  styleUrls: ['./update-address-modal.component.scss'],
})
export class UpdateAddressModalComponent implements OnInit {
  @Input() modalUpdateAddressRef!: BsModalRef;
  @Input() direccion!: ICustomerAddress;
  @Output() respuesta = new EventEmitter<boolean>();

  cities!: ICity[];
  localidades!: ILocality[];
  address!: DireccionMap | null;
  formDireccion!: FormGroup;
  autocompletado = true;
  loadingForm = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly customerAddressService: CustomerAddressApiService,
    private readonly geolocationApiService: GeolocationApiService
  ) {}

  ngOnInit(): void {
    this.getCities();

    const { street, number, city, location } = this.direccion;
    const comunaArr = city.split('@');

    this.address = {
      direccion: `${street} ${number}`,
      zona: `${comunaArr[0]} ${location}`,
    };

    this.formDireccion = this.fb.group({
      calle: new FormControl(this.direccion.street, {
        validators: [Validators.required],
      }),
      depto: new FormControl(this.direccion.departmentHouse),
      numero: new FormControl(this.direccion.number, {
        validators: [Validators.required],
      }),
      comuna: new FormControl(null, {
        validators: [Validators.required],
      }),
      localizacion: new FormControl(this.direccion.location),
      latitud: new FormControl(this.direccion.lat),
      longitud: new FormControl(this.direccion.lng),
      referencia: new FormControl(this.direccion.reference),
    });
  }

  set_direccion(data: any[]) {
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

    this.cargarDireccion();
  }

  getAddressData(address_components: any[], tipo: string) {
    let value = '';

    address_components.forEach((element) => {
      // tslint:disable-next-line: triple-equals
      if (element.types[0] == tipo) {
        value = element.long_name;
        return;
      }
    });
    return value;
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

      const result = this.localidades.find(
        (data) => this.quitarAcentos(data.location) === nombre
      );

      if (result && result.location) {
        this.formDireccion.controls['localizacion'].setValue(result.location);
      }
    }
  }

  quitarAcentos(cadena: string) {
    // Definimos los caracteres que queremos eliminar
    const specialChars = '!@#$^&%*()+=-[]/{}|:<>?,.';

    // Los eliminamos todos
    for (let i = 0; i < specialChars.length; i++) {
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

  async actualizarDireccion() {
    this.loadingForm = true;
    this.cargarDireccion();

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
    const { documentId } = this.sessionService.getSession();

    const direccion: any = {
      addressId: this.direccion.id,
      documentId: documentId,
      addressType: AddressType.DELIVERY,
      region: comunaArr[2],
      city: comunaArr[0],
      number: numero.toString(),
      province: comunaArr[1],
      street: calle,
      location: localizacion,
      latitude: latitud,
      longitude: longitud,
      departmentOrHouse: depto || "",
      reference: referencia,
    };

    this.customerAddressService.updateAddress(direccion).subscribe({
      next: () => {
        this.toastr.success('Se actualizó la dirección correctamente');
        this.respuesta.emit(true);
        this.modalUpdateAddressRef.hide();
        this.loadingForm = false;
      },
      error: (err: IError) => {
        this.toastr.error('Ocurrió un error al actualizar la dirección');
        this.respuesta.emit(false);
        this.modalUpdateAddressRef.hide();
      },
    });
  }

  cargarDireccion() {
    this.address = null;
    if (!this.formDireccion.valid) {
      return;
    }
    const { calle, numero, comuna, localizacion } = this.formDireccion.value;
    const comunaArr = comuna.split('@');

    this.address = {
      direccion: `${calle} ${numero}`,
      zona: `${comunaArr[0]} ${localizacion}`,
    };
  }

  /**
   * Obtener ciudades y establecer la ciudad actual en el formulario.
   */
  private getCities(): void {
    this.geolocationApiService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
        const currentAddress = cities.find(
          (item) => item.city === this.direccion.city
        );
        if (currentAddress) {
          this.formDireccion.controls['comuna'].setValue(currentAddress.id);
        }
      },
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
