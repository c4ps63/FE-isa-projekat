import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { HomeComponent } from './features/home/home.component';
import { VideoDetailComponent } from './features/video/video-detail/video-detail.component';
import { ProfileComponent } from './features/profile/profile.component';
import { VideoCardComponent } from './shared/components/video-card/video-card.component';
import { DurationPipe } from './shared/pipes/duration.pipe';
import { VideoUploadComponent } from './features/video/video-upload/video-upload.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    VideoDetailComponent,
    ProfileComponent,
    VideoCardComponent,
    DurationPipe,
    VideoUploadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }