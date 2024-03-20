import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleMap, MapMarker, MapGeocoder, MapGroundOverlay, MapInfoWindow } from '@angular/google-maps';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { lastValueFrom, take } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';

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
    MapGroundOverlay,
    MapInfoWindow
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})


export class MapComponent implements OnInit {
  @ViewChild(MapInfoWindow, {static: false}) infoWindow?: MapInfoWindow;

  location: string = '';
  locationInput: any;
  options?: google.maps.MapOptions;
  positionLatLng: google.maps.LatLngLiteral = {
    lat: -20,
    lng: -65
  };
  imageBounds: any;
  imageUrl = "https://media.istockphoto.com/id/1361394182/photo/funny-british-shorthair-cat-portrait-looking-shocked-or-surprised.jpg?s=612x612&w=0&k=20&c=6yvVxdufrNvkmc50nCLCd8OFGhoJd6vPTNotl90L-vo=";
  markerPositions: google.maps.LatLngLiteral[] = [];
  petList: Pet[] = [];


  constructor(private geocoder: MapGeocoder, private petService: PetService) {

  }
  ngOnInit(): void {
    this.getPublications();
    this.options = {
      center: this.positionLatLng,
      zoom: 4
    };
  }

  async getPublications(clearList: boolean = false) {
    try {
      const res: any = await lastValueFrom(
        this.petService.getPublications('', 0, 10)
      );
      const petList: Pet[] = res.publications;
      this.petList.push(...petList);

      this.petList.map(async (pet: Pet) => {
        const latLon = await this.autocomplete(pet.last_location);
        pet.latLon = latLon;
      });

      console.log(this.petList);
    } catch (error) {
      // Lidar com o erro aqui
    }
  }
  
  openInfoWindow(marker: MapMarker) {
    this.infoWindow!.open(marker);
  }

  async autocomplete(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (query) {
        this.geocoder
          .geocode({ address: query, language: 'pt-BR' })
          .pipe(take(1))
          .subscribe(({ results }: any) => {
            const positionLatLng = { 
              lat: results[0].geometry.location.lat(), 
              lng: results[0].geometry.location.lng() 
            };
            this.markerPositions.push(positionLatLng);
            resolve(positionLatLng);
          }, error => {
            reject(error);
          });
      } else {
        // Tratar o caso em que a consulta está vazia
        reject("Consulta vazia");
      }
    });
  }
  
}
