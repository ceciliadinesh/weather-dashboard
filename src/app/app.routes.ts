import { Routes } from '@angular/router';

import { HomeComponent } from './home/home';
import { WeatherComponent } from './weather/weather';
import { AboutComponent } from './about/about';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'weather',
    component: WeatherComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];