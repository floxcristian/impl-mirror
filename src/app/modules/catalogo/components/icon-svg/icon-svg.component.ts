import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-svg',
  templateUrl: './icon-svg.component.html',
  styleUrls: ['./icon-svg.component.scss'],
})
export class IconSvgComponent {
  id!: string;
  width!: string | null;
  height!: string | null;
  @Input() fill!: string;
  @Input() float!: string;
  @Input() margintop!: string;
  @Input() set name(value: string) {
    this.id = value;
  }

  @Input() set size(value: string) {
    const result = /^([0-9]+)(?:x([0-9]+))?$/.exec(value);

    if (result) {
      if (result[2]) {
        this.width = result[1] + 'px';
        this.height = result[2] + 'px';
      } else {
        this.width = this.height = result[1] + 'px';
      }
    } else {
      this.width = this.height = null;
    }
  }

  constructor() {}
}
