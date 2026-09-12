import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { KategoriJasaPageRoutingModule } from './kategori-jasa-routing.module';
import { KategoriJasaPage } from './kategori-jasa.page';

@NgModule({
  imports: [CommonModule, IonicModule, KategoriJasaPageRoutingModule],
  declarations: [KategoriJasaPage],
})
export class KategoriJasaPageModule {}
