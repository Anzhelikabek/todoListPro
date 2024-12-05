import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import { User } from '../interfaces/user'; // Предполагаем, что ваш интерфейс находится в user.interface.ts

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly localStorageKey = 'users'; // Ключ для хранения данных в localStorage
  private usersSubject = new BehaviorSubject<User[]>([]); // Реактивное состояние пользователей
  users$ = this.usersSubject.asObservable(); // Observable для подписки на изменения

  constructor() {
    this.initializeUsers(); // Инициализация начальных данных
    this.loadUsersFromLocalStorage(); // Загрузка данных из localStorage
  }

  // Метод для инициализации пользователей в localStorage
  private initializeUsers(): void {
    const storedUsers = localStorage.getItem(this.localStorageKey);
    if (!storedUsers) {
      const initialUsers: User[] = [
        {
          "id": "639c79c1-11e5-499e-acd7-d0b3baa22669",
          "code": 9107,
          "firstName": "Айдана",
          "lastName": "Бекмаматова",
          "age": 25,
          "email": "aidana.bekmamatova@gmail.com",
          "phoneNumber": "789708350",
          "gender": "female",
          "address": "Ош, ул. Мира, д. 12",
          "dateOfBirth": "2001-10-26",
          "profilePicture": "https://picsum.photos/seed/67ec0f1a-10e1-4d4e-add5-9e0fa6bf9016/200/200",
          "role": "user"
        },
        {
          "id": "874a2920-3a63-4c02-8953-a7bdd770f8af",
          "code": 5642,
          "firstName": "Эрмек",
          "lastName": "Садыков",
          "age": 32,
          "email": "ermek.sadykov@gmail.com",
          "phoneNumber": "741994970",
          "gender": "male",
          "address": "Бишкек, ул. Панфилова, д. 45",
          "dateOfBirth": "1977-10-12",
          "profilePicture": "https://picsum.photos/seed/122ff46f-6d2e-4111-b2ac-046e4a3eb0e8/200/200",
          "role": "admin"
        },
        {
          "id": "9547ae61-aad0-4172-87ea-cf65c5c9abe3",
          "code": 9195,
          "firstName": "Нурлан",
          "lastName": "Ибраев",
          "age": 37,
          "email": "nurlan.ibraev@gmail.com",
          "phoneNumber": "747691937",
          "gender": "male",
          "address": "Жалал-Абад, ул. Ленина, д. 33",
          "dateOfBirth": "1994-11-04",
          "profilePicture": "https://picsum.photos/seed/55d527d7-4e94-44c3-ae11-df0275bfcd8d/200/200",
          "role": "user"
        },
        {
          "id": "18f3e371-9b90-4789-89fa-61434c8ff35f",
          "code": 8296,
          "firstName": "Асел",
          "lastName": "Байматова",
          "age": 40,
          "email": "asel.baymatova@gmail.com",
          "phoneNumber": "717946036",
          "gender": "female",
          "address": "Каракол, ул. Абдрахманова, д. 16",
          "dateOfBirth": "1972-11-14",
          "profilePicture": "https://picsum.photos/seed/1c1931c6-1822-4c14-8272-c84b448f56eb/200/200",
          "role": "user"
        },
        {
          "id": "37c67794-4142-45a7-b1e6-c91968326a0c",
          "code": 7798,
          "firstName": "Канат",
          "lastName": "Токтосунов",
          "age": 47,
          "email": "kanat.toktosunov@gmail.com",
          "phoneNumber": "777195309",
          "gender": "male",
          "address": "Нарын, ул. Манаса, д. 54",
          "dateOfBirth": "1965-06-12",
          "profilePicture": "https://picsum.photos/seed/495b8ff1-5985-4e2f-82a3-0b3b3edb10dc/200/200",
          "role": "admin"
        },
        {
          "id": "edfb1725-1253-43cc-97da-a39cce94e776",
          "code": 3453,
          "firstName": "Айпери",
          "lastName": "Жунусова",
          "age": 28,
          "email": "aiperi.zhunusova@gmail.com",
          "phoneNumber": "793518788",
          "gender": "female",
          "address": "Талас, ул. Рыскулова, д. 7",
          "dateOfBirth": "1972-11-26",
          "profilePicture": "https://picsum.photos/seed/4383d59e-2fa4-4685-9fae-66fd6fc8af44/200/200",
          "role": "user"
        },
        {
          "id": "a4e38640-76bf-4ab7-a8bd-50e7be2dcb86",
          "code": 7175,
          "firstName": "Марат",
          "lastName": "Бекешев",
          "age": 37,
          "email": "marat.bekeshev@gmail.com",
          "phoneNumber": "746392146",
          "gender": "male",
          "address": "Каракол, ул. Лесная, д. 21",
          "dateOfBirth": "2004-01-30",
          "profilePicture": "https://picsum.photos/seed/362e79ee-c5a8-4160-b66b-98d0857e59ae/200/200",
          "role": "user"
        },
        {
          "id": "c2443267-4b12-433e-acef-e93c60506404",
          "code": 7077,
          "firstName": "Айбек",
          "lastName": "Мусаев",
          "age": 47,
          "email": "aybek.musaev@gmail.com",
          "phoneNumber": "797898068",
          "gender": "male",
          "address": "Баткен, ул. Советская, д. 8",
          "dateOfBirth": "1985-04-03",
          "profilePicture": "https://picsum.photos/seed/ef6e7fd9-ccd9-4398-ad9a-24d2471437ac/200/200",
          "role": "user"
        },
        {
          "id": "0ccf8ef3-cf5a-45fa-b8b2-5f76838ad7d7",
          "code": 5301,
          "firstName": "Кубаныч",
          "lastName": "Абдраев",
          "age": 38,
          "email": "kubanych.abdraev@gmail.com",
          "phoneNumber": "713487600",
          "gender": "male",
          "address": "Токмок, ул. Бейшеналиева, д. 12",
          "dateOfBirth": "1978-07-10",
          "profilePicture": "https://picsum.photos/seed/4f380d03-baef-42ac-b31f-a1100b4efe73/200/200",
          "role": "admin"
        },
        {
          "id": "be76c3fe-7208-4b3e-ad39-49e32636d38e",
          "code": 7398,
          "firstName": "Анжелика",
          "lastName": "Бексултанова",
          "age": 19,
          "email": "anzhelika.beksultanova@gmail.com",
          "phoneNumber": "999090966",
          "gender": "female",
          "address": "Бишкек, ул. Молодой Гвардии, д. 3",
          "dateOfBirth": "2000-03-09",
          "profilePicture": "https://picsum.photos/seed/b552cc0d-cabd-49c1-8cd3-c20cf4c41171/200/200",
          "role": "admin"
        }
      ];
      localStorage.setItem(this.localStorageKey, JSON.stringify(initialUsers)); // Сохраняем начальные данные
    }
  }
  private loadUsersFromLocalStorage(): void {
    const storedUsers = localStorage.getItem(this.localStorageKey);
    const users = storedUsers ? JSON.parse(storedUsers) : [];
    this.usersSubject.next(users); // Устанавливаем начальное состояние
  }

  // Метод для сохранения данных в localStorage
  private saveUsersToLocalStorage(): void {
    const users = this.usersSubject.getValue();
    localStorage.setItem(this.localStorageKey, JSON.stringify(users));
  }

  // Получение всех пользователей
  getUsers(): Observable<User[]> {
    return this.users$; // Возвращаем Observable
  }

  // Добавление нового пользователя
  addUser(user: User): Observable<User> {
    user.id = this.generateId(); // Генерация уникального ID
    const currentUsers = this.usersSubject.getValue();
    const updatedUsers = [...currentUsers, user]; // Добавляем пользователя
    this.usersSubject.next(updatedUsers); // Обновляем состояние
    this.saveUsersToLocalStorage(); // Сохраняем изменения
    return of(user); // Возвращаем нового пользователя
  }

  // Обновление пользователя
  updateUser(userId: string, updatedUser: Partial<User>): Observable<User> {
    const currentUsers = this.usersSubject.getValue();
    const index = currentUsers.findIndex((user) => user.id === userId);
    if (index !== -1) {
      currentUsers[index] = { ...currentUsers[index], ...updatedUser };
      this.usersSubject.next([...currentUsers]); // Обновляем состояние
      this.saveUsersToLocalStorage(); // Сохраняем изменения
      return of(currentUsers[index]); // Возвращаем обновлённого пользователя
    } else {
      return throwError(() => new Error('Пользователь не найден'));
    }
  }

  // Удаление пользователя
  deleteUser(userId: string): Observable<boolean> {
    const currentUsers = this.usersSubject.getValue();
    const updatedUsers = currentUsers.filter((user) => user.id !== userId);
    const wasDeleted = currentUsers.length > updatedUsers.length;
    this.usersSubject.next(updatedUsers); // Обновляем состояние
    this.saveUsersToLocalStorage(); // Сохраняем изменения
    return of(wasDeleted); // true, если пользователь был удалён
  }

  // Генерация уникального ID
  private generateId(): string {
    return (Math.random() * 100000).toFixed(0).toString();
  }
}
