import {Component} from '@angular/core';
import {ButtonDirective} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {InputTextareaModule} from "primeng/inputtextarea";
import {NgClass, NgIf} from "@angular/common";
import {MessageService} from "primeng/api";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Ripple} from "primeng/ripple";
import {SharedTableComponent} from "../../shared/shared-table/shared-table.component";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {Todo} from "../../interfaces/todo";
import {Router} from "@angular/router";
import {forkJoin} from "rxjs";
import {AuditTrailService} from "../../services/audit-trail.service";
import {SharedStateService} from "../../services/shared-state.service";

@Component({
    selector: 'app-todos',
    standalone: true,
    imports: [
        ButtonDirective,
        DialogModule,
        DropdownModule,
        InputTextModule,
        InputTextareaModule,
        NgIf,
        ReactiveFormsModule,
        Ripple,
        SharedTableComponent,
        ToastModule,
        ToolbarModule,
        FormsModule,
        NgClass
    ],
    templateUrl: './todos.component.html',
    styleUrls: ['./todos.component.scss']
})
export class TodosComponent {
    todoDialog: boolean = false;
    deleteTodoDialog: boolean = false;
    deleteTodosDialog: boolean = false;
    currentUser: any = null;
    todos: Todo[] = [];
    userTodos: Todo[] = [];
    todo: Todo = {};
    selectedTodos: Todo[] = [];
    userEmail: string | null = '';
    submitted: boolean = false;
    cols: any[] = [];
    isAdmin: boolean = true;

    statusOptions = [
        { label: 'Выполнено', value: true },
        { label: 'Не выполнено', value: false }
    ];

    constructor(
        private auditTrailService: AuditTrailService,
        private sharedStateService: SharedStateService,
        private messageService: MessageService,
        private router: Router,
    ) {}

    ngOnInit() {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            this.loadCurrentUser(userEmail);
        }

        this.cols = [
            { field: 'name', header: 'Заголовок' },
            { field: 'description', header: 'Описание' },
            { field: 'status', header: 'Статус' }
        ];
    }

    loadCurrentUser(email: string): void {
        this.sharedStateService.getUsers().subscribe((users) => {
            this.currentUser = users.find((user) => user.email === email);

            if (this.currentUser) {
                this.loadUserTodos();
            } else {
                console.error('Пользователь не найден!');
            }
        });
    }

    loadUserTodos(): void {
        this.sharedStateService.getTodos().subscribe((todos) => {
            this.todos = todos;
            this.userTodos = todos.filter((todo) => todo.userId === this.currentUser.id);
        });
    }

    openNew() {
        this.todo = {};
        this.submitted = false;
        this.todoDialog = true;
    }

    deleteSelectedTodos() {
        if (!this.selectedTodos.length) {
            return;
        }

        this.deleteTodosDialog = true;
    }
    editTodo(todo: Todo) {
        this.todo = { ...todo };
        this.todoDialog = true;
    }

    deleteTodo(todo: Todo) {
        this.todo = { ...todo };
        this.deleteTodoDialog = true;
    }

    confirmDeleteSelected(): void {
        const deleteRequests = this.selectedTodos.map((todo) =>
            this.sharedStateService.deleteTodo(todo.id!)
        );

        forkJoin(deleteRequests).subscribe({
            next: () => {
                const currentUser = localStorage.getItem('userEmail') || 'Неизвестно';

                this.sharedStateService.getUsers().subscribe((users) => {
                    // Аудит-трейл для каждого удалённого задания
                    this.selectedTodos.forEach((todo) => {
                        const owner = users.find((user) => user.id === todo.userId);

                        this.auditTrailService.addAuditRecord({
                            id: this.sharedStateService.generateId(),
                            timestamp: new Date(),
                            action: 'Удаление',
                            entity: 'Задача',
                            entityId: todo.id,
                            performedBy: currentUser,
                            details: `Удалена задача: ${todo.name || 'Без названия'}, принадлежавшая пользователю: ${
                                owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестный пользователь'
                            }`
                        });
                    });

                    this.selectedTodos.forEach((todo) => {
                        this.userTodos = this.userTodos.filter((t) => t.id !== todo.id);
                    });

                    this.selectedTodos = [];
                    this.deleteTodosDialog = false;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Выбранные задачи удалены',
                        life: 3000
                    });
                });
            },
            error: (err) => {
                console.error('Ошибка удаления задач:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка',
                    detail: 'Не удалось удалить выбранные задачи',
                    life: 3000
                });
            }
        });
    }


    confirmDelete(): void {
        const currentUser = localStorage.getItem('userEmail') || 'Неизвестно';

        this.sharedStateService.deleteTodo(this.todo.id!).subscribe({
            next: () => {
                this.sharedStateService.getUsers().subscribe((users) => {
                    const owner = users.find((user) => user.id === this.todo.userId);

                    // Аудит-трейл для удалённого задания
                    this.auditTrailService.addAuditRecord({
                        id: this.sharedStateService.generateId(),
                        timestamp: new Date(),
                        action: 'Удаление',
                        entity: 'Задача',
                        entityId: this.todo.id,
                        performedBy: currentUser,
                        details: `Удалена задача: ${this.todo.name || 'Без названия'}, принадлежавшая пользователю: ${
                            owner ? `${owner.firstName} ${owner.lastName}` : 'Неизвестный пользователь'
                        }`
                    });

                    this.userTodos = this.userTodos.filter((t) => t.id !== this.todo.id);
                    this.todos = this.todos.filter((t) => t.id !== this.todo.id);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Задача удалена',
                        life: 3000
                    });

                    this.deleteTodoDialog = false;
                    this.todo = {};
                });
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


    hideDialog() {
        this.todoDialog = false;
        this.submitted = false;
    }

    saveTodo(): void {
        this.submitted = true;

        if (this.todo.name?.trim()) {
            const currentUserEmail = localStorage.getItem('userEmail') || 'Неизвестно';
            console.log('Текущий пользователь (email):', currentUserEmail);

            this.sharedStateService.getUsers().subscribe(users => {
                console.log('Пользователи:', users);

                const currentUser = users.find(user => user.email === currentUserEmail);
                if (!currentUser) {
                    console.error('Не удалось определить текущего пользователя');
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: 'Не удалось определить текущего пользователя',
                        life: 3000
                    });
                    return;
                }

                // Устанавливаем userId для новой задачи
                if (!this.todo.id) {
                    this.todo.userId = currentUser.id;
                }

                const isUpdate = !!this.todo.id;
                const saveOperation = isUpdate
                    ? this.sharedStateService.updateTodo(this.todo.id!, this.todo)
                    : this.sharedStateService.addTodo(this.todo);

                saveOperation.subscribe({
                    next: (savedTodo) => {
                        this.auditTrailService.addAuditRecord({
                            id: this.sharedStateService.generateId(),
                            timestamp: new Date(),
                            action: isUpdate ? 'Обновление' : 'Добавление',
                            entity: 'Задача',
                            entityId: savedTodo.id,
                            performedBy: currentUserEmail,
                            details: isUpdate
                                ? `Обновлена задача: ${this.todo.name} для пользователя: ${currentUser.firstName} ${currentUser.lastName}`
                                : `Добавлена новая задача: ${this.todo.name} для пользователя: ${currentUser.firstName} ${currentUser.lastName}`
                        });

                        this.loadUserTodos();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Успешно',
                            detail: isUpdate ? 'Задача обновлена' : 'Задача создана',
                            life: 3000
                        });
                    },
                    error: (err) => {
                        console.error('Ошибка сохранения задачи:', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Ошибка',
                            detail: 'Не удалось сохранить задачу',
                            life: 3000
                        });
                    },
                    complete: () => {
                        this.todoDialog = false;
                        this.todo = {};
                    }
                });
            });
        }
    }



}
