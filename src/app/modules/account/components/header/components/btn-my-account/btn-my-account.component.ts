import { Component } from '@angular/core';

@Component({
  selector: 'app-btn-my-account',
  templateUrl: './btn-my-account.component.html',
  styleUrls: ['./btn-my-account.component.scss'],
})
export class BtnMyAccountComponent {
  menuAccount = [
    { label: 'MI PERFIL ' },
    { label: 'LIBRETA DIRECCIONES ' },
    { label: 'EJECUTIVO CUENTA ' },
  ];
}
