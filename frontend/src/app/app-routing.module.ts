import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BillboardComponent } from './modules/billboard/billboard.component';
import { HomeComponent } from './modules/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: BillboardComponent,

        // children: [
        //   {
        //     path: '',
        //   }
        // ]
      },
      {
        path: 'lrc',
        component: BillboardComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
