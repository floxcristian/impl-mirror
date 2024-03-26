// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ICatalogResponse,
  ICatalogsResponse,
  INewsletterResponse,
} from '@core/models-v2/catalog/catalog-response.interface';
import { IArticle } from '@core/models-v2/cms/special-reponse.interface';
import { DefaultBranch } from '@core/utils-v2/default-branch.service';
// Environment
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

const API_CATALOG = `${environment.apiEcommerce}/api/v1/catalog`;

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  constructor(private http: HttpClient) {}
  /**********************************************
   * CATALOG
   **********************************************/
  getCatalogs(params: {
    data?: number;
    status?: string;
    type?: string;
    app?: string;
    auto?: number;
  }): Observable<ICatalogsResponse> {
    return this.http.get<ICatalogsResponse>(`${API_CATALOG}/catalogs`, {
      params,
    });
  }

  getCatalog(id: string): Observable<ICatalogResponse> {
    return this.http.get<ICatalogResponse>(`${API_CATALOG}/catalogs/${id}`);
  }
  getCatalogsProductPrices(params: {
    documentId: string;
    branchCode: string;
    skus: string[];
  }): Observable<IArticle[]> {
    params.branchCode = DefaultBranch.getBranchCode(params.branchCode);

    return this.http.post<IArticle[]>(
      `${API_CATALOG}/get-product-prices`,
      params
    );
  }

  /**********************************************
   * NEWSLETTER
   **********************************************/
  getNewsletter(id: number): Observable<INewsletterResponse> {
    return this.http.get<INewsletterResponse>(
      `${API_CATALOG}/newsletter/${id}`
    );
  }
  /**********************************************
   * PROPOSAL
   **********************************************/
  getProposal(proposalNumber: number) {
    return this.http
      .get(`${API_CATALOG}/proposals/${proposalNumber}`)
      .toPromise();
  }
}
