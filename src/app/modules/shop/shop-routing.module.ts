// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Pages
import { PageCategoryComponent } from './pages/page-category/page-category.component';
import { PageProductComponent } from './pages/page-product/page-product.component';

const routes: Routes = [
  {
    path: '',
    component: PageCategoryComponent,
  },
  {
    path: 'ficha/:id',
    component: PageProductComponent,
  },
  {
    path: 'ficha/:id/:firstCategory',
    component: PageProductComponent,
  },

  {
    path: 'ficha/:id/:firstCategory/:secondCategory',
    component: PageProductComponent,
  },
  {
    path: 'ficha/:id/:firstCategory/:secondCategory/:thirdCategory',
    component: PageProductComponent,
  },
  {
    path: 'vehicle/:patent/:SIICode',
    component: PageCategoryComponent,
  },
  {
    path: 'vehicle/:patent/:SIICode/:nombre',
    component: PageCategoryComponent,
  },
  {
    path: ':busqueda/:metodo/:nombre',
    component: PageCategoryComponent,
  },
  {
    path: ':busqueda/:metodo/:nombre/:secondCategory',
    component: PageCategoryComponent,
  },
  {
    path: ':busqueda/:metodo/:nombre/:secondCategory/:thirdCategory',
    component: PageCategoryComponent,
  },
  {
    path: ':busqueda',
    component: PageCategoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopRoutingModule {}
