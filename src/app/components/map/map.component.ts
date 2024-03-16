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
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MapMarker,
    FormsModule,
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  locationList: string = '';
  lat: any;
  lon: any;
  options?: google.maps.MapOptions;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  position!: google.maps.LatLngLiteral;
  locationInput: any;

  constructor(private geocoder: MapGeocoder) {}

  async autocomplete(query: string) {
    if (query) {
      this.geocoder
        .geocode({ address: query, language: 'pt-BR' })
        .pipe(take(1))
        .subscribe(({ results }) => {
          console.log(results);
          this.locationList = results[0].formatted_address;
          this.locationInput = results[0].formatted_address;
          this.lat = results[0].geometry.location.lat();
          this.lon = results[0].geometry.location.lng();

          this.position = { lat: this.lat, lng: this.lon };

          this.options = {
            center: { lat: this.lat, lng: this.lon },
            zoom: 16,
          };
        });
    } else {
      
    }
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;
        this.position = { lat: this.lat, lng: this.lon };

        this.geocoder
          .geocode({ location: { lat: this.lat, lng: this.lon } })
          .pipe(take(1))
          .subscribe(({ results }) => {
            this.locationList = results[0].formatted_address;
            this.locationInput = results[0].formatted_address;

            this.options = {
              center: { lat: this.lat, lng: this.lon },
              zoom: 16,
            };
          });
      });
    } else {

    }
  }

}
