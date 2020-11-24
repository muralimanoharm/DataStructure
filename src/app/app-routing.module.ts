import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MazeComponent } from './maze/maze.component';
import { SearchingComponent } from './searching/searching.component'
import { SortingComponent } from './sorting/sorting.component'

const routes: Routes = [
  { path : '', pathMatch:'prefix', redirectTo:'search' },
  { path : 'search', component:SearchingComponent},
  { path : 'sorting', component:SortingComponent},
  { path : 'maze' , component:MazeComponent } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
