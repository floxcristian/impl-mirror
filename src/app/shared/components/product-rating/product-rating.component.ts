import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AddCommentModalComponent } from '../add-comment-modal/add-comment-modal.component';
import {
  DataModal,
  ModalComponent,
  TipoIcon,
  TipoModal,
} from '../modal/modal.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SessionService } from '@core/services-v2/session/session.service';
import { IArticleResponse } from '@core/models-v2/article/article-response.interface';
import { ArticleService } from '@core/services-v2/article.service';
import {
  IReviewsResponse,
  ReviewSummary,
} from '@core/models-v2/article/review-response.interface';

@Component({
  selector: 'app-product-rating',
  templateUrl: './product-rating.component.html',
  styleUrls: ['./product-rating.component.scss'],
})
export class ProductRatingComponent {
  @Input() producto!: IArticleResponse;
  @Output() comentarioGuardado: EventEmitter<boolean> = new EventEmitter();
  @Output() leerComentarios: EventEmitter<boolean> = new EventEmitter();
  @Input() set evaluationSummary(value: IReviewsResponse) {
    if (value) {
      this.useEvaluationSummary(value);
    }
  }

  rating = 0;
  starWidth = 20;
  paintedWidth = 0;

  total = 0;
  resumen: ReviewSummary[] = [];

  constructor(
    private modalService: BsModalService,
    private toastrService: ToastrService,
    public router: Router,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly articleService: ArticleService
  ) {}

  cargaResumen() {
    this.articleService.getResumenComentarios(this.producto.sku).subscribe({
      next: (resp: any) => {
        if (!resp.error) {
          this.total = resp.total;
          this.resumen = resp.summary;
          this.updateRatingAndStars();
        } else {
          console.log(resp.msg);
        }
      },
      error: (error) =>
        console.log('Error al cargar el resumen de comentarios'),
    });
  }

  useEvaluationSummary(summary: IReviewsResponse) {
    this.total = summary.total;
    this.resumen = summary.summary;
    this.updateRatingAndStars();
  }

  updateRatingAndStars() {
    this.rating = 0;
    this.resumen.forEach((c) => {
      c.percentage = this.total > 0 ? (c.quantity * 100) / this.total : 0;
      this.rating += this.total > 0 ? (c.stars * c.quantity) / this.total : 0;
    });
    this.rating = Number(this.rating.toFixed(1));
    this.paintStars(this.rating);
  }

  paintStars(rating: number) {
    const width = Math.max(0, Math.min(5, rating)) * this.starWidth;
    this.paintedWidth = width;
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
          this.comentarioGuardado.emit(true);
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
}
