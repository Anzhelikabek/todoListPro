import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User } from '../interfaces/user';
import { Todo } from '../interfaces/todo';
import { AuditRecord } from '../interfaces/audit-record';

@Injectable({
  providedIn: 'root',
})
export class SharedStateService {
  private usersSubject = new BehaviorSubject<User[]>([]);
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  private userOptionsSubject = new BehaviorSubject<{ label: string; value: string | undefined }[]>([]);
  private auditTrailSubject = new BehaviorSubject<AuditRecord[]>([]);

  userOptions$ = this.userOptionsSubject.asObservable();
  auditTrail$ = this.auditTrailSubject.asObservable();
  users$ = this.usersSubject.asObservable();
  todos$ = this.todosSubject.asObservable();


  constructor() {
    this.initializeState();
  }

  // === Инициализация данных ===

  private initializeState(): void {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    this.setUsers(users);
    this.setTodos(todos);
  }

  // === Пользователи ===

  setUsers(users: User[]): void {
    this.usersSubject.next(users);
    this.updateUserOptions();
    this.saveUsersToLocalStorage();
  }

  getUsers(): Observable<User[]> {
    return of(this.usersSubject.getValue());
  }

  private saveUsersToLocalStorage(): void {
    const users = this.usersSubject.getValue();
    localStorage.setItem('users', JSON.stringify(users));
  }


  deleteUserWithTodos(userId: string): Observable<boolean> {
    // Удаляем пользователя
    const updatedUsers = this.usersSubject.getValue().filter((user) => user.id !== userId);
    this.usersSubject.next(updatedUsers);

    // Удаляем связанные задачи
    const updatedTodos = this.todosSubject.getValue().filter((todo) => todo.userId !== userId);
    this.todosSubject.next(updatedTodos);

    // Обновляем localStorage для пользователей и задач
    this.saveUsersToLocalStorage();
    this.saveTodosToLocalStorage();

    // Обновляем userOptions
    this.updateUserOptions();

    return of(true);
  }


  private updateUserOptions(): void {
    const userOptions = this.usersSubject.getValue().map((user) => ({
      label: `${user.firstName} ${user.lastName}`,
      value: user.id,
    }));
    this.userOptionsSubject.next(userOptions); // Обновляем userOptions
  }


  // === Задачи ===

  setTodos(todos: Todo[]): void {
    this.todosSubject.next(todos);
    this.saveTodosToLocalStorage();
  }

  getTodos(): Observable<Todo[]> {
    return of(this.todosSubject.getValue());
  }

  addTodo(newTodo: Todo): Observable<Todo> {
    const todos = this.todosSubject.getValue();
    const updatedTodo = { ...newTodo, id: this.generateId() };
    this.todosSubject.next([...todos, updatedTodo]);
    this.saveTodosToLocalStorage();
    return of(updatedTodo);
  }

  updateTodo(todoId: string, updatedData: Partial<Todo>): Observable<Todo> {
    const todos = this.todosSubject.getValue();
    const index = todos.findIndex((todo) => todo.id === todoId);

    if (index === -1) {
      return throwError(() => new Error('Задача не найдена'));
    }

    todos[index] = { ...todos[index], ...updatedData };
    this.todosSubject.next([...todos]);
    this.saveTodosToLocalStorage();
    return of(todos[index]);
  }

  deleteTodo(todoId: string): Observable<boolean> {
    const todos = this.todosSubject.getValue();
    const updatedTodos = todos.filter((todo) => todo.id !== todoId);
    this.todosSubject.next(updatedTodos);
    this.saveTodosToLocalStorage();
    return of(true);
  }

  private saveTodosToLocalStorage(): void {
    const todos = this.todosSubject.getValue();
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // === Аудит ===

  addAuditRecord(record: AuditRecord): void {
    const currentAuditTrail = this.auditTrailSubject.getValue();
    this.auditTrailSubject.next([...currentAuditTrail, record]);
    this.saveAuditTrailToLocalStorage();
  }

  getAuditTrail(): AuditRecord[] {
    return this.auditTrailSubject.getValue();
  }

  private saveAuditTrailToLocalStorage(): void {
    const auditTrail = this.auditTrailSubject.getValue();
    localStorage.setItem('auditTrail', JSON.stringify(auditTrail));
  }

  private loadAuditTrailFromLocalStorage(): void {
    const storedAuditTrail = localStorage.getItem('auditTrail');
    if (storedAuditTrail) {
      this.auditTrailSubject.next(JSON.parse(storedAuditTrail));
    }
  }

  // === Вспомогательные методы ===

  generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
