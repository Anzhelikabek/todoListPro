import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly todosUrl = 'assets/data/todos.json'; // Путь к JSON файлу

  private todos: any[] = []; // Кэшируем данные локально

  constructor(private http: HttpClient) {}

  // Получение всех задач
  getTodos(): Observable<any[]> {
    // Если данные уже загружены, возвращаем их
    if (this.todos.length > 0) {
      return of(this.todos);
    }

    // Если данных нет, загружаем из JSON файла
    return this.http.get<any[]>(this.todosUrl).pipe(
        map((data) => {
          this.todos = data; // Сохраняем данные локально
          return this.todos;
        }),
        catchError((error) => {
          console.error('Ошибка загрузки данных из файла:', error);
          return of([]);
        })
    );
  }

  // Добавление нового задания
// Метод для добавления новой задачи
  addTodo(todo: any): Observable<any> {
    todo.id = this.generateId(); // Генерация уникального ID
    this.todos.push(todo); // Добавляем задачу в массив
    return of(todo); // Возвращаем Observable с новой задачей
  }

// Метод для обновления существующей задачи
  updateTodo(id: string, updatedTodo: any): Observable<any> {
    const index = this.todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      this.todos[index] = { ...this.todos[index], ...updatedTodo };
      return of(this.todos[index]); // Возвращаем обновленную задачу
    } else {
      return throwError('Задача не найдена');
    }
  }


  // Удаление задания
  deleteTodo(todoId: string): Observable<boolean> {
    const initialLength = this.todos.length;
    this.todos = this.todos.filter((todo) => todo.id !== todoId);
    const wasDeleted = this.todos.length < initialLength;
    return of(wasDeleted); // true, если задача была удалена
  }



  // Генерация уникального ID
  private generateId(): string {
    return (Math.floor(Math.random() * 100000)).toString();
  }
}
