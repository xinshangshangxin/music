import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './core/apollo/graphql.module';
import { CoreModule } from './core/core.module';
import { BillboardComponent } from './modules/billboard/billboard.component';
import { LeftNavComponent } from './modules/billboard/left-nav/left-nav.component';
import { RankComponent } from './modules/billboard/rank/rank.component';
import { SearchComponent } from './modules/billboard/search/search.component';
import { SettingComponent } from './modules/billboard/setting/setting.component';
import { SongListComponent } from './modules/billboard/song-list/song-list.component';
import { TopNavComponent } from './modules/billboard/top-nav/top-nav.component';
import { PlaylistComponent } from './modules/dialog/playlist/playlist.component';
import { HomeComponent } from './modules/home/home.component';
import { PlayBarComponent } from './modules/play-bar/play-bar.component';
import { ShareModule } from './share/share.module';

@NgModule({
  entryComponents: [PlaylistComponent],
  declarations: [
    AppComponent,
    HomeComponent,
    PlayBarComponent,
    SongListComponent,
    PlayBarComponent,
    BillboardComponent,
    TopNavComponent,
    LeftNavComponent,
    SearchComponent,
    SettingComponent,
    PlaylistComponent,
    RankComponent,
  ],
  imports: [CoreModule, ShareModule, AppRoutingModule, GraphQLModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
