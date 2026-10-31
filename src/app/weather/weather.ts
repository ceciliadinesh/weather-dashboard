import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService, WeatherData } from '../weather';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './weather.html',
  styleUrl: './weather.css'
})
export class WeatherComponent {
  city = '';
  weather: WeatherData | null = null;
  loading = false;
  errorMessage = '';

  constructor(private weatherService: WeatherService) {}

  searchWeather(): void {
    const cityName = this.city.trim();

    if (!cityName) {
      this.weather = null;
      this.errorMessage = 'Please enter a city name.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.weather = null;

    this.weatherService.getWeather(cityName).subscribe({
      next: (data) => {
        this.weather = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Weather search failed:', error);

        this.weather = null;
        this.loading = false;

        if (error.message === 'CITY_NOT_FOUND') {
          this.errorMessage =
            'City not found. Please check the spelling.';
        } else {
          this.errorMessage =
            'Unable to fetch weather. Check your internet connection and try again.';
        }
      }
    });
  }
}