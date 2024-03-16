import { Component } from '@angular/core';
import {GoogleMap} from '@angular/google-maps';
import {MapGeocoder} from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [GoogleMap, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent {
  state: any;
  places: any;
  locationList: string = '';
  lat: any;
  lon: any;
  options?: google.maps.MapOptions;


  constructor(private geocoder: MapGeocoder) {}

  async autocomplete(query: string) {
    if (query) {
      this.geocoder.geocode({ address: query }).pipe(take(1)).subscribe(({ results }) => {
        this.places = results;
        this.locationList = this.places[0].formatted_address;
        this.lat = results[0].geometry.location.lat();
        this.lon = results[0].geometry.location.lng();
        console.log(this.places);
        this.options = {
          center: { lat: this.lat, lng: this.lon },
          zoom: 16
        };

      });
    } else {
      this.places = [];
    }
  }

}
