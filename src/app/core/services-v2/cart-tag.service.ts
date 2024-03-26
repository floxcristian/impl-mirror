// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
// Environment
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { IShoppingCartDetail } from '@core/models-v2/cart/shopping-cart-detail.interface';
import { ITagMarkResponse } from '@core/models-v2/cart/tag-mark.interface';
import { IGtagDataResponse } from '@core/models-v2/cart/gtag-data.interface';

const API_CART = `${environment.apiEcommerce}/api/v1/shopping-cart`;

@Injectable({
  providedIn: 'root',
})
export class CartTagService {
  private http = inject(HttpClient);

  getOneById(id: string): Observable<IShoppingCartDetail> {
    const url = `${API_CART}/${id}`;
    return this.http.get<IShoppingCartDetail>(url);
  }

  getGTagData(id: string): Observable<IGtagDataResponse> {
    const url = `${API_CART}/${id}/gtag-data`;
    return this.http.get<IGtagDataResponse>(url);
  }

  markGtag(params: { shoppingCartId: string }): Observable<ITagMarkResponse> {
    const { shoppingCartId } = params;
    const url = `${API_CART}/${shoppingCartId}/gtag/mark`;
    return this.http.post<ITagMarkResponse>(url, undefined);
  }
}
