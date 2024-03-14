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

  getSignature(selectedFile: File){
    return this.http.post(`${this.urlApi}/uploads`, { "name": selectedFile.name, "contentType": selectedFile.type })
  }

  uploadImageToCloudFlare(urlPresigned: string, file: File) {
    return this.http.put(urlPresigned, file);
  }

  getImageLink(fileKey: any){
    return this.http.get(`${this.urlApi}/uploads/${fileKey}`)
  }

  postPet(petForm: any) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    return this.http.post(`${this.urlApi}/publications`, petForm, { headers });
  }
  
}
