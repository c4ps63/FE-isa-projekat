import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// app-routing.module.ts
const routes: Routes = [
  { path: '', component: HomeComponent },                    // Lista videa
  { path: 'login', component: LoginComponent },              
  { path: 'register', component: RegisterComponent },        
  { path: 'video/:id', component: VideoDetailComponent },    // Detalj videa
  { path: 'profile/:username', component: ProfileComponent },// Profil korisnika
  { 
    path: 'upload', 
    component: VideoUploadComponent, 
    canActivate: [AuthGuard]                                 // Zaštićena ruta
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
