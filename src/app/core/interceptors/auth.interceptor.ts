// Angular
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
// Rxjs
import { Observable, catchError, switchMap, throwError } from 'rxjs';
// Env
import { environment } from '@env/environment';
// Services
import { SessionTokenStorageService } from '@core/storage/session-token-storage.service';
import { AuthApiService } from '@core/services-v2/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  authdata: any;

  constructor(
    @Inject(PLATFORM_ID) private plataformaId: any,
    // Services V2
    private readonly authApiService: AuthApiService,
    private readonly sessionTokenStorage: SessionTokenStorageService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let newReq = request.clone();

    const tokens = this.sessionTokenStorage.get();
    if (tokens && request.url.includes('api/v')) {
      const accessToken = tokens.accessToken;
      newReq = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + accessToken),
      });
    } else {
      if (isPlatformBrowser(this.plataformaId)) {
        this.authdata = window.btoa(
          environment.basicAuthUser + ':' + environment.basicAuthPass
        );
      } else {
        this.authdata = 'c2VydmljZXM6MC49ajNEMnNzMS53Mjkt';
      }

      newReq = request.clone({
        headers: request.headers.set(
          'Authorization',
          'Basic ' + this.authdata
        ),
      });
    }

    return next.handle(newReq).pipe(
      catchError((error) => {
        if (error.status === 401 && tokens) {
          const refreshToken = tokens.refreshToken;
          if (refreshToken) {
            return this.authApiService.refreshToken(refreshToken).pipe(
              switchMap((resp) => {
                this.sessionTokenStorage.set(resp);
                const accessToken = resp.accessToken;
                newReq = request.clone({
                  headers: request.headers.set(
                    'Authorization',
                    'Bearer ' + accessToken
                  ),
                });
                return next.handle(newReq);
              }),
              catchError((error) => {
                // console.log('Error al obtener refresh tokens: ', error);
                return throwError(() => new Error(error));
              })
            );
          }
          // console.log('No hay refresh token: ', error);
          return throwError(() => new Error(error));
        }
        // console.log('No es estado 401: ', error.errors);
        const errorMessage = error.error?.errors?.length
          ? `${error.error.message}: ${error.error.errors[0]}`
          : `${error.statusText}`;
        const formattedError =
          error.message && errorMessage
            ? `${error.message.trim()} (${errorMessage})`
            : error;
        console.error(formattedError);
        return throwError(() => new Error(error));
      })
    );
  }
}
