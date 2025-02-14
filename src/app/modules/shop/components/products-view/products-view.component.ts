// Angular
import {
  Component,
  Input,
  Output,
  EventEmitter,
  Inject,
  HostListener,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
// Libs
import { GoogleTagManagerService } from 'angular-google-tag-manager';
// Models
import { Link } from '../../../../shared/interfaces/link';
declare let dataLayer: any;

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.scss'],
})
export class ProductsViewComponent {
  isB2B!: boolean;
  // Analizando
  @Input() isInitialLoading = true;
  @Input() isScrollLoading = false;
  @Input() products!: any[];
  @Input() limit = 12;
  @Input() showProductOptions = true;
  @Input() origen!: string[];
  @Input() breadcrumbs: Link[] = [];
  param: any = {};
  @Input() textToSearch: any = null;
  @Input() totalPaginas = 0;
  @Input() desde = 0;
  @Input() hasta = 0;
  @Input() currentPage: number = 1;
  @Input() totalRegistros = 0;
  @Output() onInfiniteScrollEvent: EventEmitter<number> = new EventEmitter();
  @Output() filterState: EventEmitter<boolean> = new EventEmitter();

  @Output() sort: EventEmitter<string> = new EventEmitter();
  @Input() paramsCategory!: any;
  sortType: string | null = null;

  listItemPage: any[] = [];
  location!: String;
  selectedItem = this.limit;
  innerWidth!: number;
  url!: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly gtmService: GoogleTagManagerService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.location = document.location.search;
      this.url = window.location.href;
      this.innerWidth = isPlatformBrowser(this.platformId)
        ? window.innerWidth
        : 900;
      if (this.innerWidth < 1025) {
        this.selectedItem = 12;
        this.listItemPage = [
          { id: 12, value: 12 },
          { id: 24, value: 24 },
          { id: 36, value: 36 },
          { id: 48, value: 48 },
          { id: 60, value: 60 },
        ];
      } else {
        this.selectedItem = 15;
        this.listItemPage = [
          { id: 15, value: 15 },
          { id: 30, value: 30 },
          { id: 45, value: 45 },
          { id: 60, value: 60 },
          { id: 120, value: 120 },
        ];
      }
    }
  }

  ngOnInit(): void {
    if (!this.isB2B) {
      // this.gtmService.pushTag({
      //   event: 'categorie_view',
      //   pagePath: this.url,
      // });
      dataLayer.push({
        event: 'categorie_view',
        pagePath: this.url
      });
    }
  }

  ngOnChanges(): void {
    if (isPlatformBrowser(this.platformId)) this.url = window.location.href;
    if (this.textToSearch.includes('SKU:'))
      this.textToSearch = this.textToSearch.substring(
        4,
        this.textToSearch.length
      );
    if ((this.textToSearch?.length || 0) > 70)
      this.textToSearch = 'Búsqueda personalizada';
  }

  onInfiniteScroll(pageNumber: number): void {
    const page = pageNumber + 1;
    if (page <= this.totalPaginas) {
      this.onInfiniteScrollEvent.emit(page);
    }
  }

  setVisibleFilter(): void {
    this.filterState.emit(true);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.innerWidth = event.target.innerWidth;
    if (this.innerWidth < 1025) {
      this.selectedItem = 12;
      this.listItemPage = [
        { id: 12, value: 12 },
        { id: 24, value: 24 },
        { id: 36, value: 36 },
        { id: 48, value: 48 },
        { id: 60, value: 60 },
      ];
    } else {
      this.selectedItem = 15;
      this.listItemPage = [
        { id: 15, value: 15 },
        { id: 30, value: 30 },
        { id: 45, value: 45 },
        { id: 60, value: 60 },
        { id: 120, value: 120 },
      ];
    }
  }

  decodedUrl(cadena: string) {
    return decodeURIComponent(cadena);
  }

  changeSortType(): void {
    if (this.sortType) this.sort.emit(this.sortType);
  }

  formatUrlParam(value: string): string {
    return value.replaceAll(/%20/g, ' ');
  }
}
