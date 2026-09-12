import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { KatalogJasaPageRoutingModule } from './katalog-jasa-routing.module';

import { KatalogJasaPage } from './katalog-jasa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KatalogJasaPageRoutingModule
  ],
  declarations: [KatalogJasaPage]
})
export class KatalogJasaPageModule {}
