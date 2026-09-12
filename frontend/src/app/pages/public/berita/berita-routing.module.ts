import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BeritaPage } from './berita.page';

const routes: Routes = [
  {
    path: '',
    component: BeritaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BeritaPageRoutingModule {}
