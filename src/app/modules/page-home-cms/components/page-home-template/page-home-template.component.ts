// Angular
import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  afterNextRender,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
// Rxjs
import { Subscription, first } from 'rxjs';
// Models
import { IPage } from '@core/models-v2/cms/homePage-response.interface';
import { ISession } from '@core/models-v2/auth/session.interface';
// Services
import { SessionService } from '@core/services-v2/session/session.service';
import { CmsService } from '@core/services-v2/cms.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { GeolocationServiceV2 } from '@core/services-v2/geolocation/geolocation.service';
import { GeolocationStorageService } from '@core/storage/geolocation-storage.service';
import { ICustomerPreference } from '@core/services-v2/customer-preference/models/customer-preference.interface';
import { CustomerPreferenceService } from '@core/services-v2/customer-preference/customer-preference.service';
import { CustomerAddressService } from '@core/services-v2/customer-address/customer-address.service';
import { ChatService } from '@core/utils-v2/chat/chat.service';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-page-home-template',
  templateUrl: './page-home-template.component.html',
  styleUrls: ['./page-home-template.component.scss'],
})
export class PageHomeTemplateComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  preferenciasCliente!: ICustomerPreference;
  user!: ISession;

  //declarando la variable para ver los tipos
  carga: boolean = true;
  pageHome: IPage[] = [];

  lastLoadKey: string = '';
  subscription: Subscription = new Subscription();
  isMobile:boolean = false

  constructor(
    // Services V2
    private readonly sessionService: SessionService,
    private readonly csmService: CmsService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly geolocationService: GeolocationServiceV2,
    private readonly geolocationStorage: GeolocationStorageService,
    private readonly customerPreferenceService: CustomerPreferenceService,
    private readonly customerAddressService: CustomerAddressService,
    private renderer: Renderer2,
    public chatService: ChatService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    afterNextRender(() => {
      if(isPlatformBrowser(platformId)){
        const userAgent = window.navigator.userAgent;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        if(!this.isMobile)
          this.chatService.loadChatScript();
      }
    });
  }

  ngOnInit(): void {
    const storeSubscription = this.geolocationService.stores$
      .pipe(first((stores) => stores.length > 0))
      .subscribe({
        next: () => {
          this.user = this.sessionService.getSession();
          const geo = this.geolocationStorage.get();
          if (geo) {
            if (this.user.documentId !== '0') {
              this.customerPreferenceService
                .getCustomerPreferences()
                .subscribe({
                  next: (preferences) => {
                    this.preferenciasCliente = preferences;
                    this.getHomePageItems();
                  },
                });
            } else {
              this.getHomePageItems();
            }
          } else {
            this.getHomePageItems();
          }
        },
      });

    this.subscription.add(storeSubscription);
    if (isPlatformBrowser(this.platformId)) {
      this.chatService.showChatButton();
    }
  }

  ngAfterViewInit(): void {
    const selectedStoreSubscription =
      this.geolocationService.selectedStore$.subscribe({
        next: (location) => {
          this.getHomePageItems();
        },
      });

    this.subscription.add(selectedStoreSubscription);

    const sessionSubscription = this.authStateService.session$.subscribe(
      () => {
        this.customerPreferenceService.getCustomerPreferences().subscribe({
          next: (preferences) => {
            this.preferenciasCliente = preferences;
            this.getHomePageItems();
          },
        });
      }
    );

    this.subscription.add(sessionSubscription);

    const customerAddressSubscription =
      this.customerAddressService.customerAddress$.subscribe(
        (customerAddress) => {
          this.preferenciasCliente.deliveryAddress = customerAddress;
          this.getHomePageItems();
        }
      );

    this.subscription.add(customerAddressSubscription);
  }

  private getHomePageItems(): void {
    this.carga = true;
    this.user = this.sessionService.getSession();
    const rut = this.user.documentId;
    const tiendaSeleccionada = this.geolocationService.getSelectedStore();
    const sucursal = tiendaSeleccionada.code;
    const localidad = this.preferenciasCliente?.deliveryAddress
      ? this.preferenciasCliente.deliveryAddress.city
      : '';

    const loadKey = [rut, sucursal, localidad].join('-');
    if (this.lastLoadKey !== loadKey) {
      this.lastLoadKey = loadKey;
      this.csmService.getHomePage(rut, sucursal, localidad).subscribe({
        next: (res) => {
          this.pageHome = res.data[0].page;
          this.carga = false;
          this.scrollToTop();
        },
        error: (err) => {
          console.error(err);
          this.lastLoadKey = '';
          this.carga = false;
        },
      });
    } else {
      this.carga = false;
    }
  }

  scrollToTop(): void {
    const body_e = this.renderer.selectRootElement('body', true); // safari
    this.renderer.setProperty(body_e, 'scrollTop', 0);
    const html_e = this.renderer.selectRootElement('html', true); //other
    this.renderer.setProperty(html_e, 'scrollTop', 0);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (isPlatformBrowser(this.platformId)) {
      this.chatService.hideChatButton();
    }
  }
}
