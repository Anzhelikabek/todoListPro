import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly usersUrl = 'assets/data/users.json'; // Путь к JSON файлу

  private users: any[] = []; // Кэшируем данные локально

  constructor(private http: HttpClient) {}

  // Получение всех пользователей
  getUsers(): Observable<any[]> {
    // Если данные уже загружены, возвращаем их
    if (this.users.length > 0) {
      return of(this.users);
    }

    // Если данных нет, загружаем из JSON файла
    return this.http.get<any[]>(this.usersUrl).pipe(
        map((data) => {
          this.users = data; // Сохраняем данные локально
          return this.users;
        }),
        catchError((error) => {
          console.error('Ошибка загрузки данных из файла:', error);
          return of([]);
        })
    );
  }

  // Добавление нового пользователя
  addUser(user: any): Observable<any> {
    user.id = this.generateId(); // Генерируем уникальный ID
    this.users.push(user); // Добавляем в локальный массив
    return of(user); // Возвращаем добавленный элемент
  }

  // Обновление пользователя
  updateUser(userId: string, updatedUser: any): Observable<any> {
    const index = this.users.findIndex((user) => user.id === userId);
    if (index !== -1) {
      this.users[index] = updatedUser;
      return of(updatedUser); // Возвращаем обновлённый элемент
    }
    return of(null); // Если элемент не найден
  }

  // Удаление пользователя
  deleteUser(userId: string): Observable<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter((user) => user.id !== userId);
    return of(this.users.length < initialLength); // Возвращаем true, если элемент был удалён
  }

  // Генерация уникального ID
  private generateId(): string {
    return (Math.floor(Math.random() * 100000)).toString();
  }
}
