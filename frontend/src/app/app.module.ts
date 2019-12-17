import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './core/apollo/graphql.module';
import { CoreModule } from './core/core.module';
import { BillboardComponent } from './modules/billboard/billboard.component';
import { LeftNavComponent } from './modules/billboard/left-nav/left-nav.component';
import { SongListComponent } from './modules/billboard/song-list/song-list.component';
import { TopNavComponent } from './modules/billboard/top-nav/top-nav.component';
import { HomeComponent } from './modules/home/home.component';
import { PlayBarComponent } from './modules/play-bar/play-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    PlayBarComponent,
    SongListComponent,
    PlayBarComponent,
    BillboardComponent,
    TopNavComponent,
    LeftNavComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    GraphQLModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
