import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploaderComponent } from './uploader/uploader.component';
import { CamComponent } from './cam/cam.component';
import { DrawCanvasComponent } from './draw-canvas/draw-canvas.component';


const routes: Routes = [
  { path: 'upload', component: UploaderComponent },
  { path: 'cam', component: CamComponent },
  { path: 'draw', component: DrawCanvasComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
