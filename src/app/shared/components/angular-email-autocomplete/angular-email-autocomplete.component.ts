// Angular
import { Component, Input, OnChanges } from '@angular/core';
// Constants
import { EMAIL_DOMAINS_AUTOCOMPLETE } from '@core/utils-v2/email/domains-autocomplete';
@Component({
  selector: 'autocomplete',
  templateUrl: './angular-email-autocomplete.component.html',
  styleUrls: ['./angular-email-autocomplete.component.scss'],
})
export class AngularEmailAutocompleteComponent implements OnChanges {
  @Input() givenPlaceHolder: string = '';

  domains: string[] = EMAIL_DOMAINS_AUTOCOMPLETE;
  suggestedEmails: string[] = [];
  inputValue: string = '';
  isValidEmail: boolean = false;
  regularExpression =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  ngOnChanges(): void {
    this.checkIsValidEmail();
  }

  /**
   * Verifica si el email ingresado es válido.
   * @returns
   */
  private checkIsValidEmail(): void {
    if (!this.inputValue.length) return;

    this.isValidEmail = this.regularExpression.test(this.inputValue);
  }

  /**
   * Seleccionar sugerencia de email.
   * @param value
   */
  selectSuggestedEmail(suggestedEmail: string): void {
    this.inputValue = suggestedEmail;
    this.checkIsValidEmail();
  }

  /**
   * Se activa al presionar una tecla en el input.
   * @param event
   * @returns
   */
  onInputChange(event: any): void {
    const tecla_presionada = event.keyCode;

    if (tecla_presionada == 27) {
      return;
    }
    this.suggestedEmails = [];

    if (this.inputValue.length) {
      this.domains.forEach((domain) => {
        let valueToDisplay: string;

        if (this.inputValue.indexOf('@') != -1) {
          const splittedEmail = this.inputValue.split('@');
          const correo_sin_dom = splittedEmail[0];
          const dominio_usuario: string = splittedEmail[1];
          const valor_domain: string = domain;

          if (valor_domain.includes(dominio_usuario)) {
            valueToDisplay = `${correo_sin_dom}@${domain}`;
            this.suggestedEmails.push(valueToDisplay);
          }
        } else {
          valueToDisplay =
            this.inputValue.indexOf('@') == -1
              ? `${this.inputValue}@${domain}`
              : `${this.inputValue}${domain}`;
          this.suggestedEmails.push(valueToDisplay);
        }
      });
    }
    this.checkIsValidEmail();
  }
}
