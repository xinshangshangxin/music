import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomerMaterialModule } from './customer-material/customer-material.module';
import { HttpClientModule } from '@angular/common/http';
import { GraphQLModule } from './graphql/graphql.module';
import { SearchComponent } from './search/search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AudioService } from './services/audio.service';
import { PlayerService } from './services/player.service';
import { ControlsComponent } from './controls/controls.component';
import { AudioPeakService } from './services/audio-peak.service';

@NgModule({
  declarations: [AppComponent, SearchComponent, ControlsComponent],
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
  providers: [AudioService, PlayerService, AudioPeakService],
  bootstrap: [AppComponent],
})
export class AppModule {}
