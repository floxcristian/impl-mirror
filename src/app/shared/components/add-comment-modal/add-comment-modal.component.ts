import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { isVacio } from '../../utils/utilidades';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SessionService } from '@core/services-v2/session/session.service';
import { ISession } from '@core/models-v2/auth/session.interface';
import { IArticleResponse } from '@core/models-v2/article/article-response.interface';
import { ArticleService } from '@core/services-v2/article.service';

@Component({
  selector: 'app-add-comment-modal',
  templateUrl: './add-comment-modal.component.html',
  styleUrls: ['./add-comment-modal.component.scss'],
})
export class AddCommentModalComponent implements OnInit {
  @Input() producto!: IArticleResponse;
  usuario!: ISession;
  urlImg = '';

  valoracion!: number;
  titulo!: string;
  comentario!: string;
  recomienda!: string;
  nombre!: string;
  correo!: string;

  camposDisabled = false;
  event: EventEmitter<any> = new EventEmitter();

  constructor(
    public ModalRef: BsModalRef,
    private toastrService: ToastrService,
    // Services V2
    private readonly sessionService: SessionService,
    private readonly articleService: ArticleService
  ) {}

  ngOnInit() {
    if (this.producto.images['150'].length === 0) {
      this.urlImg = '../../../assets/images/products/no-image-listado-2.jpg';
    } else {
      this.urlImg = this.producto.images['150'][0];
    }

    this.usuario = this.sessionService.getSession();
    if (this.usuario.userRole !== 'temp') {
      this.nombre = `${(this.usuario.firstName || '').split(' ')[0]} ${
        (this.usuario.lastName || '').split(' ')[0]
      }`;
      this.correo = this.usuario.email || '';
      this.camposDisabled = true;
    }
  }

  publicarComentario() {
    const request = {
      sku: this.producto.sku,
      calification: this.valoracion,
      title: this.titulo,
      comment: this.comentario,
      recommended: isVacio(this.recomienda) ? false : true,
      name: this.nombre,
      email: this.correo,
      username: this.usuario.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.articleService.guardarComentarioArticulo(request).subscribe({
      next: (resp) => {
        if (resp) {
          this.event.emit(true);
          this.ModalRef.hide();
        }
      },
      error: (err) => {
        console.error(err);
        this.toastrService.error('Ocurrió un error al guardar el comentario.');
      },
    });
  }

  setValoracion(valoracion: number) {
    this.valoracion = valoracion;
  }

  camposObligatorios() {
    return (
      !isVacio(this.valoracion) &&
      !isVacio(this.nombre) &&
      !isVacio(this.correo) &&
      !isVacio(this.titulo)
    );
  }
}
