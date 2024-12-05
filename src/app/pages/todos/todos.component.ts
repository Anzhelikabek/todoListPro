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
import {TodoService} from "../../services/todo.service";
import {Router} from "@angular/router";
import {UserService} from "../../services/user.service";
import {forkJoin} from "rxjs";

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
        private userService: UserService,
        private todoService: TodoService,
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
        this.userService.getUsers().subscribe((users) => {
            this.currentUser = users.find((user) => user.email === email);

            if (this.currentUser) {
                this.loadUserTodos();
            } else {
                console.error('Пользователь не найден!');
            }
        });
    }

    loadUserTodos(): void {
        this.todoService.getTodos().subscribe((todos) => {
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

    confirmDeleteSelected() {
        const deleteRequests = this.selectedTodos.map((todo) => this.todoService.deleteTodo(todo.id!));

        forkJoin(deleteRequests).subscribe({
            next: () => {
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

    editTodo(todo: Todo) {
        this.todo = { ...todo };
        this.todoDialog = true;
    }

    deleteTodo(todo: Todo) {
        this.todo = { ...todo };
        this.deleteTodoDialog = true;
    }

    confirmDelete() {
        this.todoService.deleteTodo(this.todo.id!).subscribe({
            next: () => {
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

    saveTodo() {
        this.submitted = true;

        if (this.todo.name?.trim()) {
            const saveOperation = this.todo.id
                ? this.todoService.updateTodo(this.todo.id, this.todo)
                : this.todoService.addTodo(this.todo);

            saveOperation.subscribe({
                next: () => {
                    this.loadUserTodos(); // Перезагружаем задачи
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: this.todo.id ? 'Задача обновлена' : 'Задача создана',
                        life: 3000
                    });
                },
                error: (err) => console.error('Ошибка сохранения задачи:', err),
                complete: () => {
                    this.todoDialog = false;
                    this.todo = {};
                }
            });
        }
    }

}
