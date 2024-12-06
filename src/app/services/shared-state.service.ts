import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import {User} from "../interfaces/user";
import {Todo} from "../interfaces/todo";
import {AuditRecord} from "../interfaces/audit-record";

@Injectable({
  providedIn: 'root',
})
export class SharedStateService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  private todosSubject = new BehaviorSubject<Todo[]>([]);

  private auditTrailSubject = new BehaviorSubject<AuditRecord[]>([]); // Предполагается, что AuditRecord определён

  auditTrail$ = this.auditTrailSubject.asObservable();

  users$ = this.usersSubject.asObservable();
  todos$ = this.todosSubject.asObservable();

  constructor() {
    this.initializeState();
  }

  addAuditRecord(record: AuditRecord): void {
    const currentAuditTrail: AuditRecord[] = this.auditTrailSubject.getValue();
    this.auditTrailSubject.next([...currentAuditTrail, record]); // Добавляем запись
    this.saveAuditTrailToLocalStorage(); // Сохраняем изменения в localStorage
  }


  getAuditTrail(): AuditRecord[] {
    return this.auditTrailSubject.getValue();
  }

  // Сохранение данных в localStorage
  private saveAuditTrailToLocalStorage(): void {
    const auditTrail = this.auditTrailSubject.getValue();
    localStorage.setItem('auditTrail', JSON.stringify(auditTrail));
  }

  // Загрузка данных из localStorage
  private loadAuditTrailFromLocalStorage(): void {
    const storedAuditTrail = localStorage.getItem('auditTrail');
    if (storedAuditTrail) {
      this.auditTrailSubject.next(JSON.parse(storedAuditTrail));
    }
  }

  private initializeState(): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    this.setUsers(users);
    this.setTodos(todos);
  }


  // === Пользователи ===

  setUsers(users: User[]): void {
    this.usersSubject.next(users);
  }

  getUsers(): Observable<User[]> {
    return of(this.usersSubject.getValue());
  }


  // === Задачи ===

  setTodos(todos: Todo[]): void {
    this.todosSubject.next(todos);
  }

  getTodos(): Observable<Todo[]> {
    return of(this.todosSubject.getValue());
  }

  // === Вспомогательные методы ===

  private removeTodosByUserId(userId: string): void {
    const currentTodos = this.todosSubject.getValue();
    const updatedTodos = currentTodos.filter((todo) => todo.userId !== userId);
    this.todosSubject.next(updatedTodos);
  }

  generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  deleteUserWithTodos(userId: string): Observable<boolean> {
    // Удаляем пользователя
    const updatedUsers = this.usersSubject.getValue().filter(user => user.id !== userId);
    this.usersSubject.next(updatedUsers);

    // Удаляем связанные задачи
    const updatedTodos = this.todosSubject.getValue().filter(todo => todo.userId !== userId);
    this.todosSubject.next(updatedTodos);

    // Обновляем localStorage для пользователей и задач
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('todos', JSON.stringify(updatedTodos));

    // Возвращаем true, если всё прошло успешно
    return of(true);
  }



}
