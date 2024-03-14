import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pet } from '../models/pet.model';
import { Observable, lastValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  private urlApi = `${environment.url}`;

  constructor(private http: HttpClient) {}

  getPublications(offset: number, limit: number): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.urlApi}/publications?offset=${offset}&limit=${limit}`);
  }
}
