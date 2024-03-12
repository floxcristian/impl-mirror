import { ICity } from '@core/services-v2/geolocation/models/city.interface';
import { removeSpecialCharacters } from './utils';

/*
export const getSelectedCityId = (cities: ICity[], city: string): string => {
  if (!city) return '';
  const formattedCity = removeSpecialCharacters(city);
  const itemCity = cities.find(
    (item) => removeSpecialCharacters(item.city) === formattedCity
  );
  if (!itemCity) return '';
  this.localities = itemCity.localities;
  this.setLocality(formattedCity);
  return itemCity.id;
}*/
