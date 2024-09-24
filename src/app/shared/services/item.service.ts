import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Item } from '../interfaces/item';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private _http = inject(HttpClient);

  constructor() { }

  getAllItem(): Observable<Item[]> {
    return this._http.get<Item[]>(environment.api_server + '/api/items');
  }

  addItem(item: Item): Observable<Item> {
    return this._http.post<Item>(environment.api_server + '/api/item', item);
  }

  updateItem(id: number, item: Item): Observable<Item> {
    return this._http.put<Item>(environment.api_server + '/api/item/' + id, item);
  }

  delete(id: number): Observable<void> {
    return this._http.delete<void>(environment.api_server + '/api/item/' + id);
  }
}
