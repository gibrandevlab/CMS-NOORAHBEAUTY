import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { AdminBeritaPageRoutingModule } from './berita-routing.module';
import { AdminBeritaPage } from './berita.page';

@NgModule({
  imports: [CommonModule, IonicModule, AdminBeritaPageRoutingModule],
  declarations: [AdminBeritaPage],
})
export class BeritaPageModule {}
