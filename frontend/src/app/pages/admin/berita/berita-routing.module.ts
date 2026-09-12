import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminBeritaPage } from './berita.page';

const routes: Routes = [{ path: '', component: AdminBeritaPage }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class AdminBeritaPageRoutingModule {}
