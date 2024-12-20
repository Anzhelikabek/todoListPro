import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private http: HttpClient) { }

  create(data: any){
    return this.http.post("http://localhost:4200/api/message", data)
  }
}
