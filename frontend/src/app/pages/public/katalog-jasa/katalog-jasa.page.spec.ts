import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KatalogJasaPage } from './katalog-jasa.page';

describe('KatalogJasaPage', () => {
  let component: KatalogJasaPage;
  let fixture: ComponentFixture<KatalogJasaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(KatalogJasaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
