import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
})
export class ButtonComponent {
  @Input() imagen!: string;
  @Input() titulo!: string;
  @Input() linea1!: string;
  @Input() linea2!: string;
}
