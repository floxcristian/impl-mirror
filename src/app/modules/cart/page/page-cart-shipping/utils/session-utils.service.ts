import { ISession } from '@core/models-v2/auth/session.interface';
import { AddNotificacionContactRequest } from '@core/models-v2/requests/cart/add-notification-contact.request';
import { IGuest } from '@core/models-v2/storage/guest.interface';

export class SessionUtils {
  static getContact(
    { userRole, phone, email, firstName, lastName }: ISession,
    guest: IGuest
  ): AddNotificacionContactRequest | null {
    if (userRole != 'temp') {
      return {
        phone,
        email,
        name: `${firstName} ${lastName}`,
      };
    } else if (userRole === 'temp' && guest) {
      return {
        phone: guest.phone,
        email: guest.email,
        name: this.getFullName(guest),
      };
    } else {
      return null;
    }
  }

  /**
   * Obtener el nombre del usuario.
   */
  static getFullName({ firstName, lastName }: IGuest | ISession): string {
    return `${firstName} ${lastName}`;
  }
}
