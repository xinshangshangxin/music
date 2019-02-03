import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ControlsComponent } from './controls/controls.component';
import { CustomerMaterialModule } from './customer-material/customer-material.module';
import { GraphQLModule } from './graphql/graphql.module';
import { HomeComponent } from './home/home.component';
import { PlaylistControlComponent } from './playlist/playlist-control/playlist-control.component';
import { PlaylistCreateComponent } from './playlist/playlist-create/playlist-create.component';
import { SearchComponent } from './search/search.component';
import { PlayerService } from './services/player.service';
import { SongListComponent } from './song-list/song-list.component';
import { SongDropListComponent } from './song-drop-list/song-drop-list.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchComponent,
    ControlsComponent,
    SongListComponent,
    HomeComponent,
    PlaylistControlComponent,
    PlaylistCreateComponent,
    SongDropListComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CustomerMaterialModule,
    HttpClientModule,
    GraphQLModule,
  ],
  providers: [PlayerService],
  bootstrap: [AppComponent],
  entryComponents: [PlaylistCreateComponent],
})
export class AppModule {}
