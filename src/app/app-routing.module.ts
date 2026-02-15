import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { VideoDetailComponent } from './features/video/video-detail/video-detail.component';
import { ProfileComponent } from './features/profile/profile.component';
import { VideoUploadComponent } from './features/video/video-upload/video-upload.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { WatchPartyComponent } from './features/watch-party/watch-party.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent 
  },
  {
    path: 'upload',
    component: VideoUploadComponent
  },
  {
    path: 'video/:id',
    component: VideoDetailComponent
  },
  {
    path: 'profile/:username',
    component: ProfileComponent
  },
  {
    path: 'watch-party',
    component: WatchPartyComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }