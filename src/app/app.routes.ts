import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'items',
    loadComponent: () => import('./routes/item/item.component').then(c => c.ItemComponent)
  },
  {
    path: '**',
    redirectTo: 'items'
  }
];
