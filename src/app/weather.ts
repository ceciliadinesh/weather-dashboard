
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, switchMap, map, throwError } from 'rxjs';

interface GeocodingResponse {
  results?: {
    name: string;
    country: string;
    country_code: string;
    latitude: number;
    longitude: number;
  }[];
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    wind_speed_10m: number;
    pressure_msl: number;
    weather_code: number;
  };
}

export interface WeatherData {
  name: string;
  sys: {
    country: string;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly geocodingUrl =
    'https://geocoding-api.open-meteo.com/v1/search';

  private readonly weatherUrl =
    'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<WeatherData> {
    const geocodingParams = new HttpParams()
      .set('name', city)
      .set('count', '1')
      .set('language', 'en')
      .set('format', 'json');

    return this.http
      .get<GeocodingResponse>(this.geocodingUrl, {
        params: geocodingParams
      })
      .pipe(
        switchMap((location) => {
          if (!location.results || location.results.length === 0) {
            return throwError(() => new Error('CITY_NOT_FOUND'));
          }

          const cityData = location.results[0];

          const weatherParams = new HttpParams()
            .set('latitude', cityData.latitude)
            .set('longitude', cityData.longitude)
            .set(
              'current',
              'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,pressure_msl,weather_code'
            )
            .set('timezone', 'auto');

          return this.http
            .get<OpenMeteoResponse>(this.weatherUrl, {
              params: weatherParams
            })
            .pipe(
              map((response): WeatherData => {
                const current = response.current;
                const condition = this.getCondition(
                  current.weather_code
                );

                return {
                  name: cityData.name,
                  sys: {
                    country: cityData.country_code
                  },
                  main: {
                    temp: current.temperature_2m,
                    feels_like: current.apparent_temperature,
                    humidity: current.relative_humidity_2m,
                    pressure: current.pressure_msl
                  },
                  weather: [
                    {
                      main: condition.main,
                      description: condition.description,
                      icon: condition.icon
                    }
                  ],
                  wind: {
                    speed: current.wind_speed_10m
                  }
                };
              })
            );
        })
      );
  }

  private getCondition(code: number): {
    main: string;
    description: string;
    icon: string;
  } {
    if (code === 0) {
      return {
        main: 'Clear',
        description: 'Clear sky',
        icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png'
      };
    }

    if ([1, 2].includes(code)) {
      return {
        main: 'Clouds',
        description: 'Partly cloudy',
        icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png'
      };
    }

    if (code === 3) {
      return {
        main: 'Clouds',
        description: 'Overcast',
        icon: 'https://cdn-icons-png.flaticon.com/512/414/414927.png'
      };
    }

    if ([45, 48].includes(code)) {
      return {
        main: 'Fog',
        description: 'Foggy conditions',
        icon: 'https://cdn-icons-png.flaticon.com/512/4005/4005901.png'
      };
    }

    if ([51, 53, 55, 56, 57].includes(code)) {
      return {
        main: 'Drizzle',
        description: 'Drizzle',
        icon: 'https://cdn-icons-png.flaticon.com/512/3076/3076129.png'
      };
    }

    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
      return {
        main: 'Rain',
        description: 'Rainy conditions',
        icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163657.png'
      };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
      return {
        main: 'Snow',
        description: 'Snowy conditions',
        icon: 'https://cdn-icons-png.flaticon.com/512/642/642102.png'
      };
    }

    if ([95, 96, 99].includes(code)) {
      return {
        main: 'Thunderstorm',
        description: 'Thunderstorm',
        icon: 'https://cdn-icons-png.flaticon.com/512/1959/1959334.png'
      };
    }

    return {
      main: 'Weather',
      description: 'Current weather conditions',
      icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png'
    };
  }
}
