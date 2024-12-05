import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Injectable({
    providedIn: 'root',
})
export class TodoService {
    private readonly localStorageKey = 'todos';
    private todosSubject = new BehaviorSubject<any[]>([]); // Управляемое состояние
    todos$ = this.todosSubject.asObservable(); // Для подписки на изменения

    private todos: any[] = []; // Локальный кэш данных

    constructor() {
        this.initializeTodos(); // Инициализация данных
        this.loadTodosFromLocalStorage(); // Загрузка данных из localStorage
    }

    // Метод для инициализации данных в localStorage
    private initializeTodos(): void {
        const storedTodos = localStorage.getItem(this.localStorageKey);
        if (!storedTodos) {
            const initialTodos = [
                {
                    "id": "1e9d5f8b-91a3-4a1e-b953-91f8b0e3c5f1",
                    "code": 101,
                    "userId": "639c79c1-11e5-499e-acd7-d0b3baa22669",
                    "name": "Купить продукты",
                    "description": "Сходить в магазин и купить фрукты, овощи и хлеб.",
                    "status": false
                },
                {
                    "id": "e8b13c36-80d9-47ef-92ad-18b8bcee3d2b",
                    "code": 102,
                    "userId": "639c79c1-11e5-499e-acd7-d0b3baa22669",
                    "name": "Пропылесосить дом",
                    "description": "Убрать в гостиной и спальне, протереть пыль.",
                    "status": true
                },
                {
                    "id": "9f1de229-5f77-4fd4-96c7-9b08ab3d457d",
                    "code": 103,
                    "userId": "639c79c1-11e5-499e-acd7-d0b3baa22669",
                    "name": "Забрать посылку с почты",
                    "description": "Посылка с книгами, номер отслеживания: 123456.",
                    "status": false
                },
                {
                    "id": "7b39c28e-7df6-496d-b8f8-7d6a86b813a5",
                    "code": 104,
                    "userId": "639c79c1-11e5-499e-acd7-d0b3baa22669",
                    "name": "Сходить на тренировку",
                    "description": "Сделать разминку и пробежать 5 километров.",
                    "status": true
                },
                {
                    "id": "f98c802b-6295-4ed5-9453-40b8b7ea4d95",
                    "code": 105,
                    "userId": "639c79c1-11e5-499e-acd7-d0b3baa22669",
                    "name": "Позвонить подруге",
                    "description": "Обсудить планы на выходные.",
                    "status": false
                },
                {
                    "id": "b9a0f709-23a6-405b-80be-9d2a6cda6e2a",
                    "code": 201,
                    "userId": "874a2920-3a63-4c02-8953-a7bdd770f8af",
                    "name": "Написать отчёт",
                    "description": "Закончить еженедельный отчёт и отправить начальнику.",
                    "status": false
                },
                {
                    "id": "6c94cb3b-d2cc-4a4f-890f-58dc0332d6de",
                    "code": 202,
                    "userId": "874a2920-3a63-4c02-8953-a7bdd770f8af",
                    "name": "Проверить почту",
                    "description": "Ответить на важные письма.",
                    "status": true
                },
                {
                    "id": "2f634c90-44e8-4a17-8f2e-6b49d2f3a120",
                    "code": 203,
                    "userId": "874a2920-3a63-4c02-8953-a7bdd770f8af",
                    "name": "Сходить к врачу",
                    "description": "Запланированный осмотр у стоматолога.",
                    "status": false
                },
                {
                    "id": "0f7d453b-bab6-4048-8b90-2d8b987e88b2",
                    "code": 204,
                    "userId": "874a2920-3a63-4c02-8953-a7bdd770f8af",
                    "name": "Сделать домашние задания",
                    "description": "Завершить задания по курсу программирования.",
                    "status": false
                },
                {
                    "id": "f97a57bd-7a50-40c5-ae99-94b5ef245690",
                    "code": 205,
                    "userId": "874a2920-3a63-4c02-8953-a7bdd770f8af",
                    "name": "Посмотреть вебинар",
                    "description": "Тема: Новые технологии в IT.",
                    "status": true
                },
                {
                    "id": "d873b34c-6406-4d3a-8bd9-f8c3d6a9e6c7",
                    "code": 301,
                    "userId": "9547ae61-aad0-4172-87ea-cf65c5c9abe3",
                    "name": "Сходить в банк",
                    "description": "Оплатить кредит и уточнить баланс.",
                    "status": false
                },
                {
                    "id": "c0afc330-9bd9-4eb8-a8fa-dc3cb302458f",
                    "code": 302,
                    "userId": "9547ae61-aad0-4172-87ea-cf65c5c9abe3",
                    "name": "Почитать книгу",
                    "description": "Прочитать новую главу детектива.",
                    "status": true
                },
                {
                    "id": "f5de86b7-2192-4647-9c9e-8c0d873ef65b",
                    "code": 303,
                    "userId": "9547ae61-aad0-4172-87ea-cf65c5c9abe3",
                    "name": "Проверить технику",
                    "description": "Проверить исправность машины и заехать на СТО.",
                    "status": false
                },
                {
                    "id": "fd3a0f4c-6fb3-48f2-947e-8b5e9dc3b1a9",
                    "code": 304,
                    "userId": "9547ae61-aad0-4172-87ea-cf65c5c9abe3",
                    "name": "Посетить библиотеку",
                    "description": "Вернуть книги и взять новые.",
                    "status": true
                },
                {
                    "id": "a7f0b69c-49b6-4f1f-b8ea-7b8a2d4c5ef9",
                    "code": 305,
                    "userId": "9547ae61-aad0-4172-87ea-cf65c5c9abe3",
                    "name": "Сделать закупки для дома",
                    "description": "Купить новые лампы и батарейки.",
                    "status": false
                },
                {
                    "id": "8653f830-d3c7-4b79-8b33-d75ae5c6fa91",
                    "code": 401,
                    "userId": "18f3e371-9b90-4789-89fa-61434c8ff35f",
                    "name": "Убраться на кухне",
                    "description": "Помыть посуду и вытереть стол.",
                    "status": false
                },
                {
                    "id": "abc173f8-d4e5-4e59-8c11-bc7e87f4fa63",
                    "code": 402,
                    "userId": "18f3e371-9b90-4789-89fa-61434c8ff35f",
                    "name": "Заняться спортом",
                    "description": "Провести тренировку с упражнениями на растяжку.",
                    "status": true
                },
                {
                    "id": "93f75a3d-e317-41ad-bc76-5f34d78d8f73",
                    "code": 403,
                    "userId": "18f3e371-9b90-4789-89fa-61434c8ff35f",
                    "name": "Сходить в аптеку",
                    "description": "Купить лекарства по рецепту врача.",
                    "status": false
                },
                {
                    "id": "d357ea51-f932-4f1c-84b9-03f8c573d587",
                    "code": 404,
                    "userId": "18f3e371-9b90-4789-89fa-61434c8ff35f",
                    "name": "Навести порядок в документах",
                    "description": "Отсортировать и убрать в папки.",
                    "status": true
                },
                {
                    "id": "7c57e8f1-63b9-429f-9cfa-3a57fc41b9f3",
                    "code": 405,
                    "userId": "18f3e371-9b90-4789-89fa-61434c8ff35f",
                    "name": "Записаться на курсы",
                    "description": "Уточнить расписание и подать заявку.",
                    "status": false
                },
                {
                    "id": "adf8391e-63e1-4b2b-83b1-d5c8375fa1b9",
                    "code": 501,
                    "userId": "37c67794-4142-45a7-b1e6-c91968326a0c",
                    "name": "Сходить на собрание",
                    "description": "Собрание в 15:00 по поводу нового проекта.",
                    "status": false
                },
                {
                    "id": "e2f87d4a-4b2e-40b5-84b9-f3e8a73d91f9",
                    "code": 502,
                    "userId": "37c67794-4142-45a7-b1e6-c91968326a0c",
                    "name": "Обновить резюме",
                    "description": "Добавить новый опыт работы и навыки.",
                    "status": true
                },
                {
                    "id": "3c47e5b8-d3b1-4c2f-b5c7-1e9f847d3a4c",
                    "code": 503,
                    "userId": "37c67794-4142-45a7-b1e6-c91968326a0c",
                    "name": "Пройти медосмотр",
                    "description": "Общий осмотр у терапевта в поликлинике.",
                    "status": false
                },
                {
                    "id": "76e48c3f-4c2f-49e3-94f9-7a5b3e8f839e",
                    "code": 504,
                    "userId": "37c67794-4142-45a7-b1e6-c91968326a0c",
                    "name": "Сделать перевод документов",
                    "description": "Подготовить переводы для подачи в консульство.",
                    "status": true
                },
                {
                    "id": "c93b7f5e-8b5c-4f93-83a7-d3e5b2e9f3f4",
                    "code": 505,
                    "userId": "37c67794-4142-45a7-b1e6-c91968326a0c",
                    "name": "Подготовить презентацию",
                    "description": "Слайды для встречи с клиентами.",
                    "status": false
                },
                {
                    "id": "5f3a8d4c-9f3e-49f8-b2e9-d3c7b5f3a7c4",
                    "code": 601,
                    "userId": "edfb1725-1253-43cc-97da-a39cce94e776",
                    "name": "Погулять с собакой",
                    "description": "Сходить в парк на прогулку.",
                    "status": true
                },
                {
                    "id": "4f9d3e5b-7c2f-4f3e-94d5-3a8b5f7c39d4",
                    "code": 602,
                    "userId": "edfb1725-1253-43cc-97da-a39cce94e776",
                    "name": "Посетить спортзал",
                    "description": "Сделать упражнения на выносливость.",
                    "status": false
                },
                {
                    "id": "3e94f8c2-7c4f-4b3e-92f5-d3a7b5c839f9",
                    "code": 603,
                    "userId": "edfb1725-1253-43cc-97da-a39cce94e776",
                    "name": "Сходить в магазин",
                    "description": "Купить продукты на неделю.",
                    "status": true
                },
                {
                    "id": "2f9d4b3e-8d5c-4f3a-b2e9-5c7a3f94d8f4",
                    "code": 604,
                    "userId": "edfb1725-1253-43cc-97da-a39cce94e776",
                    "name": "Позвонить родителям",
                    "description": "Узнать, как они поживают.",
                    "status": false
                },
                {
                    "id": "7c4f93e5-9b3a-8d5f-4b2e-7f3a9c5b4d3f",
                    "code": 605,
                    "userId": "edfb1725-1253-43cc-97da-a39cce94e776",
                    "name": "Посмотреть фильм",
                    "description": "Выбрать фильм для вечернего просмотра.",
                    "status": true
                },
                {
                    "id": "6f94e5c3-9b4d-7f3e-83c5-2a9d5b3f94d3",
                    "code": 701,
                    "userId": "a4e38640-76bf-4ab7-a8bd-50e7be2dcb86",
                    "name": "Составить бюджет",
                    "description": "Рассчитать расходы на месяц.",
                    "status": false
                },
                {
                    "id": "4d7c3f5e-9b3e-84f5-d8c7-2a9f3b4d7c5f",
                    "code": 702,
                    "userId": "a4e38640-76bf-4ab7-a8bd-50e7be2dcb86",
                    "name": "Навести порядок в саду",
                    "description": "Прополоть грядки и полить растения.",
                    "status": true
                },
                {
                    "id": "9d3a7c5b-4f93-8d7c-5a9e-3f94d7b8c4f5",
                    "code": 703,
                    "userId": "a4e38640-76bf-4ab7-a8bd-50e7be2dcb86",
                    "name": "Приготовить ужин",
                    "description": "Сделать плов и салат.",
                    "status": false
                },
                {
                    "id": "8b4f5d7c-9f3e-2a9d-3c7b-5e94f7d4c3f5",
                    "code": 704,
                    "userId": "a4e38640-76bf-4ab7-a8bd-50e7be2dcb86",
                    "name": "Посетить друга",
                    "description": "Зайти в гости к Айдару.",
                    "status": true
                },
                {
                    "id": "5c3f7a9d-4f8b-93e5-7c2f-8d5b4f9d3c7a",
                    "code": 705,
                    "userId": "a4e38640-76bf-4ab7-a8bd-50e7be2dcb86",
                    "name": "Проверить счет в банке",
                    "description": "Узнать остаток на карте.",
                    "status": false
                },
                {
                    "id": "92f8c5d7-4b9a-3f7e-5c94-d7b8c4f5a93e",
                    "code": 801,
                    "userId": "c2443267-4b12-433e-acef-e93c60506404",
                    "name": "Сделать зарядку",
                    "description": "Утренние упражнения для хорошего самочувствия.",
                    "status": true
                },
                {
                    "id": "8f3a9c5d-7b4f-5e93-d4c7-3f9a8d7c5b94",
                    "code": 802,
                    "userId": "c2443267-4b12-433e-acef-e93c60506404",
                    "name": "Оплатить коммунальные услуги",
                    "description": "Внести оплату за свет и воду.",
                    "status": false
                },
                {
                    "id": "7b4c9f5e-3d94-2a8d-5c7a-9f3b8d4e5c7f",
                    "code": 803,
                    "userId": "c2443267-4b12-433e-acef-e93c60506404",
                    "name": "Посетить стоматолога",
                    "description": "Проверка зубов у стоматолога.",
                    "status": true
                },
                {
                    "id": "5e7c9f3a-8d4c-3f5b-2a94-7b4f8d5c9a3e",
                    "code": 804,
                    "userId": "c2443267-4b12-433e-acef-e93c60506404",
                    "name": "Прочитать книгу",
                    "description": "Закончить чтение книги 'Маленький принц'.",
                    "status": false
                },
                {
                    "id": "3f5b8d7c-2a9e-7c94-d4b3-5c9a7f8d4c7f",
                    "code": 805,
                    "userId": "c2443267-4b12-433e-acef-e93c60506404",
                    "name": "Купить подарок",
                    "description": "Выбрать подарок для друга на день рождения.",
                    "status": true
                },
                {
                    "id": "9f3b7c5e-4d8b-2a94-5c7f-8d3a9f4e5b7c",
                    "code": 901,
                    "userId": "0ccf8ef3-cf5a-45fa-b8b2-5f76838ad7d7",
                    "name": "Сходить в аптеку",
                    "description": "Купить витамины и лекарства.",
                    "status": true
                },
                {
                    "id": "7b4e5c9f-3a8d-2a94-9f3b-4d7c5e8f9a3c",
                    "code": 902,
                    "userId": "0ccf8ef3-cf5a-45fa-b8b2-5f76838ad7d7",
                    "name": "Убраться дома",
                    "description": "Навести порядок в квартире.",
                    "status": false
                },
                {
                    "id": "5e9f3b7c-2a94-8d4c-3f5b-7b4c9f8d5e7f",
                    "code": 903,
                    "userId": "0ccf8ef3-cf5a-45fa-b8b2-5f76838ad7d7",
                    "name": "Сделать стрижку",
                    "description": "Записаться и сходить в парикмахерскую.",
                    "status": true
                },
                {
                    "id": "3f5c9a7b-4e8d-2a9f-7c5b-9f3b4d8e5c7f",
                    "code": 904,
                    "userId": "0ccf8ef3-cf5a-45fa-b8b2-5f76838ad7d7",
                    "name": "Написать отчет",
                    "description": "Подготовить отчет о проделанной работе.",
                    "status": false
                },
                {
                    "id": "7b8d5c3f-9a4e-2a7c-5f9b-4c7e8d3a5b9f",
                    "code": 905,
                    "userId": "0ccf8ef3-cf5a-45fa-b8b2-5f76838ad7d7",
                    "name": "Посмотреть обучающее видео",
                    "description": "Изучить новый курс по программированию.",
                    "status": true
                },
                {
                    "id": "9b3f7c5e-2a94-4d8b-8d5c-7e9f4c3b8a5d",
                    "code": 1001,
                    "userId": "be76c3fe-7208-4b3e-ad39-49e32636d38e",
                    "name": "Заказать еду на дом",
                    "description": "Выбрать ресторан и сделать заказ.",
                    "status": true
                },
                {
                    "id": "8d7c5e9f-4b3f-7c2a-5b94-9a3d8f7e4c5b",
                    "code": 1002,
                    "userId": "be76c3fe-7208-4b3e-ad39-49e32636d38e",
                    "name": "Позаниматься спортом",
                    "description": "Выполнить тренировку на свежем воздухе.",
                    "status": false
                },
                {
                    "id": "7e9f4b3c-5a9d-3f8b-2c7f-4b9a7c5d8e9f",
                    "code": 1003,
                    "userId": "be76c3fe-7208-4b3e-ad39-49e32636d38e",
                    "name": "Сходить в библиотеку",
                    "description": "Взять книги по саморазвитию.",
                    "status": true
                },
                {
                    "id": "3f9a7c5b-8d2a-4b9e-7e5c-5f4d3b9a8c7f",
                    "code": 1004,
                    "userId": "be76c3fe-7208-4b3e-ad39-49e32636d38e",
                    "name": "Приготовить завтрак",
                    "description": "Приготовить блины с медом и чаем.",
                    "status": false
                },
                {
                    "id": "5e7c9f3b-2a8d-4c3f-7b5d-8d9a4e3b7c5f",
                    "code": 1005,
                    "userId": "be76c3fe-7208-4b3e-ad39-49e32636d38e",
                    "name": "Навести порядок в документах",
                    "description": "Разобрать бумаги и папки на столе.",
                    "status": true
                }
            ]

            localStorage.setItem(
                this.localStorageKey,
                JSON.stringify(initialTodos)
            ); // Сохраняем начальные данные
        }
    }

    // Метод для загрузки данных из localStorage
    private loadTodosFromLocalStorage(): void {
        const storedTodos = localStorage.getItem(this.localStorageKey);
        const todos = storedTodos ? JSON.parse(storedTodos) : [];
        this.todosSubject.next(todos); // Обновляем BehaviorSubject
    }

    // Метод для сохранения данных в localStorage
    private saveTodosToLocalStorage(): void {
        const todos = this.todosSubject.getValue();
        localStorage.setItem(this.localStorageKey, JSON.stringify(todos));
    }

    // Получение всех задач
    getTodos(): Observable<any[]> {
        return this.todos$; // Возвращаем Observable
    }

    // Добавление новой задачи
    addTodo(todo: any): Observable<any> {
        todo.id = this.generateId(); // Генерация уникального ID
        const currentTodos = this.todosSubject.getValue();
        const updatedTodos = [...currentTodos, todo]; // Добавляем новую задачу
        this.todosSubject.next(updatedTodos); // Обновляем состояние
        this.saveTodosToLocalStorage(); // Сохраняем в localStorage
        return of(todo); // Возвращаем новую задачу
    }

    // Обновление существующей задачи
    updateTodo(id: string, updatedTodo: any): Observable<any> {
        const currentTodos = this.todosSubject.getValue();
        const index = currentTodos.findIndex((todo) => todo.id === id);
        if (index !== -1) {
            currentTodos[index] = { ...currentTodos[index], ...updatedTodo };
            this.todosSubject.next([...currentTodos]); // Обновляем состояние
            this.saveTodosToLocalStorage(); // Сохраняем изменения
            return of(currentTodos[index]); // Возвращаем обновлённую задачу
        } else {
            return throwError(() => new Error('Задача не найдена'));
        }
    }

    // Удаление задачи
    deleteTodo(todoId: string): Observable<boolean> {
        const currentTodos = this.todosSubject.getValue();
        const updatedTodos = currentTodos.filter((todo) => todo.id !== todoId);
        const wasDeleted = currentTodos.length > updatedTodos.length;
        this.todosSubject.next(updatedTodos); // Обновляем состояние
        this.saveTodosToLocalStorage(); // Сохраняем изменения
        return of(wasDeleted); // true, если задача была удалена
    }

    // Генерация уникального ID
    private generateId(): string {
        return (Math.random() * 100000).toFixed(0).toString();
    }
}
