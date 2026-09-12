import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TentangKamiPage } from './tentang-kami.page';

const routes: Routes = [{ path: '', component: TentangKamiPage }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class TentangKamiPageRoutingModule {}
