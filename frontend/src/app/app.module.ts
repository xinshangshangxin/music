import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { GraphQLModule } from './apollo/graphql.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ControlsComponent } from './controls/controls.component';
import { CoreModule } from './core/core.module';
import { HomeComponent } from './home/home.component';
import { ConfigService } from './services/config.service';
import { PersistService } from './services/persist.service';
import { PlayerService } from './services/player.service';
import { PreloadService } from './services/preload.service';
import { StorageService } from './services/storage.service';
import { SongListComponent } from './song-list/song-list.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, ControlsComponent, SongListComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    GraphQLModule,
    HttpClientModule,
  ],
  providers: [ConfigService, PersistService, PlayerService, PreloadService, StorageService],
  bootstrap: [AppComponent],
})
export class AppModule {}
