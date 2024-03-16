import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMap, MapMarker, MapGeocoder } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    GoogleMap,
    MapMarker,
    
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  location: string = '';
  locationInput: any;
  options?: google.maps.MapOptions;
  positionLatLng!: google.maps.LatLngLiteral;

  constructor(private geocoder: MapGeocoder) {}

  async autocomplete(query: string) {
    if (query) {
      this.geocoder
        .geocode({ address: query, language: 'pt-BR' })
        .pipe(take(1))
        .subscribe(({ results }) => {
          this.location = results[0].formatted_address;
          this.locationInput = results[0].formatted_address;

          this.positionLatLng = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng()};

          this.options = {
            center: this.positionLatLng,
            zoom: 16,
          };
        });
    } else {
    }
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((positionLatLng) => {
        this.positionLatLng = { lat: positionLatLng.coords.latitude, lng: positionLatLng.coords.longitude };

        this.geocoder
          .geocode({ location: this.positionLatLng })
          .pipe(take(1))
          .subscribe(({ results }) => {
            this.location = results[0].formatted_address;
            this.locationInput = results[0].formatted_address;

            this.options = {
              center: this.positionLatLng,
              zoom: 16,
            };
          });
      });
    } else {
    }
  }
}
