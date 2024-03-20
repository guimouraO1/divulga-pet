import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pet } from '../models/pet.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PetService {
  private urlApi = `${environment.url}`;

  constructor(private http: HttpClient) {}

  getUserPublications(): Observable<Pet[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);
    
    return this.http.get<Pet[]>(`${this.urlApi}/userPublications`, { headers });
  }

  getPublications(filter: any, offset: number, limit: number): Observable<Pet[]> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    if (filter.species) {
      params = params.set('species', filter.species);
    }
    if (filter.status) {
      params = params.set('status', filter.status);
    }

    return this.http.get<Pet[]>(`${this.urlApi}/publications`, { params: params });
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


  rescuePet(friendUserId: string, petPostId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    return this.http.post(`${this.urlApi}/friends`, { friendUserId, petPostId }, { headers });
  }
  
}
