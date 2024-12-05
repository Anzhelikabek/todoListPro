import { Component } from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {JsonPipe, NgClass, NgIf} from "@angular/common";
import {MessageService, PrimeTemplate} from "primeng/api";
import {Ripple} from "primeng/ripple";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {PaginatorModule} from "primeng/paginator";
import {SharedTableComponent} from "../../shared/shared-table/shared-table.component";
import {Todo} from "../../interfaces/todo";
import {User} from "firebase/auth";
import {UserService} from "../../services/user.service";
import {TodoService} from "../../services/todo.service";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {Table} from "primeng/table";
import {SharedStateService} from "../../services/shared-state.service";

@Component({
  selector: 'app-users-tasks',
  standalone: true,
  imports: [
    ButtonDirective,
    NgIf,
    PrimeTemplate,
    Ripple,
    ToastModule,
    ToolbarModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    InputTextareaModule,
    PaginatorModule,
    SharedTableComponent,
    NgClass,
    JsonPipe
  ],
  templateUrl: './users-tasks.component.html',
  styleUrl: './users-tasks.component.scss'
})
export class UsersTasksComponent {
  todoDialog: boolean = false;
  deleteTodoDialog: boolean = false;
  deleteTodosDialog: boolean = false;

  userOptions: { label: string; value: string }[] = []; // Массив для выпадающего списка пользователей
  todosWithUsers: any[] = []; // Задачи с данными пользователей
  todos: Todo[] = [];
  todo: Todo = {};
  selectedTodos: any[] = [];
  userEmail: string | null = '';

  submitted: boolean = false;
  cols: any[] = [];
  isAdmin: boolean = false;

  statusOptions = [
    { label: 'Выполнено', value: true },
    { label: 'Не выполнено', value: false }
  ];

  constructor(
      private userService: UserService,
      private todoService: TodoService,
      private messageService: MessageService,
      private authService: AuthService,
      private router: Router,
      private sharedStateService: SharedStateService,
  ) {}

  ngOnInit() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      this.authService.isAdmin(userEmail).subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
      });
    } else {
      console.error('Email не найден в localStorage!');
    }

    this.loadTodosWithUsers();
    this.removeTasksWithoutUsers()

    this.sharedStateService.todos$.subscribe((todos) => {
      // Автоматически обновляем список задач, если в SharedStateService произошли изменения
      this.loadTodosWithUsers();
    });
    this.cols = [
      { field: 'name', header: 'Заголовок' },
      { field: 'description', header: 'Описание' },
      { field: 'userName', header: 'Имя' },
      { field: 'status', header: 'Статус' }
    ];
  }

  loadTodosWithUsers(): void {
    this.sharedStateService.getUsers().subscribe((users) => {
      this.sharedStateService.getTodos().subscribe((todos) => {
        this.todosWithUsers = todos.map((todo) => {
          const user = users.find((user) => user.id === todo.userId);
          return {
            ...todo,
            userName: user ? `${user.firstName} ${user.lastName}` : 'Неизвестный пользователь'
          };
        });

        console.log('Обновленные задачи с пользователями:', this.todosWithUsers);
      });
    });}

  openNew() {
    this.todo = {};
    this.submitted = false;
    this.todoDialog = true;
  }

  deleteSelectedTodos() {
    if (!this.selectedTodos || !this.selectedTodos.length) {
      return;
    }
    this.deleteTodosDialog = true;
  }

  confirmDeleteSelected() {
    if (!this.selectedTodos || !this.selectedTodos.length) {
      return;
    }

    const deleteRequests = this.selectedTodos.map((selected) => {
      return this.todoService.deleteTodo(selected.id).toPromise();
    });

    Promise.all(deleteRequests)
        .then(() => {
          // Удаляем только те задачи, которые успешно удалены
          this.todosWithUsers = this.todosWithUsers.filter(
              (todo) => !this.selectedTodos.some((selected) => selected.id === todo.id)
          );

          this.selectedTodos = [];
          this.deleteTodosDialog = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Выбранные задачи удалены',
            life: 3000
          });
        })
        .catch((err) => {
          console.error('Ошибка удаления задач:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить некоторые задачи',
            life: 3000
          });
        });
  }

  editTodo(todo: Todo) {
    this.todo = { ...todo };
    this.todoDialog = true;
  }

  deleteTodo(todo: Todo) {
    this.deleteTodoDialog = true;
    this.todo = { ...todo };
  }

  confirmDelete() {
    this.deleteTodoDialog = false;
    this.todoService.deleteTodo(this.todo.id!).subscribe({
      next: () => {
        this.todosWithUsers = this.todosWithUsers.filter((t) => t.id !== this.todo.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Задача удалена',
          life: 3000
        });
      },
      error: (err) => console.error('Ошибка удаления задачи:', err)
    });
    this.todo = {};
  }

  hideDialog() {
    this.todoDialog = false;
    this.submitted = false;
  }

  saveTodo() {
    this.submitted = true;

    // Проверяем, что все обязательные поля заполнены
    if (
        !this.todo.name?.trim() ||
        !this.todo.description?.trim() ||
        !this.todo.userId ||
        this.todo.status === undefined
    ) {
      console.warn('Все поля обязательны для заполнения!');
      return;
    }

    if (this.todo.id) {
      // Обновление существующей задачи
      this.todoService.updateTodo(this.todo.id, this.todo).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Задача обновлена',
            life: 3000,
          });
          this.loadTodosWithUsers(); // Перезагружаем список задач
        },
        error: (err) => console.error('Ошибка обновления задачи:', err),
      });
    } else {
      // Добавление новой задачи
      this.todoService.addTodo(this.todo).subscribe({
        next: (newTodo) => {
          // Находим имя пользователя по userId
          const user = this.userOptions.find((user) => user.value === newTodo.userId);
          const userName = user ? user.label : 'Неизвестный пользователь';

          // Добавляем новую задачу в локальный массив с именем пользователя
          this.todosWithUsers.push({
            ...newTodo,
            userName: userName,
          });
          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Задача добавлена',
            life: 3000,
          });
        },
        error: (err) => console.error('Ошибка создания задачи:', err),
      });
    }

    this.todoDialog = false;
    this.todo = {};
  }
  removeTasksWithoutUsers(): void {
    this.todosWithUsers = this.todosWithUsers.filter((todo) => {
      return todo.userName !== 'Неизвестный пользователь';
    });

    // Обновляем данные в `TodoService` или `SharedStateService`
    const updatedTodos = this.todosWithUsers.map((todo) => {
      const { userName, ...rest } = todo; // Убираем userName
      return rest;
    });

    this.sharedStateService.setTodos(updatedTodos);

    this.messageService.add({
      severity: 'success',
      summary: 'Успешно',
      detail: 'Удалены задачи с неизвестными пользователями.',
      life: 3000
    });
  }

}