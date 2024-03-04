import { IArticle, IImage } from '../cms/special-reponse.interface';

export interface CategoryDetail {
  _id: string;
  id: number;
  slug: string;
  level: number;
  parentId: number | null;
  url: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAttribute {
  name: string;
  value: string;
}

export interface Filter {
  name: string;
  order: number;
  value: string;
}

export interface PromotionDetail {
  name: string;
  promotionId: string;
  skus: string[];
  type: string;
  validTo: string;
}

export interface CustomerCode {
  code: string;
  documentId: string;
}

export interface MetaTag {
  code: string;
  value: number | string;
}

export interface Barcode {
  code: string;
}

export interface IMatrixItem {
  sku: string;
}

export interface ILineBoss {
  name: string;
  phone: string;
}

export type IArticleResponse = IArticle & {
  assortment: number; //+
  attributes: IAttribute[]; // +
  barcodes: Barcode[]; //+
  barcodesSearch: Barcode[]; // +
  categories: CategoryDetail[]; // +
  category: string; // +
  customerCodes: CustomerCode[]; // +
  dropshipment: number; //+
  dropshipmentType: string; // +
  filters: Filter[]; // +
  line: string; // +
  lineBossId: string; // +
  manufacturer: string; // +
  matrix: IMatrixItem[]; // +
  // metaTags: MetaTag[]; // +
  partNumber: string; // +
  popularity: number; // +
  price: number; // +
  promotionDetails: PromotionDetail[]; // +
  salesQuantity: number; // +
  sbu: string; // +
  score: number; // +
  status: string; //+
  synonyms: string[]; //+
  tags: string[]; // +
  visible: number; // +
  lineBoss: ILineBoss; // -
  url?: string[]; // -
};

export interface ISearchResponse {
  articles: IArticleResponse[];
  suggestions: ISuggestion[];
  brands: IBrand[];
  categories: ICategorySearch[];
  filters: IFilters; //[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalResult: number;
  banners: IBanner[];
  levelFilter: number;
  categoriesTree: ICategoriesTree[];
}

export interface ISuggestion {
  suggestion: string;
  html: string;
}

export interface IBrand {
  brand: string;
  count: number;
}

export interface ICategorySearch {
  name: string;
  slug: string;
  url: string | string[];
  id: number;
  level: number;
  count: number;
}

export interface IBanner {
  active: boolean;
  title: string;
  alt: string;
  brand: string;
  imageFull: string;
  imageTablet: string;
  imageMobile: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICategoriesTree {
  slug: string;
  level: number;
  count: number;
  id: number;
  parentId: number | null;
  name: string;
  children?: ICategoriesTree[];
}

export interface IFilters {
  [index: string]: string[];
}

export interface IElasticSearch {
  word: string;
  documentId: string;
  branchCode: string;
  location: string;
  page: number;
  pageSize: number;
  showPrice: number;
  category: string;
  order: string;
  brand: string;
  filters: string;
}

export interface ISlimSearch {
  sku: string;
  name: string;
  category: string;
  status: string;
  manufacturer: string;
  line: string;
  brand: string;
  sbu: string;
  description: string | null;
  images: IImage;
  dropshipmentType: string;
  dropshipment: number;
  partNumber: string;
}
