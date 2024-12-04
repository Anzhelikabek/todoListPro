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
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {Table} from "primeng/table";
import {UserService} from "../../services/user.service";
import {User} from "firebase/auth";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";
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
    userTodos: User[] = [];
    todo: Todo = {};
    selectedTodos: any[] = [];
    userEmail: string | null = '';
    displayModal: boolean = false;
    submitted: boolean = false;
    cols: any[] = [];
    isAdmin: boolean = true;

    statusOptions = [
        {label: 'Выполнено', value: true},
        {label: 'Не выполнено', value: false}
    ];

    constructor(
        private userService: UserService,
        private todoService: TodoService,
        private messageService: MessageService,
        private authService: AuthService,
        private router: Router
    ) {
    }

    ngOnInit() {
        const userEmail = localStorage.getItem('userEmail');
        this.loadCurrentUser(userEmail);

        this.cols = [
            {field: 'name', header: 'Заголовок'},
            {field: 'description', header: 'Описание'},
            {field: 'status', header: 'Статус'}
        ];
    }

    loadCurrentUser(email: any): void {
        this.userService.getUsers().subscribe((users) => {
            this.currentUser = users.find((user) => user.email === email);

            if (this.currentUser) {
                console.log('Текущий пользователь:', this.currentUser);
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
        if (!this.selectedTodos || !this.selectedTodos.length) {
            return;
        }
        this.deleteTodosDialog = true;
    }

    confirmDeleteSelected() {
        if (!this.selectedTodos || !this.selectedTodos.length) {
            return;
        }

        const deleteRequests = this.selectedTodos.map((selected) =>
            this.todoService.deleteTodo(selected.id)
        );

        forkJoin(deleteRequests).subscribe({
            next: (results) => {
                // Удаляем только успешно удалённые задачи
                const successfullyDeleted = this.selectedTodos.filter((_, index) => results[index]);

                this.todos = this.todos.filter(
                    (todo) => !successfullyDeleted.some((selected) => selected.id === todo.id)
                );

                this.todos = [...this.todos]; // Принудительно обновляем массив
                console.log(this.todos)
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
        this.todo = {...todo};
        this.todoDialog = true;
    }

    deleteTodo(todo: Todo) {
        this.deleteTodoDialog = true;
        this.todo = {...todo};
    }

    confirmDelete() {
        this.deleteTodoDialog = false;
        this.todoService.deleteTodo(this.todo.id!).subscribe({
            next: () => {
                this.todos = this.todos.filter((t) => t.id !== this.todo.id);
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

        if (this.todo.name?.trim()) {
            if (this.todo.id) {
                this.todoService.updateTodo(this.todo.id, this.todo).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Успешно',
                            detail: 'Задача обновлена',
                            life: 3000
                        });
                        this.loadUserTodos();
                    },
                    error: (err) => console.error('Ошибка обновления задачи:', err)
                });
            } else {
                this.todoService.addTodo(this.todo).subscribe({
                    next: (newTodo) => {
                        this.todos.push(newTodo);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Успешно',
                            detail: 'Задача создана',
                            life: 3000
                        });
                    },
                    error: (err) => console.error('Ошибка создания задачи:', err)
                });
            }

            this.todoDialog = false;
            this.todo = {};
        }
    }

}
