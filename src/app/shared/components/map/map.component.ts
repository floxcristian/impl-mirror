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
import { IMapPosition } from './map-store.interface';

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
  @Input() titulo!: string;
  @Input() storeAddress!: string;
  @Input() storeZone!: string;
  @Input() autocompletado!: boolean;
  @Input() infoWindowContent!: string;
  @ViewChild('search', { static: true }) searchElementRef!: ElementRef;

  showSearchBar: boolean = true;
  markerPositions: google.maps.LatLngLiteral[] = [];
  options!: google.maps.MapOptions;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 15;

  @Output() geolocalizacion = new EventEmitter<IMapPosition>();
  @Output() public clearAdress = new EventEmitter<any>();
  @Output() public setDireccion = new EventEmitter<any>();
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @Input() coordinates!: google.maps.LatLngLiteral;

  autocomplete!: google.maps.places.Autocomplete;
  isMapLoaded!: boolean;

  constructor(
    private ngZone: NgZone,
    private readonly geocoder: MapGeocoder,
    private readonly scriptService: ScriptService
  ) {}

  ngOnInit(): void {
    this.scriptService.loadScript(environment.gmapScript).then(() => {
      this.buildMap();
      this.isMapLoaded = true;
      if (this.coordinates) {
        this.updateMapByCoordinates(this.coordinates);
        this.showSearchBar = false;
      } else {
        this.geocodePosition();
      }
    });
  }

  private buildMap(): void {
    if (this.autocompletado) {
      this.options = {
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.HYBRID,
      };
      this.markerOptions.draggable = true;
      this.showSearchBar = false;
      this.zoom = 3;
      this.center.lat = -36.79975467819392;
      this.center.lng = -71.49897587245773;
      this.map?.panTo(this.center);
      this.markerPositions = [];
      this.markerPositions.push({
        lat: -36.79975467819392,
        lng: -71.49897587245773,
      });

      const country = environment.country;
      this.autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement,
        {
          types: ['address'],
          componentRestrictions: { country: country },
        }
      );
      this.autocomplete.setFields(['address_component', 'geometry']);
      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult =
            this.autocomplete.getPlace();
          if (!place.geometry) return;
          this.setDireccion.emit([
            place.address_components,
            place.geometry.location,
          ]);
          let center = {
            lat: place.geometry.location?.lat() || 0,
            lng: place.geometry.location?.lng() || 0,
          };
          this.zoom = 17;
          this.center = center;
          this.map.panTo(center);
          this.markerPositions = [];
          this.markerPositions.push(center);
        });
      });
    } else {
      this.options = {
        disableDefaultUI: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      };
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.storeAddress && this.isMapLoaded) {
      this.geocodePosition();
    }
  }

  private geocodePosition(): void {
    this.geocoder
      .geocode({
        address: `${this.storeAddress} ${this.storeZone}`,
      })
      .subscribe(({ status, results }) => {
        this.searchElementRef.nativeElement.value = this.storeAddress;
        if (status === google.maps.GeocoderStatus.OK) {
          const { location } = results[0].geometry;
          const center: google.maps.LatLngLiteral = {
            lat: location.lat(),
            lng: location.lng(),
          };
          this.center = center;
          this.map.panTo(center);
          this.markerPositions = [center];
          this.geolocalizacion.emit({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          this.markerPositions = [];
          this.geolocalizacion.emit({ lat: 0, lng: 0 });
        }
      });
  }

  markerDragEnd({ latLng }: google.maps.MapMouseEvent): void {
    if (this.autocompletado) {
      this.zoom = 17;
      let center: google.maps.LatLngLiteral = {
        lat: latLng?.lat() || 0,
        lng: latLng?.lng() || 0,
      };
      this.center = center;
      this.map.panTo(center);
      this.getAddress();
    }
  }

  getAddress(): void {
    this.geocoder.geocode({ location: this.center }).subscribe((location) => {
      if (location.status === 'OK') {
        if (location.results[0]) {
          this.setDireccion.emit([
            location.results[0].address_components,
            { lat: this.center.lat, lng: this.center.lng },
          ]);
          this.zoom = 17;
          this.searchElementRef.nativeElement.value =
            location.results[0].formatted_address;
        } else {
          window.alert('No se han encontrado resultados.');
        }
      } else {
        console.log('Geocoder error: ' + status);
      }
    });
  }

  clearSearch(): void {
    this.searchElementRef.nativeElement.value = '';
    this.clearAdress.emit();
  }

  /**
   * Actualiza el mapa centrando en las coordenadas especificadas y coloca un marcador en esa ubicación.
   * @param coordinates Objeto google.maps.LatLngLiteral que contiene las propiedades 'lat' y 'lng' para latitud y longitud.
   * @return void No retorna ningún valor.
   */
  updateMapByCoordinates(coordinates: google.maps.LatLngLiteral): void {
    const { lat, lng } = coordinates;
    const newCenter: google.maps.LatLngLiteral = { lat, lng };
    this.center = newCenter;
    this.map.panTo(newCenter);
    this.markerPositions = [newCenter];
  }
}
