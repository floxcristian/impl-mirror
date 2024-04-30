// Angular
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
// Services
import { LocalStorageService } from 'src/app/core/modules/local-storage/local-storage.service';
import { SessionService } from '@core/services-v2/session/session.service';
import { AuthStateServiceV2 } from '@core/services-v2/session/auth-state.service';
import { MenuService } from '@core/services-v2/menu/menu.service';
import { CustomerPreferenceService } from '@core/services-v2/customer-preference/customer-preference.service';
import { DropdownDirective } from '@shared/directives/dropdown.directive';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {


  @ViewChild('menuUser', { static: false }) menuUser!: DropdownDirective;
  usuario!: ISession;

  mostrarMenu: boolean = false;
  mostrarBienvenida: boolean = false;
  linkMiCuenta = [
    {
      label: 'Mi perfil',
      url: ['/', 'mi-cuenta', 'resumen'],
      icon: 'far fa-user',
    },
  ];
  isB2B: boolean = false;
  linksOcultosB2B = [
    'Resumen',
    'Portal de pagos',
    'Cargar Masiva Productos',
    'Seguimiento',
  ];

  constructor(
    public localS: LocalStorageService,
    private cd: ChangeDetectorRef,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly authStateService: AuthStateServiceV2,
    private readonly menuService: MenuService,
    private readonly customerPreferenceService: CustomerPreferenceService
  ) {}

  ngOnInit() {
    this.usuario = this.sessionService.getSession();
    if (this.usuario.documentId !== '0') {
      this.fetchCustomerPreferences();
    }
    this.isB2B = this.sessionService.isB2B();

    this.authStateService.session$.subscribe((user) => {
      this.usuario = user;
      this.mostrarMenu = true;
      this.mostrarBienvenida = true;
      this.linkMiCuenta = this.menuService.get(this.usuario.userRole);

      if (this.isB2B) {
        this.linkMiCuenta = this.linkMiCuenta.filter(
          (l) => !this.linksOcultosB2B.includes(l.label)
        );
      }
      this.fetchCustomerPreferences();
    });

    if (this.usuario) {
      this.linkMiCuenta = this.menuService.get(this.usuario.userRole);
      if (this.isB2B) {
        this.linkMiCuenta = this.linkMiCuenta.filter(
          (l) => !this.linksOcultosB2B.includes(l.label)
        );
      }
    }
    this.cd.detectChanges();
  }

  cambiaElementosMenu(value: any) {
    this.mostrarMenu = value;
  }

  cerrarBienvenida() {
    this.mostrarBienvenida = false;
  }

  private fetchCustomerPreferences(): void {
    this.customerPreferenceService.getCustomerPreferences().subscribe({
      next: (preferences) => {},
    });
  }

  openLogin(){
    this.menuUser.toggle()
  }
}
