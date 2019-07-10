import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ControlsComponent } from './controls/controls.component';
import { CoreModule } from './core/core.module';
import { GraphQLModule } from './graphql/graphql.module';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';
import { ConfigService } from './services/config.service';
import { LocateService } from './services/locate.service';
import { PersistService } from './services/persist.service';
import { PlayerListService } from './services/player-list.service';
import { PreloadService } from './services/preload.service';
import { SearchService } from './services/search.service';
import { StorageService } from './services/storage.service';
import { SongListComponent } from './song-list/song-list.component';

@NgModule({
  declarations: [
    AppComponent,
    SongListComponent,
    HomeComponent,
    ControlsComponent,
    SearchComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    HttpClientModule,
    GraphQLModule,
    FormsModule,
  ],
  providers: [
    ConfigService,
    LocateService,
    PersistService,
    PlayerListService,
    PreloadService,
    SearchService,
    StorageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
