import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { JasaPageRoutingModule } from './jasa-routing.module';
import { JasaPage } from './jasa.page';

@NgModule({
  imports: [CommonModule, IonicModule, JasaPageRoutingModule],
  declarations: [JasaPage],
})
export class JasaPageModule {}
