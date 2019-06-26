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
import { PlayerService } from './services/player.service';
import { PlayerStorageService } from './services/rx-player/player-storage.service';
import { PreloadQueueService } from './services/rx-player/preload-queue.service';
import { RxPlayerService } from './services/rx-player/rx-player.service';
import { SearchService } from './services/search.service';
import { SongListComponent } from './song-list/song-list.component';
import { SearchComponent } from './search/search.component';

@NgModule({
  declarations: [AppComponent, SongListComponent, HomeComponent, ControlsComponent, SearchComponent],
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
    PlayerService,
    PlayerStorageService,
    PreloadQueueService,
    RxPlayerService,
    SearchService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
