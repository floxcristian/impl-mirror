// Angular
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
// Express
import { Request } from 'express';
// Env
import { environment } from '@env/environment';
// Models
import { IConfig } from './config.interface';
// Rxjs
import { Observable, map, tap } from 'rxjs';
import { REQUEST } from '../../../express.tokens';

@Injectable()
export class ConfigService {
  private config!: IConfig;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Optional() @Inject(REQUEST) private request: Request
  ) {}

  loadConfig(): Observable<IConfig> {
    const { country } = environment;
    const filePath = this.getFilePath(country);
    return this.http.get<IConfig>(filePath).pipe(
      map((res) => {
        res.fullUrl = `https://${res.url}`;
        res.shortUrl = res.url.replace(/^www\./, '');
        res.company.formattedWhatsapp = this.formatPhone(res.company.whatsapp);
        res.company.formattedPhone = this.formatPhone(res.company.phone);
        return res;
      }),
      tap((config) => (this.config = config))
    );
  }

  getConfig(): IConfig {
    return this.config;
  }

  private getFullUrl(): string {
    const port = process.env['PORT'] || 4000;
    return `http://localhost:${port}`;
  }

  private getFilePath(country: string): string {
    const file = `config.${country}.json`;
    return isPlatformServer(this.platformId) && this.request
      ? `${this.getFullUrl()}/assets/config/${file}`
      : `./assets/config/${file}`;
  }

  /**
   * Formatear un número telefónico dejando solo números y quitando otros elementos como espacios o signos.
   * @param phone
   * @returns
   */
  private formatPhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }
}
