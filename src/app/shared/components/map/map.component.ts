// Angular
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  NgZone,
  SimpleChanges,
} from '@angular/core';
import { GoogleMap, MapGeocoder } from '@angular/google-maps';
// Env
import { environment } from '@env/environment';
// Services
import { ScriptService } from '@core/utils-v2/script/script.service';
import { ConfigService } from '@core/config/config.service';
import { ToastrService } from 'ngx-toastr';

export interface DireccionMap {
  direccion: string;
  zona: string;
  lat?: string;
  lon?: string;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnChanges {
  @Input() title!: string;
  @Input() storeAddress!: string;
  @Input() storeZone!: string;
  @Input() autocompletado!: boolean;
  @Input() infoWindowContent!: string;
  @Input() coordinates!: google.maps.LatLngLiteral;
  @Output() changeCoordinates = new EventEmitter<google.maps.LatLngLiteral>();
  @Output() clearAddress = new EventEmitter<void>();
  @Output() changeAddress = new EventEmitter<any>();
  @ViewChild('search', { static: true }) searchElementRef!: ElementRef;
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

  showSearchBar: boolean = true;
  markerPositions: google.maps.LatLngLiteral[] = [];
  mapOptions!: google.maps.MapOptions;
  markerOptions: google.maps.MarkerOptions;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 15;

  autocomplete!: google.maps.places.Autocomplete;
  isMapLoaded!: boolean;
  defaultCoordinates: google.maps.LatLngLiteral;

  constructor(
    private ngZone: NgZone,
    private readonly geocoder: MapGeocoder,
    private readonly scriptService: ScriptService,
    private readonly configService: ConfigService,
    private readonly toast: ToastrService
  ) {
    this.markerOptions = { draggable: false };
    this.defaultCoordinates = this.configService.getConfig().mapCoordinates;
  }

  ngOnInit(): void {
    this.scriptService.loadScript(environment.gmapScript).then(() => {
      this.buildMap();
      this.isMapLoaded = true;
      if (this.coordinates) {
        this.showSearchBar = true;
        this.updateMapByCoordinates(this.coordinates);
      } else {
        this.getGeocodePosition(this.storeAddress, this.storeZone);
      }
    });
  }

  private buildMap(): void {
    if (this.autocompletado) {
      this.mapOptions = {
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.HYBRID,
      };
      this.showSearchBar = false;
      this.zoom = 3;
      this.updateMapByCoordinates(this.defaultCoordinates);

      this.autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement,
        {
          types: ['address'],
          componentRestrictions: { country: environment.country },
        }
      );
      this.autocomplete.setFields(['address_component', 'geometry']);
      // FIXME: al presionar enter, se debe seleccionar la primera opción que muestra el autocompletado.
      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = this.autocomplete.getPlace();
          /*console.log('autocomplete: ', this.autocomplete);
          const autocompleteOptions = this.autocomplete.getBounds();
          console.log('autocompleteOptions: ', autocompleteOptions);
          console.log('place: ', place);
          // TODO: validar si se obtiene la dirección correctamente.
          // TODO: getPlacePredictions
          const placePredictions = this.autocomplete.getFields();
          console.log('placePredictions: ', placePredictions);*/

          if (!place.geometry || !place.address_components) {
            // this.toast.error('Debe seleccionar una dirección válida.');

            return;
          }
          this.changeAddress.emit([
            place.address_components,
            place.geometry.location,
          ]);
          this.zoom = 17;
          const center = {
            lat: place.geometry.location?.lat() || 0,
            lng: place.geometry.location?.lng() || 0,
          };
          this.updateMapByCoordinates(center);
        });
      });
    } else {
      this.mapOptions = {
        disableDefaultUI: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.storeAddress && this.isMapLoaded) {
      this.getGeocodePosition(this.storeAddress, this.storeZone);
    }
    if (!changes['coordinates']?.firstChange && this.coordinates) {
      this.updateMapByCoordinates(this.coordinates);
    }
  }

  /**
   * Obtener coordenadas según el servicio de geocodificación de Google Maps.
   */
  private getGeocodePosition(storeAddress: string, storeZone: string): void {
    this.geocoder
      .geocode({
        address: `${storeAddress} ${storeZone}`,
      })
      .subscribe(({ status, results }) => {
        this.searchElementRef.nativeElement.value = this.storeAddress;
        if (status === google.maps.GeocoderStatus.OK) {
          const { location } = results[0].geometry;
          const coordinates = location.toJSON();
          this.updateMapByCoordinates(coordinates);
          this.changeCoordinates.emit(coordinates);
        } else {
          // TODO: catch error.
          this.markerPositions = [];
          this.changeCoordinates.emit({ lat: 0, lng: 0 });
        }
      });
  }

  /**
   * Limpia el input de búsqueda y emite un evento para limpiar el formulario de dirección.
   */
  clearSearchInput(): void {
    this.searchElementRef.nativeElement.value = '';
    this.clearAddress.emit();
  }

  /**
   * Actualiza el centrando del mapa en las coordenadas específicadas y coloca un marcador en esa ubicación.
   * @param coordinates Objeto `google.maps.LatLngLiteral` que contiene las propiedades `lat` y `lng` para latitud y longitud.
   * @return No retorna ningún valor.
   */
  private updateMapByCoordinates(
    coordinates: google.maps.LatLngLiteral
  ): void {
    this.center = coordinates;
    this.map?.panTo(coordinates);
    this.markerPositions = [coordinates];
  }
}
