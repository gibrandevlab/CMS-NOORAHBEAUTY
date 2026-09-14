import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { TentangKamiPageRoutingModule } from './tentang-kami-routing.module';
import { TentangKamiPage } from './tentang-kami.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TentangKamiPageRoutingModule,
  ],
  declarations: [TentangKamiPage],
})
export class TentangKamiPageModule {}
