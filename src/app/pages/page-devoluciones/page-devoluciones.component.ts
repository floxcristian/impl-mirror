// Angular
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// Libs
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
// Services
import { ClientsService } from '../../shared/services/clients.service';
import { DevolucionOkModalComponent } from '../components/devolucion-ok-modal/devolucion-ok-modal.component';
import { DocumentValidator } from '@core/validators/document-form.validator';
import { ConfigService } from '@core/config/config.service';
import { IConfig } from '@core/config/config.interface';

@Component({
  selector: 'app-page-devoluciones',
  templateUrl: './page-devoluciones.component.html',
  styleUrls: ['./page-devoluciones.component.scss'],
})
export class PageDevolucionesComponent implements OnInit {
  formulario!: FormGroup;
  data!: string;
  cargando = false;
  rut = '';
  nombre = '';
  ov = '';
  monto = '';
  tipoDevolucion = '';
  formaPago = '';
  bancos = [
    'Banco BICE',
    'Banco Consorcio',
    'Banco Corpbanca',
    'Banco Crédito e Inversiones',
    'Banco Estado',
    'Banco Falabella',
    'Banco Internacional',
    'Banco Paris',
    'Banco Ripley',
    'Banco Santander',
    'Banco Security',
    'Banco de Chile / Edwards-Citi',
    'Banco el Desarrollo',
    'Coopeuch',
    'HSBC Bank',
    'Itaú',
    'Rebobank',
    'Scotiabank',
    'Scotiabank Azul',
  ];
  tiposCuenta = [
    'Cuenta corriente',
    'Cuenta Rut',
    'Cuenta vista',
    'Cuenta de ahorro',
    'Chequera electrónica',
  ];
  config: IConfig;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private clientsService: ClientsService,
    private modalService: BsModalService,
    private toast: ToastrService,
    private readonly configService: ConfigService
  ) {
    this.config = this.configService.getConfig();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.data = params['data'];

      if (!this.data) {
        this.router.navigate(['/', 'inicio']);
        return;
      }

      try {
        const dataDecoded = atob(this.data);
        const partes = dataDecoded.split(';');

        if (partes.length < 6) {
          this.router.navigate(['/', 'inicio']);
        }
        this.rut = partes[0];
        this.nombre = partes[1];
        this.ov = partes[2];
        this.monto = partes[3];
        this.tipoDevolucion = partes[4];
        this.formaPago = partes[5];
      } catch (e) {
        console.log(e);
        this.router.navigate(['/', 'inicio']);
      }
    });

    this.formulario = this.fb.group({
      nombre: [
        { value: this.nombre, disabled: true },
        [Validators.required, Validators.maxLength(100)],
      ],
      rut: [
        { value: this.rut, disabled: true },
        [
          Validators.required,
          Validators.maxLength(10),
          DocumentValidator.isValidDocumentId,
        ],
      ],
      banco: ['', [Validators.required]],
      tipoCuenta: ['', [Validators.required]],
      numeroCuenta: ['', [Validators.required]],
      celular: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ],
      ],
      correo: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.([a-zA-Z]{2,4})+$/
          ),
        ],
      ],
      numeroOv: [{ value: this.ov, disabled: true }, [Validators.required]],
      monto: [this.monto, [Validators.required]],
      tipoDevolucion: [this.tipoDevolucion, [Validators.required]],
      formaPago: [this.formaPago, [Validators.required]],
    });
  }

  enviar() {
    if (this.cargando) {
      return;
    }

    this.cargando = true;
    this.clientsService
      .setDevolucion(this.formulario.value)
      .subscribe((resp: any) => {
        if (resp.error) {
          this.toast.error(resp.msg);
          this.cargando = false;
          return;
        }

        this.cargando = false;
        this.formulario.reset();
        this.modalService.show(DevolucionOkModalComponent, {
          class: 'mx-auto modal-devoluciones',
          ignoreBackdropClick: true,
        });
      });
  }
}
