import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/services/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { HomeComponent } from './features/home/home.component';
import { VideoDetailComponent } from './features/video/video-detail/video-detail.component';
import { ProfileComponent } from './features/profile/profile.component';
import { VideoCardComponent } from './shared/components/video-card/video-card.component';
import { DurationPipe } from './shared/pipes/duration.pipe';
import { VideoUploadComponent } from './features/video/video-upload/video-upload.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoginComponent } from './features/auth/login/login.component';
import { MapComponent } from './shared/components/map/map.component';
import { WatchPartyComponent } from './features/watch-party/watch-party.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    VideoDetailComponent,
    ProfileComponent,
    VideoCardComponent,
    DurationPipe,
    VideoUploadComponent,
    LoginComponent,
    MapComponent,
    WatchPartyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule 
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }