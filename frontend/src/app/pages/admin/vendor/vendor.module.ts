import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { VendorPageRoutingModule } from './vendor-routing.module';
import { VendorPage } from './vendor.page';

@NgModule({
  imports: [CommonModule, IonicModule, VendorPageRoutingModule],
  declarations: [VendorPage],
})
export class VendorPageModule {}
