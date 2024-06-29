import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ResponseApi } from '@shared/interfaces/response-api';
import { ClientsService } from '@shared/services/clients.service';
import { rutValidator } from '@shared/utils/utilidades';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import {
  UploadImageModalComponent,
  respuestaUploadImage,
} from '../components/upload-image-modal/upload-image-modal.component';
import { Camionero24OkModalComponent } from '../components/camionero24-ok-modal/camionero24-ok-modal.component';

interface Participante {
  nombre: string;
  foto: string;
}

@Component({
  selector: 'app-page-mes-del-camionero',
  templateUrl: './page-mes-del-camionero.component.html',
  styleUrls: ['./page-mes-del-camionero.component.scss'],
})
export class PageMesDelCamioneroComponent {
  formulario!: FormGroup;
  cargando = false;
  foto!: File | undefined;
  fotoUrl!: string | undefined;

  participantes: Participante[] = [
    {
      nombre: 'Mario Casas',
      foto: 'assets/images/concursos/mesDelCamionero24/MARIO CASAS.webp',
    },
    {
      nombre: 'Daniela Vega',
      foto: 'assets/images/concursos/mesDelCamionero24/DANIELA VEGA.webp',
    },
    {
      nombre: 'Manuel Rojas',
      foto: 'assets/images/concursos/mesDelCamionero24/MANUEL ROJAS.webp',
    },
    {
      nombre: 'Carlos Contreras',
      foto: 'assets/images/concursos/mesDelCamionero24/CARLOS CONTRERAS.webp',
    },
    {
      nombre: 'Fabio Alderete',
      foto: 'assets/images/concursos/mesDelCamionero24/FABIO ALDERETE.webp',
    },
    {
      nombre: 'Cristián Flores',
      foto: 'assets/images/concursos/mesDelCamionero24/CRISTIAN FLORES.webp',
    },
    {
      nombre: 'Claudio Montoya',
      foto: 'assets/images/concursos/mesDelCamionero24/CLAUDIO MONTOYA.webp',
    },
    {
      nombre: 'Ingrid Brito',
      foto: 'assets/images/concursos/mesDelCamionero24/INGRID BRITO.webp',
    }
  ];

  carouselOptions = {
    lazyLoad: true,
    items: 5,
    nav: true,
    navText: [
      `<div class="m-arrow__container" ><i class="fa-regular fa-chevron-left"></i></div>`,
      `<div class="m-arrow__container"><i class="fa-regular fa-chevron-right"></i></div>`,
    ],
    slideBy: 'page',
    dots: true,
    loop: true,
    responsiveClass: true,
    autoplay: false,
    autoplayTimeout: 4000,
    responsive: {
      1100: { items: 4 },
      920: { items: 4 },
      768: { items: 2 },
      680: { items: 2 },
      500: { items: 2 },
      0: { items: 2 },
    },
  };

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private modalService: BsModalService,
    private toast: ToastrService
  ) {}

  ngOnInit() {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      rut: ['', [Validators.required, Validators.maxLength(10), rutValidator]],
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
      celular: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]+$/),
          Validators.minLength(8),
          Validators.maxLength(8),
        ],
      ],
      boletaFactura: ['', Validators.required],
    });

    this.clientsService.getMesDelCamionero().subscribe(
      (resp: any) => {
        const fotos = resp.data.map((x: any) => {
          const obj = {
            nombre: x.nombre,
            foto: x.foto.url
          };
          return obj;
        }).reverse().forEach((x: any) => {
          this.participantes.unshift(x);
        })
      }
    )
  }

  cargaFoto() {
    const bsModalRef = this.modalService.show(UploadImageModalComponent, {
      class: 'mx-auto modal-camionero24',
      ignoreBackdropClick: true,
    });
    bsModalRef.content?.respuesta.subscribe((res: respuestaUploadImage) => {
      if (res) {
        this.foto = res.file;
        this.fotoUrl = res.url;
      }
    });
  }

  enviar() {
    if (this.cargando) {
      return;
    }

    const data = this.formulario.value;
    const formData = new FormData();
    formData.append('foto', this.foto!);
    delete data.foto;
    formData.append('formulario', JSON.stringify(data));

    this.cargando = true;
    this.clientsService
      .setMesDelCamionero(formData)
      .subscribe((resp: ResponseApi) => {
        if (resp.error) {
          this.toast.error(resp.msg);
          this.cargando = false;
          return;
        }

        this.cargando = false;
        this.formulario.reset();
        this.foto = undefined;
        this.fotoUrl = undefined;
        this.modalService.show(Camionero24OkModalComponent, { class: 'mx-auto modal-camionero24', ignoreBackdropClick: true });
      });
  }
}
