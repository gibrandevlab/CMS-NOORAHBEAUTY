import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { QuillModule } from 'ngx-quill';
import { AdminBeritaPageRoutingModule } from './berita-routing.module';
import { AdminBeritaPage } from './berita.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    QuillModule.forRoot(),
    AdminBeritaPageRoutingModule,
  ],
  declarations: [AdminBeritaPage],
})
export class BeritaPageModule {}
