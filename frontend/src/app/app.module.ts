import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './core/apollo/graphql.module';
import { CoreModule } from './core/core.module';
import { ControlsComponent } from './modules/controls/controls.component';
import { HomeComponent } from './modules/home/home.component';
import { SongListComponent } from './modules/song-list/song-list.component';

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
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
