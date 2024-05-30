// Angular
import {
  Component,
  Inject,
  Input,
  PLATFORM_ID,
  Output,
  EventEmitter,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Params } from '@angular/router';
// Libs
import { v4 as uuidv4 } from 'uuid';
// Models
import { ProductFilter } from '../../../shared/interfaces/product-filter';
import { ICategory } from '../../shop/pages/page-category/models/category.interface';
import { IWidgetFilter } from './models/widget-filter.interface';

@Component({
  selector: 'app-widget-filters',
  templateUrl: './widget-filters.component.html',
  styleUrls: ['./widget-filters.component.scss'],
})
export class WidgetFiltersComponent {
  /**
   * Filtros de producto.
   */
  @Input() filters: ProductFilter[] = [];
  @Input() filtrosOculto!: boolean;
  @Input() marca_tienda!: string;
  @Input() removableCategory: ICategory[] = [];
  @Input() set removableFilters(filters: Params) {
    this.formattedRemovableFilters = Object.keys(filters).map((field) => ({
      field,
      value: filters[field],
    }));
  }

  @Output() filtersSelected: EventEmitter<any> = new EventEmitter();
  @Output() clearCategory: EventEmitter<void> = new EventEmitter();
  @Output() clearAll: EventEmitter<void> = new EventEmitter();

  formattedRemovableFilters: IWidgetFilter[] = [];

  isPlatformBrowser = isPlatformBrowser(this.platformId);
  isCollapsed = false;
  id: string;
  filterIgnored:string[] = ['CADENA ANCHO','CADENA PERFIL','CADENA ARO','APLICACION CADENA']

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.id = uuidv4();
  }

  marcaCheckBox(): void {
    const prefix = 'filter_';
    const filters: any = {};

    this.filters.map((item) => {
      if (item.type === 'checkbox') {
        item.options.items.map((v) => {
          if (v.checked) {
            filters[prefix + item.name] = v.label;
            return;
          }
        });
      }
      if (item.type === 'checkboxFlota') {
        const values: any[] = [];
        item.options.items.map((v: any) => {
          if (v.checked) {
            values.push(v.chassis);
          }
        });
        if (values.length) {
          filters['chassis'] = values;
        }
      }
    });

    this.filtersSelected.emit({
      selected: filters,
      all: this.filters,
    });
  }

  marcarCategorias(item: any): void {
    item.checked = true;
  }

  removeFilter(filter: any): void {
    this.filters.map((item) => {
      if (item.type === 'checkbox') {
        if (filter.field === 'filter_' + item.name) {
          item.options.items.map((value: any) => {
            if (value.label === filter.value) {
              value.checked = false;
            }
          });
        }
      }
      if (item.type === 'checkboxFlota') {
        item.options.items.map((value: any) => {
          if (value.chassis === filter.value) {
            value.checked = false;
          }
        });
      }
    });
    this.marcaCheckBox();
  }

  removeCategory(): void {
    this.clearCategory.emit();
  }

  removeAllFilters(): void {
    this.clearAll.emit();
  }
}
