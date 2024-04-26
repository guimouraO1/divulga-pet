import { Component, OnDestroy, OnInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import L, {
  icon,
  latLng,
  LatLngBounds,
  marker,
  Marker,
  tileLayer,
} from 'leaflet';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { Pet } from '../../models/pet.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent implements OnInit, OnDestroy {
  map: any;
  layers: any[] = [];
  private destroy$ = new Subject<void>();

  options = {
    layers: [
      tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        { maxZoom: 18 }
      ),
    ],
    zoom: 4,
    center: latLng(-20, -65),
    minZoom: 4,
    maxBounds: new LatLngBounds(
      latLng(-40.0, -110.0), // Latitude mínima e longitude mínima (Sul e Oeste)
      latLng(10.0, -10.0) // Latitude máxima e longitude máxima (Norte e Leste)
    ),
  };

  constructor(private petService: PetService, private route: ActivatedRoute) {}

  async ngOnInit() {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (params) => {
        const lat: any = params.get('lat');
        const lon: any = params.get('lon');
        const zoom: any = params.get('zoom');
        if (zoom) {
          this.options.zoom = parseInt(zoom);
        }
        if (lat && lon) {
          this.options.center = latLng(parseFloat(lat), parseFloat(lon));
        }
      });

    // await this.getPublications();
  }

  async getPublications() {
    try {
      const res: any = await lastValueFrom(
        this.petService.getPublications('', 0, 100, 'find')
      );

      res.publications.forEach((pet: Pet) => {
        const marker = L.marker(JSON.parse(pet.latlon), {
          icon: this.createIcon(pet.filename),
        }).on('click', () => {
          console.log(pet.name);
        });
        this.layers.push(marker);
      });
    } catch (error) {}
  }

  createIcon(filename: string) {
    return icon({
      iconSize: [48, 48],
      className: 'map-image',
      iconUrl: filename,
    });
  }

  async onMapReady(map: any) {
    this.map = map;
    await this.getPublications();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
