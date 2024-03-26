import {
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CartService } from '@core/services-v2/cart.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-template-productos-vertical',
  templateUrl: './template-productos-vertical.component.html',
  styleUrls: ['./template-productos-vertical.component.scss'],
})
export class TemplateProductosVerticalComponent implements OnChanges {
  readonly imageUrl: string = environment.imageUrl;

  @Input() objeto: any;
  @Input() innerWidth!: number;
  @Input() page: number = 0;
  @Input() tipoCatalogo!: string;
  cambiarImg: boolean = true;
  addingToCart = false;
  ght = `height:${window.innerHeight - 60}px !important`;

  constructor(
    private cd: ChangeDetectorRef,
    private readonly cartService: CartService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    const resto = this.page % 2;
    this.cambiarImg = resto == 0 ? false : true;
  }

  async addToCart(producto: any): Promise<void> {
    producto.images = {
      '150': [`${this.imageUrl}/img/250/${producto.sku}-1.jpg`],
    };
    if (this.addingToCart) {
      return;
    }
    producto = await this.cartService.setProducOrigin_cartDinamyc(
      producto,
      'vertical'
    );
    this.addingToCart = true;
    this.cartService.add(producto, 1).finally(() => {
      this.addingToCart = false;
      this.cd.markForCheck();
    });
  }
}
