// Angular
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Libs
import { ToastrService } from 'ngx-toastr';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
import { IConfig } from '@core/config/config.interface';
import { IBusinessLine } from '@core/services-v2/customer-business-line/business-line.interface';
import {
  ICity,
  ILocality,
} from '@core/services-v2/geolocation/models/city.interface';
import { IContactPosition } from '@core/services-v2/customer-contact/models/contact-positions.interface';
// Services
import { PasswordValidator } from '../../validations/password';
import { AngularEmailAutocompleteComponent } from '../angular-email-autocomplete/angular-email-autocomplete.component';
import { SessionStorageService } from '@core/storage/session-storage.service';
import { AuthApiService } from '@core/services-v2/auth/auth.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { CartService } from '@core/services-v2/cart.service';
import { CustomerBusinessLineApiService } from '@core/services-v2/customer-business-line/customer-business-line.api.service';
import { GeolocationApiService } from '@core/services-v2/geolocation/geolocation-api.service';
import { ConfigService } from '@core/config/config.service';
import { CustomerContactApiService } from '@core/services-v2/customer-contact/customer-contact-api.service';
import { CustomerApiService } from '@core/services-v2/customer/customer-api.service';
import { SessionTokenStorageService } from '@core/storage/session-token-storage.service';
import { GuestStorageService } from '@core/storage/guest-storage.service';
import { DocumentValidator } from '@core/validators/document-form.validator';
import {
  IEmailDomainAutocomplete,
  getEmailDomainsToAutocomplete,
} from '@core/utils-v2/email/domains-autocomplete';
import { removeSpecialCharacters } from './utils';
import { IMapPosition } from '../map/map-store.interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  @Input() innerWidth!: number;

  // Forms
  companyForm!: FormGroup;
  personForm!: FormGroup;
  commonForm!: FormGroup;
  addressForm!: FormGroup;

  // Select options
  localities!: ILocality[];
  cities!: ICity[];
  contactPositions!: IContactPosition[];
  businessLines!: IBusinessLine[];

  // userForm!: FormGroup;
  isInvoice = true;

  autocompletado = true;

  disableAddress = true;
  isPerson = false;
  checkBoxTerminos = false;
  checkBoxSuscribir = false;
  checkBoxEmpresa!: boolean;
  domains: IEmailDomainAutocomplete[] = [];
  cantMaxRut: number = 10;
  //
  selectedAddress!: { address: string; zone: string } | null;
  isDisabledDocumentId!: boolean;
  isValidDocumentId!: boolean;
  selectedPhoneCode: string;
  isLoading!: boolean;

  /**********************************
   * Config variables
   ***********************************/
  config: IConfig;
  maxPhone: number = 8;

  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router,
    // Services V2
    private readonly cartService: CartService,
    private readonly sessionStorage: SessionStorageService,
    private readonly authService: AuthApiService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly customerBusinessLineApiService: CustomerBusinessLineApiService,
    private readonly geolocationApiService: GeolocationApiService,
    private readonly customerContactApiService: CustomerContactApiService,
    private readonly customerApiService: CustomerApiService,
    private readonly configService: ConfigService,
    private readonly sessionTokenStorage: SessionTokenStorageService,
    private readonly guestStorage: GuestStorageService
  ) {
    this.config = this.configService.getConfig();
    this.selectedPhoneCode = this.config.phoneCodes.mobile.code;
    this.buildCompanyForm();
    this.buildPersonForm();
    this.buildCommonForm();
    this.buildAddressForm();
    //this.buildUserForm();
  }

  private buildPersonForm(): void {
    this.personForm = this.fb.group({
      documentId: [
        null,
        [Validators.required, DocumentValidator.isValidDocumentId],
      ],
    });
  }

  private buildCompanyForm(): void {
    this.companyForm = this.fb.group({
      documentId: [
        null,
        [Validators.required, DocumentValidator.isValidDocumentId],
      ],
      businessName: [null],
      businessLine: [null],
      contactDocumentId: [
        null,
        [Validators.required, DocumentValidator.isValidDocumentId],
      ],
      position: [null, Validators.required],
    });
  }

  private buildAddressForm(): void {
    this.addressForm = this.fb.group({
      street: [null, Validators.required],
      streetNumber: [null, Validators.required],
      city: [null, Validators.required],
      locality: [null],
      latitude: [null],
      longitude: [null],
      reference: [null],
      departmentOrHouse: [null],
    });
  }

  private buildCommonForm(): void {
    this.commonForm = this.fb.group(
      {
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        phone: [null, [Validators.required]],
        password: [
          ,
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(30),
          ],
        ],
        confirmPassword: [
          ,
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(30),
          ],
        ],
      },
      {
        validator: PasswordValidator.validate.bind(this),
      }
    );
    this.changePhoneCode(this.selectedPhoneCode);
  }

  ngOnInit(): void {
    this.getBusinessLines();
    this.getCities();
    this.domains = getEmailDomainsToAutocomplete();
    this.getContactPositions();
    //this.formBlock(true);
  }

  /*
  private buildUserForm(): void {
    this.userForm = this.fb.group(
      {
        documentId: [
          { value: null, disabled: true },
          [Validators.required, DocumentValidator.isValidDocumentId],
        ],
        contactDocumentId: [
          null,
          [Validators.required, DocumentValidator.isValidDocumentId],
        ],
        position: [null, Validators.required],
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        phone: [null, [Validators.required]],
        businessName: [null],
        businessLine: [null],
        street: [, Validators.required],
        streetNumber: [null, Validators.required],
        city: [null, Validators.required],
        locality: [null],
        latitude: [null],
        longitude: [null],
        reference: [''],
        departmentOrHouse: [''],
        password: [
          ,
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(30),
          ],
        ],
        confirmPassword: [
          ,
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(30),
          ],
        ],
      },
      {
        validator: PasswordValidator.validate.bind(this),
      }
    );
    // this.changePhoneCode(this.selectedPhoneCode);
  }*/

  /**
   * Obtener giros.
   */
  private getBusinessLines(): void {
    this.customerBusinessLineApiService.getBusinessLines().subscribe({
      next: (businessLines) => (this.businessLines = businessLines),
    });
  }

  /**
   * Obtener ciudades.
   */
  private getCities(): void {
    this.geolocationApiService.getCities().subscribe({
      next: (cities) => (this.cities = cities),
    });
  }

  /**
   * Obtener cargos.
   */
  private getContactPositions(): void {
    this.customerContactApiService.getContactPositions().subscribe({
      next: (contactPositions) => (this.contactPositions = contactPositions),
    });
  }

  private getUserData(isPerson: boolean) {
    if (isPerson) {
      const { documentId } = this.personForm.value;
      return { documentId };
    } else {
      const {
        documentId,
        businessName,
        businessLine,
        contactDocumentId,
        position,
      } = this.companyForm.value;
      return {
        documentId,
        businessName,
        businessLine,
        contactDocumentId,
        position,
      };
    }
  }

  /**
   * Registrar usuario.
   * @param email
   */
  registerUser(inputEmail: AngularEmailAutocompleteComponent): void {
    const email = inputEmail.inputValue;
    const {
      documentId,
      businessName,
      businessLine,
      contactDocumentId,
      position,
    } = this.getUserData(this.isPerson);
    const { firstName, lastName, phone, password } = this.commonForm.value;
    const {
      city,
      street,
      streetNumber,
      departmentOrHouse,
      locality,
      reference,
      latitude,
      longitude,
    } = this.addressForm.value;

    this.isLoading = true;
    const user = this.sessionStorage.get();
    const previousUser = user?.email || null;
    this.customerApiService
      .createUser({
        documentId,
        email,
        firstName,
        lastName,
        businessLine,
        businessName,
        isCompanyUser: this.isInvoice,
        // Contact
        position,
        phone: `${this.selectedPhoneCode}${phone}`,
        contactDocumentId,
        // Adress
        city,
        street,
        streetNumber,
        departmentOrHouse,
        locality,
        password,
        reference,
        latitude,
        longitude,
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.toastr.success(
            `Se ha registrado existosamente, puede continuar con el proceso de compra.`
          );
          this.authService.login(email, password).subscribe({
            next: ({ user, token }) => {
              const iva = user.preferences.iva ?? true;
              const session: ISession = {
                ...user,
                login_temp: false,
                preferences: { iva },
              };
              this.sessionStorage.set(session);
              this.authStateService.setSession(session);
              this.sessionTokenStorage.set(token);
              this.guestStorage.remove();

              if (previousUser) {
                this.cartService
                  .transferShoppingCart({
                    origin: previousUser,
                    destination: session.email,
                  })
                  .subscribe({ next: () => this.cartService.load() });
              } else {
                this.cartService.load();
              }
              this.router.navigate(['/inicio']);
            },
          });
        },
        error: (err) => {
          console.error(err);
          console.log(err.error);
          this.isLoading = false;
          this.toastr.error(
            err.message || `Ha ocurrido un error al registrar el usuario.`
          );
        },
      });
  }

  /**
   * Cambie el tipo de usuario a persona o empresa.
   */
  changeUserType(): void {
    this.isInvoice = !this.isInvoice;
    this.isPerson = !this.isPerson;
    this.companyForm.reset();
    this.personForm.reset();
    /*if (this.isInvoice) {
      // this.companyForm.reset();
      this.userForm.get('documentId')?.setValue(null);
      this.userForm.get('contactDocumentId')?.setValue(null);
      this.userForm
        .get('contactDocumentId')
        ?.setValidators([
          Validators.required,
          DocumentValidator.isValidDocumentId,
        ]);
      this.userForm.get('position')?.setValidators([Validators.required]);
      this.userForm.get('businessName')?.setValidators([Validators.required]);
      this.userForm.get('businessLine')?.setValidators([Validators.required]);
    } else {
      this.userForm.get('documentId')?.setValue(null);
      this.userForm.get('contactDocumentId')?.setValue(null);
      this.userForm.get('contactDocumentId')?.clearValidators();
      this.userForm.get('position')?.setValue(null);
      this.userForm.get('position')?.clearValidators();
      this.userForm.get('businessName')?.setValue(null);
      this.userForm.get('businessName')?.clearValidators();
      this.userForm.get('businessLine')?.setValue('');
      this.userForm.get('businessLine')?.clearValidators();
    }

    this.userForm.markAsUntouched();*/
    //this.isValidDocumentId = false;
    //this.formBlock(true);
  }

  /**
   * Verifica si el documento ingresado ya existe.
   * @param event
   */
  checkIfDocumentIdExists(form: FormGroup, event: Event): void {
    const input = event.target as HTMLInputElement;

    if (form.controls['documentId'].status === 'VALID') {
      const documentId = input.value.replace(/\./g, '');
      this.authService.checkDocumentId(documentId).subscribe({
        next: (res) => {
          if (res.exists) {
            this.toastr.warning(
              `El número de documento ingresado ya se encuentra registrado en nuestros sistemas.`
            );
          }
          this.isValidDocumentId = res.exists ? false : true;
          //this.formBlock();
        },
      });
    } else {
      this.isValidDocumentId = false;
      // this.formBlock();
    }
  }

  /*
  formBlock(force = false) {
    if (force) {
      this.isValidDocumentId = true;
    }

    if (this.isValidDocumentId) {
      this.isDisabledDocumentId = true;
      this.userForm.get('documentId')?.disable();
      this.userForm.get('contactDocumentId')?.enable();
      this.userForm.get('position')?.enable();
      this.userForm.get('firstName')?.enable();
      this.userForm.get('lastName')?.enable();
      this.userForm.get('phone')?.enable();
      this.userForm.get('password')?.enable();
      this.userForm.get('confirmPassword')?.enable();
      this.userForm.get('street')?.enable();
      this.userForm.get('city')?.enable();
      this.userForm.get('streetNumber')?.enable();
      this.userForm.get('departmentOrHouse')?.enable();
      this.userForm.get('reference')?.enable();

      if (this.isInvoice) {
        this.userForm.get('businessName')?.enable();
        this.userForm.get('businessLine')?.enable();
      }
    } else {
      this.isDisabledDocumentId = false;
      this.userForm.get('documentId')?.enable();
      this.userForm.get('contactDocumentId')?.disable();
      this.userForm.get('position')?.disable();
      this.userForm.get('firstName')?.disable();
      this.userForm.get('lastName')?.disable();
      this.userForm.get('phone')?.disable();
      this.userForm.get('password')?.disable();
      this.userForm.get('confirmPassword')?.disable();


      if (this.isInvoice) {
        this.userForm.get('businessName')?.disable();
        this.userForm.get('businessLine')?.disable();
      }
    }
  }*/

  /**
   * Eliminar rut del formulario.
   * @param form
   */
  cleanDocumentId(form: FormGroup): void {
    this.isValidDocumentId = false;
    //this.formBlock();
    form.get('documentId')?.setValue(null);
    form.get('documentId')?.markAsUntouched();
  }

  /**
   * Setear dirección seleccionada que utilizará el mapa.
   */
  setSelectedAddress(): void {
    this.selectedAddress = null;
    if (
      this.addressForm.controls['street'].value &&
      this.addressForm.controls['city'].value &&
      this.addressForm.controls['streetNumber'].value
    ) {
      const { street, streetNumber, city, locality } = this.addressForm.value;
      const splittedCity = city.split('@');
      this.selectedAddress = {
        address: `${street} ${streetNumber}`,
        zone: [splittedCity[0], locality].filter(Boolean).join(' '),
      };
    }
  }

  /**
   * Cambiar código teléfonico y setear validación del input telefónico.
   * @param phoneCode
   */
  changePhoneCode(phoneCode: string): void {
    this.selectedPhoneCode = phoneCode;

    if (this.selectedPhoneCode === this.config.phoneCodes.mobile.code) {
      this.commonForm.controls['phone'].setValidators([
        Validators.required,
        Validators.minLength(this.config.phoneCodes.mobile.lengthRule),
        Validators.maxLength(this.config.phoneCodes.mobile.lengthRule),
      ]);
      this.maxPhone = this.config.phoneCodes.mobile.lengthRule;
    } else {
      this.commonForm.controls['phone'].setValidators([
        Validators.required,
        Validators.minLength(this.config.phoneCodes.landline.lengthRule),
        Validators.maxLength(this.config.phoneCodes.landline.lengthRule),
      ]);
      this.maxPhone = this.config.phoneCodes.landline.lengthRule;
    }
    this.commonForm.get('phone')?.updateValueAndValidity();
  }

  registrar(): void {
    this.checkBoxSuscribir = !this.checkBoxSuscribir;
  }

  acepto(): void {
    this.checkBoxTerminos = !this.checkBoxTerminos;
  }

  /************************************************
   * Métodos utilizados por el mapa.
   ***********************************************/
  /**
   * Establecer la posición actual en el mapa.
   * @param event
   */
  setMapPosition({ lat, lng }: IMapPosition): void {
    this.addressForm.patchValue({
      latitude: lat,
      longitude: lng,
    });
  }

  /**
   * Limpiar campos asociados a dirección cuando se limpia el input desde el mapa.
   */
  cleanAddress(): void {
    this.addressForm.reset();
  }

  /**
   * Establecer dirección desde el mapa.
   * @param data
   */
  setAddressFromMap(data: any[]): void {
    this.cleanAddress();

    const street = this.getAddressData(data[0], 'route');
    const streetNumber = this.getAddressData(data[0], 'street_number');
    const locality = this.getAddressData(data[0], 'locality');
    const { lat: latitude, lng: longitude } = data[1];
    if (!streetNumber) return;

    this.disableAddress = false;

    if (locality) {
      const cityId = this.getSelectedCityId(locality);
      this.addressForm.controls['city'].setValue(cityId);
    } else {
      const locality = this.getAddressData(
        data[0],
        'administrative_area_level_3'
      );
      const cityId = this.getSelectedCityId(locality);
      this.addressForm.controls['city'].setValue(cityId);
    }
    this.addressForm.patchValue({
      street,
      streetNumber,
      latitude,
      longitude,
    });
    this.setSelectedAddress();
  }

  /**
   * Obtener atributo de un objeto google maps.
   * @param address_components
   * @param type
   * @returns
   */
  private getAddressData(address_components: any[], type: string): string {
    const itemExists = address_components.find(
      (item) => item.types[0] === type
    );
    return itemExists?.long_name || '';
  }

  /**
   * Obtener item de ciudad según la ciudad ingresada en el input del mapa.
   * @param city
   * @returns
   */
  private getSelectedCityId(city: string): string {
    if (!city) return '';
    const formattedCity = removeSpecialCharacters(city);
    const itemCity = this.cities.find(
      (item) => removeSpecialCharacters(item.city) === formattedCity
    );
    if (!itemCity) return '';
    this.localities = itemCity.localities;
    this.setLocality(formattedCity);
    return itemCity.id;
  }

  /**
   * Setear localidad en el formulario.
   * @param city
   * @returns
   */
  private setLocality(city: string): void {
    if (!city) return;
    const itemLocality = this.localities.find(
      (item) => removeSpecialCharacters(item.location) === city
    );
    if (itemLocality) {
      this.addressForm.controls['locality'].setValue(itemLocality.location);
    }
  }
}
