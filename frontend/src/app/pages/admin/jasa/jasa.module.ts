import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { JasaPageRoutingModule } from './jasa-routing.module';
import { JasaPage } from './jasa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    JasaPageRoutingModule,
  ],
  declarations: [JasaPage],
})
export class JasaPageModule {}
