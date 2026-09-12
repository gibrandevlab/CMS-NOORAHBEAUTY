import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/admin/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'kategori-jasa',
        loadChildren: () => import('./pages/admin/kategori-jasa/kategori-jasa.module').then(m => m.KategoriJasaPageModule)
      },
      {
        path: 'jasa',
        loadChildren: () => import('./pages/admin/jasa/jasa.module').then(m => m.JasaPageModule)
      },
      {
        path: 'berita',
        loadChildren: () => import('./pages/admin/berita/berita.module').then(m => m.BeritaPageModule)
      },
      {
        path: 'vendor',
        loadChildren: () => import('./pages/admin/vendor/vendor.module').then(m => m.VendorPageModule)
      },
      {
        path: 'tentang-kami',
        loadChildren: () => import('./pages/admin/tentang-kami/tentang-kami.module').then(m => m.TentangKamiPageModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'berita',
    loadChildren: () => import('./pages/public/berita/berita.module').then( m => m.BeritaPageModule)
  },
  {
    path: 'katalog-jasa',
    loadChildren: () => import('./pages/public/katalog-jasa/katalog-jasa.module').then( m => m.KatalogJasaPageModule)
  },
  {
    path: 'beranda',
    loadChildren: () => import('./pages/public/beranda/beranda.module').then(m => m.BerandaPageModule)
  },
  {
    path: '',
    redirectTo: 'beranda',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
