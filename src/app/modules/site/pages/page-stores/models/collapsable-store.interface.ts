import { IStore } from '@core/services-v2/geolocation/models/store.interface';

export type ICollapsableStore = IStore & { isCollapsed: boolean };
