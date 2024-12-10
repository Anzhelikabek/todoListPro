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
import {AuditTrailService} from "../../services/audit-trail.service";
import {forkJoin} from "rxjs";

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

  userOptions: { label: string; value: string | undefined }[] = []; // Массив для выпадающего списка пользователей
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
      private auditTrailService: AuditTrailService,
      private messageService: MessageService,
      private authService: AuthService,
      private router: Router,
      private sharedStateService: SharedStateService,
  ) {}

  ngOnInit() {
    this.initUserPermissions();
    this.initDataStreams();
    this.setupColumns();
  }

  private initUserPermissions(): void {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      this.authService.isAdmin(userEmail).subscribe((isAdmin) => {
        this.isAdmin = isAdmin;
      });
    } else {
      console.error('Email не найден в localStorage!');
    }

    this.sharedStateService.users$.subscribe((users) => {
      this.userOptions = users.map((user) => ({
        label: `${user.firstName} ${user.lastName}`,
        value: user.id,
      }));
    });
  }

  private initDataStreams(): void {
    // Подписываемся на изменения списка пользователей
    this.sharedStateService.userOptions$.subscribe((options) => {
      this.userOptions = options;
    });

    // Подписываемся на изменения задач
    this.sharedStateService.todos$.subscribe(() => {
      this.loadTodosWithUsers();
    });

    // Загружаем задачи с данными пользователей при инициализации
    this.loadTodosWithUsers();
  }

  private setupColumns(): void {
    this.cols = [
      { field: 'name', header: 'Заголовок' },
      { field: 'description', header: 'Описание' },
      { field: 'userName', header: 'Имя' },
      { field: 'status', header: 'Статус' },
    ];
  }
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.userOptions = users.map((user) => ({
          label: `${user.firstName} ${user.lastName}`,
          value: user.id
        }));
        console.log('userOptions:', this.userOptions); // Логируем userOptions
      },
      error: (err) => {
        console.error('Ошибка загрузки пользователей:', err);
      }
    });
    console.log(this.userOptions)
  }

  private loadTodosWithUsers(): void {
    forkJoin({
      users: this.sharedStateService.getUsers(),
      todos: this.sharedStateService.getTodos(),
    }).subscribe(({users: users, todos }) => {
      this.todosWithUsers = todos.map((todo) => {
        const user = users.find((user) => user.id === todo.userId);
        return {
          ...todo,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Неизвестный пользователь',
        };
      });
    });
  }

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

    const currentUser = localStorage.getItem('userEmail') || 'Неизвестно';

    if (this.todo.id && this.todo.userId) {
      if (this.userOptions.length === 0) {
        this.loadUsers(); // Загружаем пользователей, если они ещё не загружены
      }

      const owner = this.userOptions.find((user) => user.value === this.todo.userId);

      this.todoService.deleteTodo(this.todo.id).subscribe({
        next: () => {
          this.todosWithUsers = this.todosWithUsers.filter((t) => t.id !== this.todo.id);

          this.auditTrailService.addAuditRecord({
            id: this.sharedStateService.generateId(),
            timestamp: new Date(),
            action: 'Удаление',
            entity: 'Задача',
            entityId: this.todo.id,
            performedBy: currentUser,
            details: `Удалена задача: ${this.todo.name}, принадлежащая пользователю: ${
                owner ? `${owner.label}` : 'Неизвестный пользователь'
            }`
          });

          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: 'Задача удалена',
            life: 3000
          });

          this.todo = {};
        },
        error: (err) => {
          console.error('Ошибка удаления задачи:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось удалить задачу',
            life: 3000
          });
        }
      });
    }
  }

  refreshTasksWithUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.userOptions = users.map(user => ({
          label: `${user.firstName} ${user.lastName}`,
          value: user.id
        }));

        this.todoService.getTodos().subscribe({
          next: (todos) => {
            this.todosWithUsers = todos.map(todo => {
              const user = users.find(u => u.id === todo.userId);
              return {
                ...todo,
                userName: user ? `${user.firstName} ${user.lastName}` : 'Неизвестный пользователь'
              };
            });
          },
          error: (err) => console.error('Ошибка загрузки задач:', err)
        });
      },
      error: (err) => console.error('Ошибка загрузки пользователей:', err)
    });
  }

  confirmDeleteSelected() {
    if (!this.selectedTodos || !this.selectedTodos.length) {
      return;
    }

    const currentUser = localStorage.getItem('userEmail') || 'Неизвестно';

    const deleteRequests = this.selectedTodos.map((selected) => {
      return this.todoService.deleteTodo(selected.id).toPromise();
    });

    Promise.all(deleteRequests)
        .then(() => {
          const selectedIds = this.selectedTodos.map((todo) => todo.id);
          this.todosWithUsers = this.todosWithUsers.filter(
              (todo) => !selectedIds.includes(todo.id)
          );

          // Добавляем записи в Audit Trail с указанием владельцев задач
          this.selectedTodos.forEach((todo) => {
            const owner = this.userOptions.find((user) => user.value === todo.userId);
            console.log(owner)
            this.auditTrailService.addAuditRecord({
              id: this.sharedStateService.generateId(),
              timestamp: new Date(),
              action: 'Множественное удаление',
              entity: 'Задача',
              entityId: todo.id,
              performedBy: currentUser,
              details: `Удалена задача: ${todo.name}, принадлежащая пользователю: ${
                  owner ? `${owner.label}` : 'Неизвестный пользователь'
              }`
            });
          });

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

  hideDialog() {
    this.todoDialog = false;
    this.submitted = false;
  }

  saveTodo(): void {
    this.submitted = true;

    if (this.todo.name?.trim()) {
      const isUpdate = !!this.todo.id; // Проверяем, обновляется или добавляется задача
      const currentUserEmail = localStorage.getItem('userEmail') || 'Неизвестно';

      // Находим владельца задачи из актуального `userOptions`
      const owner = this.userOptions.find((user) => user.value === this.todo.userId);
      const ownerName = owner ? `${owner.label}` : 'Неизвестный пользователь';

      const saveOperation = isUpdate
          ? this.sharedStateService.updateTodo(this.todo.id!, this.todo)
          : this.sharedStateService.addTodo(this.todo);

      saveOperation.subscribe({
        next: () => {
          this.auditTrailService.addAuditRecord({
            id: this.sharedStateService.generateId(),
            timestamp: new Date(),
            action: isUpdate ? 'Обновление' : 'Добавление',
            entity: 'Задача',
            entityId: this.todo.id || '',
            performedBy: currentUserEmail,
            details: isUpdate
                ? `Обновлена задача: ${this.todo.name}, принадлежит: ${ownerName}`
                : `Добавлена новая задача: ${this.todo.name}, принадлежит: ${ownerName}`,
          });

          this.messageService.add({
            severity: 'success',
            summary: 'Успешно',
            detail: isUpdate ? 'Задача обновлена' : 'Задача добавлена',
            life: 3000,
          });

          this.todoDialog = false;
          this.todo = {};
        },
        error: (err) => {
          console.error('Ошибка сохранения задачи:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Не удалось сохранить задачу',
            life: 3000,
          });
        },
      });
    }
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