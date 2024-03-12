import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  TemplateRef,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { RootService } from '../../../../shared/services/root.service';
import { esEmpresa } from '../../../../shared/interfaces/login';
import { Subject } from 'rxjs';
import { isVacio } from '../../../../shared/utils/utilidades';
import { ToastrService } from 'ngx-toastr';
import { DireccionDespachoComponent } from '../../../../modules/header/components/search-vin-b2b/components/direccion-despacho/direccion-despacho.component';
import {
  DataModal,
  ModalComponent,
  TipoIcon,
  TipoModal,
} from '../../../../shared/components/modal/modal.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { isPlatformBrowser } from '@angular/common';
import { SessionStorageService } from '@core/storage/session-storage.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { IEcommerceUser } from '@core/models-v2/auth/user.interface';
import { AuthApiService } from '@core/services-v2/auth/auth.service';
import {
  ICustomer,
  ICustomerAddress,
  ICustomerContact,
} from '@core/models-v2/customer/customer.interface';
import { CustomerContactService } from '@core/services-v2/customer-contact.service';
import { CustomerAddressApiService } from '@core/services-v2/customer-address/customer-address-api.service';
import { IError } from '@core/models-v2/error/error.interface';
import { CustomerPreferenceApiService } from '@core/services-v2/customer-preference/customer-preference-api.service';
import { AddressType } from '@core/enums/address-type.enum';
import { CustomerPreferencesStorageService } from '@core/storage/customer-preferences-storage.service';
import { CustomerPreferenceService } from '@core/services-v2/customer-preference/customer-preference.service';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';

@Component({
  selector: 'app-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.scss'],
})
export class PageProfileComponent implements OnDestroy, OnInit {
  session!: ISession;
  dataUser!: IEcommerceUser;
  dataClient!: ICustomer;
  addresses!: ICustomerAddress[];
  contacts!: ICustomerContact[];
  direccionDespacho!: ICustomerAddress | null | undefined;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dtTriggerContacts: Subject<any> = new Subject();
  loadingClient = true;
  cargandoIVA = false;
  @ViewChild('modalAddress', { static: false })
  modalAddress!: TemplateRef<any>;
  @ViewChild('modalUpdateAddress', { static: false })
  modalUpdateAddress!: TemplateRef<any>;
  @ViewChild('modalAddContact', { static: false })
  modalAddContact!: TemplateRef<any>;
  @ViewChild('modalUpdateContact', { static: false })
  modalUpdateContact!: TemplateRef<any>;
  @ViewChild('modalEdit', { static: false }) modalEdit!: TemplateRef<any>;
  @ViewChild('modalPassword', { static: false })
  modalPassword!: TemplateRef<any>;
  modalAddressRef!: BsModalRef;
  modalUpdateAddressRef!: BsModalRef;
  modalAddContactRef!: BsModalRef;
  modalUpdateContactRef!: BsModalRef;
  modalEditRef!: BsModalRef;
  modalPasswordRef!: BsModalRef;
  innerWidth: number;
  isVacio = isVacio;
  direccionSeleccionada!: ICustomerAddress;
  contactoSeleccionada!: ICustomerContact;

  ADDRESS_TYPE = AddressType;
  config!: IConfig;

  constructor(
    private root: RootService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    @Inject(PLATFORM_ID) private platformId: Object,
    // Storage
    private readonly sessionStorage: SessionStorageService,
    private readonly sessionService: SessionService,
    // Services V2
    private readonly authService: AuthApiService,
    private readonly authState: AuthStateServiceV2,
    private readonly customerContactService: CustomerContactService,
    private readonly customerAddressService: CustomerAddressApiService,
    private readonly customerPreferenceApiService: CustomerPreferenceApiService,
    private readonly customerPreferencesStorage: CustomerPreferencesStorageService,
    private readonly customerPreferenceService: CustomerPreferenceService,
    private readonly configService: ConfigService
  ) {
    this.session = this.sessionService.getSession();
    this.innerWidth = isPlatformBrowser(this.platformId)
      ? window.innerWidth
      : 900;
    this.config = this.configService.getConfig();
  }

  ngOnInit(): void {
    this.getDataClient();
    this.getCustomerPreferences();
    this.dtOptions = this.root.simpleDtOptions;
  }

  /**
   * Obtener preferencias del cliente.
   */
  private getCustomerPreferences(): void {
    this.customerPreferenceService
      .getCustomerPreferences()
      .subscribe(
        ({ deliveryAddress }) => (this.direccionDespacho = deliveryAddress)
      );
  }

  getDataClient() {
    this.loadingClient = true;
    this.authService.me().subscribe(({ user, customer }) => {
      this.dataUser = user;
      this.dataClient = customer;
      this.setTableAddresses(this.dataClient.addresses);
      this.setTableContacts(this.dataClient.contacts);
      this.loadingClient = false;
    });
  }

  setTableAddresses(addresses: ICustomerAddress[]) {
    this.addresses = addresses;
    this.dtTrigger.next(null);
  }

  setTableContacts(contacts: ICustomerContact[]) {
    this.contacts = contacts;
    this.dtTriggerContacts.next(null);
  }

  updateIvaPreference(): void {
    const iva =
      !this.session.preferences.iva; /*isVacio(this.session.preferences.iva)
      ? false
      : !this.session.preferences.iva;*/

    this.customerPreferenceApiService.updatePreferenceIva(iva).subscribe({
      next: () => {
        this.toastr.success(
          'Se actualizo con exito la configuración del IVA.'
        );
        this.updateSessionOnStorage(iva);
        // FIXME: actualizar observable.c
        this.session = this.sessionService.getSession();
      },
      error: () => {
        this.toastr.error('No se logro actualizar la configuración del IVA');
      },
    });
  }

  updateSessionOnStorage(iva: boolean): void {
    const session = this.sessionService.getSession();
    session.preferences.iva = iva;
    this.sessionStorage.set(session);
    this.authState.setSession(session);
  }

  openModalAddAddress(): void {
    this.modalAddressRef = this.modalService.show(this.modalAddress, {
      ignoreBackdropClick: true,
    });
  }

  openModalUpdateAddAddress(direccion: ICustomerAddress) {
    this.direccionSeleccionada = direccion;
    this.modalUpdateAddressRef = this.modalService.show(
      this.modalUpdateAddress,
      { ignoreBackdropClick: true }
    );
  }

  deleteAddress(direccion: ICustomerAddress) {
    const initialState: DataModal = {
      titulo: 'Confirmación',
      mensaje: `¿Esta seguro que desea <strong>eliminar</strong> esta direccion?<br><br>
                      Calle: <strong>${direccion.street}</strong><br>
                      Número: <strong>${direccion.number}</strong>`,
      tipoIcon: TipoIcon.QUESTION,
      tipoModal: TipoModal.QUESTION,
    };
    const bsModalRef: BsModalRef = this.modalService.show(ModalComponent, {
      initialState,
      ignoreBackdropClick: true,
    });
    bsModalRef.content.event.subscribe(async (res: any) => {
      if (res) {
        const documentId = this.dataClient.documentId;
        const addressId = direccion.id;
        this.customerAddressService
          .deleteAddress(documentId, addressId)
          .subscribe({
            next: (_) => {
              this.toastr.success('Dirección eliminada exitosamente.');
              this.respuesta(true);
            },
            error: (err: IError) => {
              this.toastr.error(err.message);
            },
          });
      }
    });
  }

  openModalAddContact() {
    this.modalAddContactRef = this.modalService.show(this.modalAddContact, {
      ignoreBackdropClick: true,
      class: 'modal-addContact',
    });
  }

  openModalUpdateContact(contacto: ICustomerContact) {
    this.contactoSeleccionada = contacto;
    this.modalUpdateContactRef = this.modalService.show(
      this.modalUpdateContact,
      { ignoreBackdropClick: true, class: 'modal-updateContact' }
    );
  }

  deleteContact(contacto: ICustomerContact) {
    const initialState: DataModal = {
      titulo: 'Confirmación',
      mensaje: `¿Esta seguro que desea <strong>eliminar</strong> este contacto?<br><br>
                      Nombre: <strong>${contacto.name} ${
        contacto.lastName || ''
      }</strong><br>
                      Tipo: <strong>${contacto.contactType}</strong>`,
      tipoIcon: TipoIcon.QUESTION,
      tipoModal: TipoModal.QUESTION,
    };
    const bsModalRef: BsModalRef = this.modalService.show(ModalComponent, {
      initialState,
    });
    bsModalRef.content.event.subscribe(async (res: any) => {
      if (res) {
        const documentId = this.dataClient.documentId;
        const contactId = contacto.id;
        this.customerContactService
          .deleteContact(documentId, contactId)
          .subscribe({
            next: (_) => {
              this.toastr.success('Contacto eliminado exitosamente.');
              this.respuesta(true);
            },
            error: (err: IError) => {
              this.toastr.error(err.message);
            },
          });
      }
    });
  }

  openModalEditProfile() {
    this.modalEditRef = this.modalService.show(this.modalEdit, {
      ignoreBackdropClick: true,
    });
  }

  openModalPassword() {
    this.modalPasswordRef = this.modalService.show(this.modalPassword, {
      ignoreBackdropClick: true,
    });
  }

  respuesta(event: boolean): void {
    if (!event) return;
    this.session = this.sessionService.getSession();
    this.getDataClient();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
  }

  esEmpresa(): boolean {
    return esEmpresa(this.dataUser);
  }

  modificarDireccionDespacho() {
    const bsModalRef: BsModalRef = this.modalService.show(
      DireccionDespachoComponent
    );
    bsModalRef.content.event.subscribe(async (res: any) => {
      const direccionDespacho = res;
      this.direccionDespacho = direccionDespacho;
      const preferences = this.customerPreferencesStorage.get();
      preferences.deliveryAddress = direccionDespacho;
      this.customerPreferencesStorage.set(preferences);
    });
  }
}
