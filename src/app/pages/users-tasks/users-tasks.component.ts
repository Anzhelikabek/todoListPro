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
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {SharedStateService} from "../../services/shared-state.service";
import {AuditTrailService} from "../../services/audit-trail.service";
import {forkJoin} from "rxjs";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

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
        JsonPipe,
        TranslatePipe
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
  statusOptions: any[] = [];
  isAdmin: boolean = false;

  constructor(
      private translate: TranslateService,
      private auditTrailService: AuditTrailService,
      private messageService: MessageService,
      private authService: AuthService,
      private router: Router,
      private sharedStateService: SharedStateService,
  ) {
    this.initializeColumns();

    this.translate.onLangChange.subscribe(() => {
      this.initializeColumns();
    });
  }

  initializeColumns() {
    this.translate.get(['title', 'description', 'firstName', 'status', 'completed', 'notCompleted'])
        .subscribe(translations => {
          this.cols = [
            { field: 'name', header: translations['title'] },
            { field: 'description', header: translations['description'] },
            { field: 'userName', header: translations['firstName'] },
            { field: 'status', header: translations['status'] }
          ];

          this.statusOptions = [
            { label: translations['completed'], value: true },
            { label: translations['notCompleted'], value: false }
          ];
        });
  }

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
    this.initializeColumns()
  }
  loadUsers(): void {
    this.sharedStateService.getUsers().subscribe({
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

      this.sharedStateService.deleteTodo(this.todo.id).subscribe({
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

          this.translate.get(['success', 'taskDeleted']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['success'],
              detail: translations['taskDeleted'],
              life: 3000
            });
          });


          this.todo = {};
        },
        error: (err) => {
          console.error('Ошибка удаления задачи:', err);
          this.translate.get(['error', 'taskDeleteFailed']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['error'],
              detail: translations['taskDeleteFailed'],
              life: 3000
            });
          });

        }
      });
    }
  }

  confirmDeleteSelected() {
    if (!this.selectedTodos || !this.selectedTodos.length) {
      return;
    }

    const currentUser = localStorage.getItem('userEmail') || 'Неизвестно';

    const deleteRequests = this.selectedTodos.map((selected) => {
      return this.sharedStateService.deleteTodo(selected.id).toPromise();
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

          this.translate.get(['success', 'selectedTasksDeleted']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['success'],
              detail: translations['selectedTasksDeleted'],
              life: 3000
            });
          });

        })
        .catch((err) => {
          console.error('Ошибка удаления задач:', err);
          this.translate.get(['error', 'someTasksNotDeleted']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['error'],
              detail: translations['someTasksNotDeleted'],
              life: 3000
            });
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

          this.translate.get(['success', 'taskUpdated', 'taskAdded']).subscribe(translations => {
            this.messageService.add({
              severity: 'success',
              summary: translations['success'],
              detail: isUpdate ? translations['taskUpdated'] : translations['taskAdded'],
              life: 3000,
            });
          });

          // Обновляем список задач в todosSubject
          const currentTodos = this.sharedStateService['todosSubject'].getValue();
          const updatedTodos = isUpdate
              ? currentTodos.map((todo) =>
                  todo.id === this.todo.id ? { ...todo, ...this.todo } : todo
              )
              : [...currentTodos, this.todo]; // Добавляем новую задачу, если она не обновляется

          this.sharedStateService.setTodos(updatedTodos);

          this.todoDialog = false;
          this.todo = {}; // Очистка формы задачи
        },
        error: (err) => {
          console.error('Ошибка сохранения задачи:', err);
          this.translate.get(['error', 'taskSaveFailed']).subscribe(translations => {
            this.messageService.add({
              severity: 'error',
              summary: translations['error'],
              detail: translations['taskSaveFailed'],
              life: 3000,
            });
          });
        },
      });
    }
  }

}