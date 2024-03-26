import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { RootService } from '../../../../shared/services/root.service';
import { OmsService } from '@core/services-v2/oms.service';
import { IProduct, IOrder } from '@core/models-v2/oms/order.interface';
import { CartService } from '@core/services-v2/cart.service';

@Component({
  selector: 'app-page-compras',
  templateUrl: './page-compras.component.html',
  styleUrls: ['./page-compras.component.scss'],
})
export class PageComprasComponent implements OnInit {
  constructor(
    public root: RootService,
    private cart: CartService,
    private toastr: ToastrService,
    // Services V2
    private readonly omsService: OmsService
  ) {}

  showBoundaryLinks: boolean = true;
  showDirectionLinks: boolean = false;
  totalItems = 0;
  addingToCart = false;
  search: string = '';
  data: IOrder[] = [];
  maxlength: number = 5;
  loadData = false;
  page = 1;

  async ngOnInit() {
    await this.resultado_busqueda();
  }

  async resultado_busqueda() {
    this.loadData = true;

    this.data = [];
    let params = {
      search: this.search,
      page: this.page,
      limit: this.maxlength,
    };
    this.omsService.getOrders(params).subscribe({
      next: (res) => {
        this.data = res.data;
        this.totalItems = res.total;
        this.loadData = false;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  async pageChanged(event: any) {
    this.page = event.page;
    await this.resultado_busqueda();
  }

  async buscar() {
    this.page = 1;
    await this.resultado_busqueda();
  }

  addToCart(index: number) {
    if (this.addingToCart) {
      return;
    }
    this.addingToCart = true;
    let products: IProduct[] = this.data[index]?.products || [];
    if (products.length) {
      this.cart.addLista(products).subscribe(() => {
        this.addingToCart = false;
        this.toastr.success(`El pedido fue agregado al carro correctamente.`);
      });
    }
  }

  addCart(item: IProduct) {
    if (this.addingToCart) {
      return;
    }
    this.addingToCart = true;
    this.cart.add(item, 1).finally(() => {
      {
        this.addingToCart = false;
        this.toastr.success(
          `Producto "${item.sku}" agregado al carro correctamente.`
        );
      }
    });
  }

  searchCantProduct(sku: string, index: number) {
    let product = this.data[index].products.find(
      (x: IProduct) => x.sku === sku
    );
    return product ? product.quantity : 0;
  }

  searchPriceProduct(sku: string, index: number) {
    let product = this.data[index].products.find(
      (x: IProduct) => x.sku === sku
    );
    return product ? product.price : 0;
  }
}
