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
import { SearchComponent } from './search/search.component';
import { PlayerService } from './services/player.service';
import { SongListComponent } from './song-list/song-list.component';

@NgModule({
  declarations: [AppComponent, SearchComponent, ControlsComponent, SongListComponent],
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
})
export class AppModule {}
