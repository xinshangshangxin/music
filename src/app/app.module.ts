import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { GraphQLModule } from './graphql/graphql.module';
import { PlayerService } from './services/player.service';
import { PlayerStorageService } from './services/rx-player/player-storage.service';
import { PreloadQueueService } from './services/rx-player/preload-queue.service';
import { RxPlayerService } from './services/rx-player/rx-player.service';
import { SongListComponent } from './song-list/song-list.component';

@NgModule({
  declarations: [AppComponent, SongListComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    HttpClientModule,
    GraphQLModule,
  ],
  providers: [PlayerService, PlayerStorageService, PreloadQueueService, RxPlayerService],
  bootstrap: [AppComponent],
})
export class AppModule {}
