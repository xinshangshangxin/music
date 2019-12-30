import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BillboardComponent } from './modules/billboard/billboard.component';
import { RankComponent } from './modules/billboard/rank/rank.component';
import { SearchComponent } from './modules/billboard/search/search.component';
import { SettingComponent } from './modules/billboard/setting/setting.component';
import { SongListComponent } from './modules/billboard/song-list/song-list.component';
import { HomeComponent } from './modules/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        component: BillboardComponent,

        children: [
          {
            path: '',
            component: RankComponent,
          },
          {
            path: 'list',
            component: SongListComponent,
          },
          {
            path: 'search',
            component: SearchComponent,
          },
          {
            path: 'setting',
            component: SettingComponent,
          },
        ],
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
