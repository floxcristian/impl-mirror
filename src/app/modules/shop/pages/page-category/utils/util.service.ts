// Angular
import { ActivatedRouteSnapshot, Params, UrlSegment } from '@angular/router';
// Models
import {
  IElasticSearch,
  IFilters,
} from '@core/models-v2/article/article-response.interface';
// Constans
import { IGNORED_FILTERS } from '../constants/ignored-filters';
import { IValidFilter } from '../models/valid-filter.interface';
import { ICategoryParams } from '../../page-product/models/category-params.interface';

/**
 * Obtiene origen.
 * @param routeSnapshot
 * @returns
 */
export const getOriginUrl = (
  routeSnapshot: ActivatedRouteSnapshot
): string[] => {
  const { nombre: category, busqueda } = routeSnapshot.params;
  if (category && busqueda !== 'todos') {
    return ['buscador', '', category, ''];
  }

  const firstUrlSegment = routeSnapshot.url[0];
  const splittedUrlSegment = firstUrlSegment.path.split('-');
  if (splittedUrlSegment[0] === 'HOME') {
    splittedUrlSegment.splice(0, 1);
    return ['home', 'ver-mas', splittedUrlSegment.join(' '), ''];
  } else if (splittedUrlSegment[0] === 'todos') {
    splittedUrlSegment.splice(0, 1);
    return ['home', 'banner', category || '', ''];
  } else {
    return ['buscador', '', 'sinCategoria', ''];
  }
};

/**
 * Limpiar parámetros de búsqueda, quitando todos los que comiencen con `filter_`.
 * @param params
 * @returns
 */
export const cleanFilterSearchParams = (
  params: IElasticSearch
): Partial<IElasticSearch> => {
  const filteredKeys = Object.keys(params).filter(
    (key) => !key.startsWith('filter_')
  ) as (keyof IElasticSearch)[];
  return filteredKeys.reduce((acc, key) => {
    Object.assign(acc, { [key]: params[key] });
    return acc;
  }, {} as Partial<IElasticSearch>);
};

/**
 * Obtener filtros válidos, quitando los filtros ignorados.
 * @param attributes
 * @param ignoredFilters
 * @returns
 */
export const getValidFilters = (attributes: IFilters): IValidFilter[] => {
  const validFilters = Object.keys(attributes).filter(
    (key) => !IGNORED_FILTERS.includes(key.trim())
  );
  return validFilters.map((key) => ({
    name: key,
    values: attributes[key],
  }));
};

/*export const getBreadcrumbs = ({
  firstCategory,
  secondCategory,
  thirdCategory,
}: ICategoryParams) => {
  const breadcrumbs = [];
  if (firstCategory) {
    const category = firstCategory.replaceAll(/-/g, ' ');
    breadcrumbs.push({
      label: this.capitalize.transform(category),
      url: [
        '/',
        'inicio',
        'productos',
        this.textToSearch,
        'categoria',
        firstCategory,
      ],
    });
  }
};*/
