// Angular
import { Injectable } from '@angular/core';
// Env
import { environment } from '@env/environment';
// Services
import { ScriptService } from '../script/script.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly webChatScript = environment.webChatScript;

  constructor(private readonly scriptService: ScriptService) {}

  /**
   * Cargar script de chat.
   */
  loadChatScript() {
    this.scriptService
      .loadScript(this.webChatScript)
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.warn('Error al cargar el script de chat');
        return false;
      });
  }
  /**
   * Obtiene el token del chat.
   */
  getChatToken(): string {
    const regex = /token=([^&]+)/;
    const match = this.webChatScript.match(regex);
    return match ? match[1] + '_startButtonContainer' : '';
  }

  /**
   * Mostrar botón de chat.
   */
  showChatButton(): void {
    const token = this.getChatToken();
    const chatButtonContainer = document.getElementById(token);
    if (chatButtonContainer) {
      chatButtonContainer.style.display = 'block';
    }
  }
  /**
   * Ocultar botón de chat.
   */

  hideChatButton(): void {
    const token = this.getChatToken();
    const chatButtonContainer = document.getElementById(token);
    if (chatButtonContainer) {
      chatButtonContainer.style.display = 'none';
    }
  }
}
