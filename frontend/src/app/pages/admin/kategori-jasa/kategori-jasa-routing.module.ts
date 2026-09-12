import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KategoriJasaPage } from './kategori-jasa.page';

const routes: Routes = [{ path: '', component: KategoriJasaPage }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class KategoriJasaPageRoutingModule {}
