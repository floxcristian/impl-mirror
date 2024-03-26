import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AddCommentModalComponent } from '../../../../shared/components/add-comment-modal/add-comment-modal.component';
import {
  DataModal,
  ModalComponent,
  TipoIcon,
  TipoModal,
} from '../../../../shared/components/modal/modal.component';
import { ComentarioArticulo } from '../../../../shared/interfaces/comentariosArticulo';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SessionService } from '@core/services-v2/session/session.service';
import { IArticleResponse } from '@core/models-v2/article/article-response.interface';
import { ArticleService } from '@core/services-v2/article.service';
import { CommentSummary } from '@core/models-v2/article/article-comment.interface';
import { IComment } from '@core/models-v2/article/comment.interface';
import { IReviewsResponse } from '@core/models-v2/article/review-response.interface';

@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.component.html',
  styleUrls: ['./comentarios.component.scss'],
})
export class ComentariosComponent implements OnChanges {
  @Input() producto!: IArticleResponse | undefined;
  @Output() evaluationSummary: EventEmitter<IReviewsResponse> =
    new EventEmitter();

  rating = 0;
  starWidth = 25;
  anchoPintado = 0;

  total = 0;
  resumen: CommentSummary[] = [];
  comentarios: IComment[] = [];
  comentariosOriginal: ComentarioArticulo[] = [];
  slice = false;
  Math = Math;

  orden = 'recientes';

  constructor(
    private modalService: BsModalService,
    private toastrService: ToastrService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly articleService: ArticleService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.cargaTodo();
  }

  cargaResumen() {
    if (this.producto) {
      this.articleService
        .getResumenComentarios(this.producto.sku)
        .subscribe((resp) => {
          // Asegúrate de que esto coincida con la estructura de tu API
          if (resp) {
            // Asumiendo que la respuesta tiene una propiedad 'error'
            this.rating = 0;
            this.total = resp.total;
            this.resumen = resp.summary;
            this.evaluationSummary.emit(resp);
            this.resumen = this.resumen.map((r: CommentSummary) => {
              r.percentage =
                this.total > 0 ? (r.quantity * 100) / this.total : 0;
              this.rating +=
                this.total > 0 ? (r.stars * r.quantity) / this.total : 0;
              return r;
            });

            this.rating = Number(this.rating.toFixed(1));
            this.pintaEstrellas(this.rating); // Asegúrate de que esta función maneje correctamente el valor de 'this.rating'
          }
        });
    }
  }

  cargaDetalle() {
    if (this.producto) {
      this.articleService
        .getDetalleComentarios(this.producto.sku, this.orden)
        .subscribe({
          next: (resp) => {
            if (resp.data && resp.data.length) {
              this.comentarios = resp.data;
              this.slice = false;
              this.sliceToggle();
            }
          },
          error: (error) => {
            console.log('Error al obtener comentarios', error);
          },
        });
    }
  }

  cargaTodo() {
    this.cargaResumen();
    this.cargaDetalle();
  }

  pintaEstrellas(rating: number) {
    const width = Math.max(0, Math.min(5, rating)) * this.starWidth;
    this.anchoPintado = width;
  }

  escribirComentario() {
    const usuario = this.sessionService.getSession();

    if (usuario.userRole !== 'temp') {
      const initialState = {
        producto: this.producto,
      };
      const bsModalRef: BsModalRef = this.modalService.show(
        AddCommentModalComponent,
        { initialState, class: 'modal-comentario' }
      );
      bsModalRef.content.event.subscribe(async (res: any) => {
        if (res !== '') {
          this.toastrService.success('Comentario publicado correctamente.');
          this.cargaResumen();
          this.cargaDetalle();
        }
      });
    } else {
      const initialState: DataModal = {
        titulo: 'Información',
        mensaje: `Para poder publicar un comentario por favor identifícate iniciando sesión.<br>Si eres nuevo regístrate <a href="/sitio/registro-usuario">aquí</a>.`,
        tipoIcon: TipoIcon.INFO,
        tipoModal: TipoModal.OK,
        textoBotonSI: 'OK',
      };
      this.modalService.show(ModalComponent, { initialState });
    }
  }

  sliceToggle() {
    this.slice = !this.slice;
    if (this.slice) {
      //this.comentarios = this.comentariosOriginal.slice(0, 4);
    } else {
      // this.comentarios = this.comentariosOriginal;
    }
  }
}
