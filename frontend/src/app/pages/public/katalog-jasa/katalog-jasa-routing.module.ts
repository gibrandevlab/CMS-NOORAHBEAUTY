import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KatalogJasaPage } from './katalog-jasa.page';

const routes: Routes = [
  {
    path: '',
    component: KatalogJasaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KatalogJasaPageRoutingModule {}
