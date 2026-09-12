import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorPage } from './vendor.page';

const routes: Routes = [{ path: '', component: VendorPage }];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class VendorPageRoutingModule {}
