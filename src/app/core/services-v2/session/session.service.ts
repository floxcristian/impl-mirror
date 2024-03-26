// Angular
import { Injectable } from '@angular/core';
// Libs
import { v4 as uuidv4 } from 'uuid';
// Models
import { ISession } from '@core/models-v2/auth/session.interface';
// Services
import { SessionStorageService } from '../../storage/session-storage.service';
import { GuestStorageService } from '@core/storage/guest-storage.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  constructor(
    private readonly sessionStorage: SessionStorageService,
    private readonly guestStorage: GuestStorageService
  ) {}

  getSession(): ISession {
    const currentSession = this.sessionStorage.get();
    if (currentSession) return currentSession;

    const newSession: ISession = {
      email: uuidv4(),
      login_temp: true,
      documentId: '0',
      userRole: 'temp',
      preferences: {
        iva: true,
      },
    };
    this.sessionStorage.set(newSession);
    return newSession;
  }

  isLoggedIn(): boolean {
    const user = this.sessionStorage.get();
    if (!user) {
      return false;
    } else {
      if (user.login_temp) {
        return false;
      } else {
        // Porque borramos esto?
        this.guestStorage.remove();
        return true;
      }
    }
  }

  /**
   * Verificar si la session de usuario es B2B.
   * @returns
   */
  isB2B(): boolean {
    const session = this.getSession();
    return ['supervisor', 'buyer'].includes(session.userRole);
  }
}
