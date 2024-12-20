import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Указывает, что этот сервис доступен на уровне всего приложения
})
export class SocketService {
  private socket: Socket; // WebSocket-соединение

  constructor() {
    // Устанавливаем соединение с сервером
    this.socket = io('http://localhost:4200'); // Укажи URL сервера
  }

  /**
   * Получение сообщений от сервера
   * @returns Observable<string> — поток сообщений
   */
  getMessages(): Observable<string> {
    return new Observable((observer) => {
      this.socket.on('message', (message: string) => {
        observer.next(message); // Передаём сообщение подписчику
      });

      // Очистка обработчиков событий при завершении Observable
      return () => {
        this.socket.off('message'); // Убираем слушатель событий
      };
    });
  }

  /**
   * Отправка сообщения на сервер
   * @param message - Сообщение, которое нужно отправить
   */
  sendMessage(message: string): void {
    this.socket.emit('message', message); // Отправляем событие с сообщением
  }

  /**
   * Отправка события с кастомными данными
   * @param event - название события
   * @param data - данные для отправки
   */
  sendEvent(event: string, data: any): void {
    this.socket.emit(event, data); // Отправляем кастомное событие
  }

  /**
   * Получение данных по кастомному событию
   * @param event - название события
   * @returns Observable<any> — поток данных
   */
  onEvent(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data: any) => {
        observer.next(data); // Передаём данные подписчику
      });

      // Очистка обработчиков событий
      return () => {
        this.socket.off(event); // Убираем слушатель событий
      };
    });
  }

  /**
   * Отключение от сервера
   */
  disconnect(): void {
    this.socket.disconnect(); // Разрываем соединение
  }
}
