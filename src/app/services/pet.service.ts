import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Pet } from '../models/pet.model';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Friends } from '../models/friends.model';

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

  deletePublications(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);
    
    return this.http.delete(`${this.urlApi}/publications/${id}`, { headers });
  }

  getPublications(filter: any, offset: number, limit: number, page: string): Observable<Pet[]> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString());

    if (filter.species) {
      params = params.set('species', filter.species);
    }
    if (filter.status) {
      params = params.set('status', filter.status);
    }
    if (filter.id) {
      params = params.set('id', filter.id);
    }
    
    params = params.set('page', page);

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


  rescuePet(pet: Pet): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);
    console.log(pet)
    return this.http.post(`${this.urlApi}/friends`, { friendUserId: pet.user_id, petPostId: pet.id }, { headers });
  }

  rescueToHappyStories(id: Friends, text: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${token}`);

    const body = { rescuedById: id.id, publicationId: id.publicationId, text: text };
    return this.http.put(`${this.urlApi}/publications`, body, { headers });
}
}
