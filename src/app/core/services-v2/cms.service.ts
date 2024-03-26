// Angular
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  IBlog,
  IBlogResponse,
  IBlogsResponse,
} from '@core/models-v2/cms/blog-response.interface';
import {
  ICategorieResponse,
  IChildren,
} from '@core/models-v2/cms/categories-response.interface';
import { ICustomHomePage } from '@core/models-v2/cms/customHomePage-response.interface';
import { IHomePageResponse } from '@core/models-v2/cms/homePage-response.interface';
import { ISliderResponse } from '@core/models-v2/cms/slider-reponse.interface';
import {
  IPaginated,
  ISpecialResponse,
} from '@core/models-v2/cms/special-reponse.interface';
import {
  IValueBox,
  IValueBoxResponse,
} from '@core/models-v2/cms/valueBox-response.interface';
import { IWorldResponse } from '@core/models-v2/cms/world-response.interface';
// Environment
import { environment } from '@env/environment';
import { Observable, map } from 'rxjs';
import { BlogService } from './blog/blog.service';
import { DefaultBranch } from '@core/utils-v2/default-branch.service';

const API_CMS = `${environment.apiEcommerce}/api/v1/cms`;

@Injectable({
  providedIn: 'root',
})
export class CmsService {
  constructor(
    private http: HttpClient,
    private readonly blogService: BlogService
  ) {}

  /**********************************************
   * CMS
   **********************************************/
  getCategories(): Observable<IChildren[]> {
    return this.http
      .get<ICategorieResponse>(`${API_CMS}/categories`)
      .pipe(map((res) => res.data));
  }

  getSliders(): Observable<ISliderResponse> {
    return this.http.get<ISliderResponse>(`${API_CMS}/sliders`);
  }

  getValueBoxes(): Observable<IValueBox[]> {
    return this.http
      .get<IValueBoxResponse>(`${API_CMS}/value-boxes`)
      .pipe(map((res) => res.data));
  }

  getWorlds(): Observable<IWorldResponse> {
    return this.http.get<IWorldResponse>(`${API_CMS}/worlds`);
  }

  getHomePage(
    documentId: string,
    branchCode: string,
    location: string
  ): Observable<IHomePageResponse> {
    branchCode = DefaultBranch.getBranchCode(branchCode);

    return this.http.get<IHomePageResponse>(`${API_CMS}/homepage`, {
      params: { documentId, branchCode, location },
    });
  }

  getCustomHomePage(
    documentId: string,
    branchCode: string,
    location: string
  ): Observable<ICustomHomePage> {
    branchCode = DefaultBranch.getBranchCode(branchCode);

    return this.http.get<ICustomHomePage>(`${API_CMS}/custom-homepage`, {
      params: { documentId, branchCode, location },
    });
  }

  getSpecial(special: string): Observable<ISpecialResponse> {
    return this.http.get<ISpecialResponse>(`${API_CMS}/special`, {
      params: { special },
    });
  }

  getSpecialArticles(
    id: string,
    special: string,
    documentId: string,
    branchCode: string,
    location: string,
    page: number = 1,
    limit: number = 30
  ): Observable<IPaginated> {
    branchCode = DefaultBranch.getBranchCode(branchCode);

    return this.http.get<IPaginated>(`${API_CMS}/special/${id}`, {
      params: { special, documentId, branchCode, location, page, limit },
    });
  }

  /**********************************************
   * BLOG
   **********************************************/
  getPosts(quantity: number): Observable<IBlogsResponse> {
    return this.http.get<IBlogsResponse>(`${API_CMS}/blog/posts`, {
      params: { quantity },
    });
  }

  /**
   * Obtener post.
   * @param postId
   * @returns
   */
  getPostDetail(postId: string): Observable<IBlog> {
    return this.http.get<IBlogResponse>(`${API_CMS}/blog/post/${postId}`).pipe(
      map(({ data }) => {
        let htmlContent = this.formatHtmlContent(data.text);
        htmlContent = this.blogService.formatHtmlContent(htmlContent);
        return { ...data, text: htmlContent };
      })
    );
  }

  private formatHtmlContent(html: string): string {
    return this.formatH4(html);
    //return this.formatOEmbed(content);
  }

  /**
   * Reemplazar tags h4.
   * @param html
   * @returns
   */
  private formatH4(html: string): string {
    return html.replace(/<h4>/g, `<h4 style="font-size:19px !important">`);
  }
}
