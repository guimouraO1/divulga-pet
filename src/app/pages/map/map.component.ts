import { Component, OnInit } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import L, { icon, latLng, LatLngBounds, LayerGroup, Marker, tileLayer } from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [LeafletModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements OnInit {
  map: any; // Adicione isso para referenciar o mapa

  ngOnInit(): void {
  }
  pets: any = [
    { name: 'Max', imageUrl: 'https://cdn.mindminers.com/blog/uploads/2022/11/pets.png', latLng: { lat: -20, lng: -65 }},
    { name: 'Bella', imageUrl: 'https://cdn.mindminers.com/blog/uploads/2022/11/pets.png', latLng: { lat: -22, lng: -63 }},
  ];

  options = {
    layers: [
      tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 4,
    center: latLng(-20, -65),
    minZoom: 4,
    maxBounds: new LatLngBounds(
      latLng(-34.8, -74.2),
      latLng(5.2, -34.7)     
    ),
  };
  onMapReady(map: any) {
    console.log(map)
    this.map = map;
  }
}
