import { IArticle } from './special-reponse.interface';

export interface IHomePageResponse {
  data: IData[];
}

export interface IData {
  page: IPage[];
}

export interface IPage {
  id: string;
  type: string;
  x: number;
  y: number;
  h: number;
  w: number;
  data: IPageData;
}

export interface IPageData {
  id: string;
  element: IElement1[] | IElement2;
}

export interface IElement1 {
  title: string;
  subtitle: string | null;
  url: string;
  values: string[];
  articles: IArticle[];
  image: string;
  startDate:string | Date;
  expirationDate:string | Date;
}
export interface IElement2 {
  title?: string;
  text?: string;
  alt?: string;
  imageClassic?: string;
  imageFull?: string;
  imageTablet?: string;
  imageMobile?: string;
  buttonUrl?: string;
  subtitle?: null | string;
  url?: string;
  values?: string[];
  articles?: IArticle[];
  data?: IElementData;
}

export interface IElementData {
  title: string;
  layout?: ILayout[];
  description?: string;
  image?: string;
  type?: number;
}

export interface ILayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  data: ILayoutData;
}

export interface ILayoutData {
  title: string;
  image: string;
  alt: string;
  url: string;
}
