import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SongService {
  private apiUrl = 'http://127.0.0.1:8000/api/get-song/';

  constructor(private http: HttpClient) {}

  sendCity(song: string) {
    return this.http.post<any>(this.apiUrl, { song: song });
  }
  
  getmp3(id: string) {
    return this.http.get<any>(this.apiUrl, {
      params: { id }
    });
  }
  
}
