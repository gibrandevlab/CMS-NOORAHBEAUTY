import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { VendorPageRoutingModule } from './vendor-routing.module';
import { VendorPage } from './vendor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    VendorPageRoutingModule,
  ],
  declarations: [VendorPage],
})
export class VendorPageModule {}
