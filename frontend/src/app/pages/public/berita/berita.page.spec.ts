import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeritaPage } from './berita.page';

describe('BeritaPage', () => {
  let component: BeritaPage;
  let fixture: ComponentFixture<BeritaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BeritaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
