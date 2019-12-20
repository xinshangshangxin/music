import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphQLModule } from './core/apollo/graphql.module';
import { CoreModule } from './core/core.module';
import { BillboardComponent } from './modules/billboard/billboard.component';
import { LeftNavComponent } from './modules/billboard/left-nav/left-nav.component';
import { SearchComponent } from './modules/billboard/search/search.component';
import { SettingComponent } from './modules/billboard/setting/setting.component';
import { SongListComponent } from './modules/billboard/song-list/song-list.component';
import { TopNavComponent } from './modules/billboard/top-nav/top-nav.component';
import { HomeComponent } from './modules/home/home.component';
import { PlayBarComponent } from './modules/play-bar/play-bar.component';
import { ShareModule } from './share/share/share.module';

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
    SearchComponent,
    SettingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
    ShareModule,
    GraphQLModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
