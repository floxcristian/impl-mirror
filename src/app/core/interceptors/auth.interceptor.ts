// Angular
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
// Rxjs
import { Observable, catchError, switchMap, throwError } from 'rxjs';
// Env
import { environment } from '@env/environment';
// Services
import { SessionTokenStorageService } from '@core/storage/session-token-storage.service';
import { AuthApiService } from '@core/services-v2/auth/auth.service';
import { SessionStorageService } from '@core/storage/session-storage.service';
import { LogoutService } from '@core/services-v2/auth/logout.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  authdata: any;

  constructor(
    @Inject(PLATFORM_ID) private plataformaId: any,
    // Services V2
    private readonly authApiService: AuthApiService,
    private readonly sessionTokenStorage: SessionTokenStorageService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly logoutService: LogoutService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let newReq = request.clone();

    const session = this.sessionStorageService.get();
    const tokens = this.sessionTokenStorage.get();
    const isMultipartFormData = request.body instanceof FormData;

    if (tokens && request.url.includes('api/v')) {
      const accessToken = tokens.accessToken;
      let headers = request.headers
        .set('Authorization', 'Bearer ' + accessToken)
        .set('X-Ecommerce-User', session?.email || '');

      // No sobrescribimos el Content-Type si es multipart/form-data
      if (!isMultipartFormData) {
        headers = headers.set('Content-Type', 'application/json');
      }

      newReq = request.clone({ headers });
    } else {
      if (isPlatformBrowser(this.plataformaId)) {
        this.authdata = window.btoa(
          environment.basicAuthUser + ':' + environment.basicAuthPass
        );
      } else {
        this.authdata = 'c2VydmljZXM6MC49ajNEMnNzMS53Mjkt';
      }

      let headers = request.headers
        .set('Authorization', 'Basic ' + this.authdata)
        .set('X-Ecommerce-User', session?.email || '');

      // No sobrescribimos el Content-Type si es multipart/form-data
      if (!isMultipartFormData) {
        headers = headers.set('Content-Type', 'application/json');
      }

      newReq = request.clone({ headers });
    }

    if (request.url.includes('api/v1/auth/refresh')) {
      return next.handle(newReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 && tokens) {
            this.logoutService.clearSession();
            this.logoutService.irAInicio();
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(newReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && tokens) {
          const refreshToken = tokens.refreshToken;
          if (refreshToken) {
            return this.authApiService.refreshToken(refreshToken).pipe(
              switchMap((resp) => {
                this.sessionTokenStorage.set(resp);
                const accessToken = resp.accessToken;
                let headers = newReq.headers.set(
                  'Authorization',
                  'Bearer ' + accessToken
                );

                // No sobrescribimos el Content-Type si es multipart/form-data
                if (!isMultipartFormData) {
                  headers = headers.set('Content-Type', 'application/json');
                }

                newReq = newReq.clone({ headers });
                return next.handle(newReq);
              }),
              catchError((refreshError) => {
                console.error(
                  'Error al obtener refresh tokens: ',
                  refreshError
                );
                return throwError(() => refreshError);
              })
            );
          }
          console.error('No hay refresh token: ', error);
          return throwError(() => error);
        }
        const errorMessage = error.error?.errors?.length
          ? `${error.error.message}: ${error.error.errors[0]}`
          : `${error.statusText}`;
        const formattedError =
          error.message && errorMessage
            ? `${error.message.trim()} (${errorMessage})`
            : error;
        console.error(formattedError);
        return throwError(() => error);
      })
    );
  }
}
