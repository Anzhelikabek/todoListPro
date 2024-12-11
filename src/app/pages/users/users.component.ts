import {Component} from '@angular/core';
import {SharedTableComponent} from '../../shared/shared-table/shared-table.component';
import {ButtonDirective} from 'primeng/button';
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {Ripple} from "primeng/ripple";
import {TableModule} from "primeng/table";
import {DialogModule} from "primeng/dialog";
import {FormsModule} from "@angular/forms";
import {InputTextModule} from "primeng/inputtext";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {DropdownModule} from "primeng/dropdown";
import {InputTextareaModule} from "primeng/inputtextarea";
import {MessageService} from "primeng/api";
import {AuthService} from "../../services/auth.service";
import {User} from "../../interfaces/user";
import {CalendarModule} from "primeng/calendar";
import {PhoneNumberFormatPipe} from "../../pipes/phone-number-format.pipe";
import {SharedStateService} from "../../services/shared-state.service";
import {forkJoin, tap} from "rxjs";
import {AuditTrailService} from "../../services/audit-trail.service";

@Component({
    selector: 'app-users',
    standalone: true,
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    imports: [
        SharedTableComponent,
        ButtonDirective,
        ToastModule,
        ButtonDirective,
        ToolbarModule,
        Ripple,
        TableModule,
        DialogModule,
        FormsModule,
        InputTextModule,
        NgClass,
        DropdownModule,
        NgIf,
        InputTextareaModule,
        SharedTableComponent,
        CalendarModule,
        PhoneNumberFormatPipe,
        DatePipe,
    ]
})
export class UsersComponent {
    isAdmin: boolean = false;
    cols: any[] = [];
    users: User[] = [];
    userDialog: boolean = false;
    deleteUserDialog: boolean = false;
    deleteUsersDialog: boolean = false;
    submitted: boolean = false;

    user: User = {};
    selectedUsers: any[] = [];
    userEmail: string | null = '';
    displayModal: boolean = false;

    genderOptions = [
        {label: 'Мужчина', value: 'male'},
        {label: 'Женщина', value: 'female'},
        {label: 'Другой', value: 'other'},
    ];

    roleOptions = [
        {label: 'Админ', value: 'admin'},
        {label: 'Пользователь', value: 'user'},
    ];


    selectedUser: any = null;

    constructor(
        private authService: AuthService,
        private auditTrailService: AuditTrailService,
        private messageService: MessageService,
        private sharedStateService: SharedStateService,
    ) {
    }

    ngOnInit() {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            this.authService.isAdmin(userEmail).subscribe((isAdmin) => {
                this.isAdmin = isAdmin;
            });
        } else {
            console.error('Email не найден в localStorage!');
        }

        this.loadUsers();

        this.cols = [
            {field: 'firstName', header: 'Имя'},
            {field: 'email', header: 'Email'},
            {field: 'phoneNumber', header: 'Номер телефона'},
            {field: 'role', header: 'Роль'}
        ];

        this.sharedStateService.users$.subscribe((users) => {
            this.users = users; // Обновляем список пользователей
        });
    }

    loadUsers(): void {
        this.sharedStateService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Ошибка',
                    detail: 'Не удалось загрузить данные пользователя',
                    life: 3000
                });
            }
        });
    }

    openNew() {
        this.user = {};
        this.submitted = false;
        this.userDialog = true;
    }

    deleteSelectedUsers() {
        if (!this.selectedUsers || !this.selectedUsers.length) {
            return;
        }
        this.deleteUsersDialog = true;
    }

    editUser(user: User) {
        this.user = {...user};
        this.userDialog = true;
    }

    deleteUser(user: User) {
        this.deleteUserDialog = true;
        this.user = {...user};
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted = false;
    }

    confirmDeleteSelected(): void {
        if (!this.selectedUsers || !this.selectedUsers.length) {
            return;
        }

        const deleteRequests = this.selectedUsers
            .filter((selected) => selected.id) // Убедимся, что есть ID
            .map((selected) => this.sharedStateService.deleteUserWithTodos(selected.id)); // Удаляем пользователя и его задачи

        if (deleteRequests.length > 0) {
            forkJoin(deleteRequests).subscribe({
                next: () => {
                    const currentUser = localStorage.getItem('userEmail') || 'Неизвестно';

                    // Аудит-трейл для каждого удалённого пользователя
                    this.selectedUsers.forEach((user) => {
                        if (user.id) {
                            this.auditTrailService.addAuditRecord({
                                id: this.sharedStateService.generateId(),
                                timestamp: new Date(),
                                action: 'Удаление',
                                entity: 'Пользователь',
                                entityId: user.id,
                                performedBy: currentUser,
                                details: `Удален пользователь: ${user.firstName || 'undefined'} ${user.lastName || 'undefined'}`
                            });
                        }
                    });

                    // Обновляем состояние в SharedStateService
                    const selectedIds = this.selectedUsers.map((user) => user.id);
                    const remainingUsers = this.sharedStateService['usersSubject']
                        .getValue()
                        .filter((user) => !selectedIds.includes(user.id));
                    this.sharedStateService.setUsers(remainingUsers);

                    // Уведомление об успешном удалении
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Выбранные пользователи и их задачи удалены',
                        life: 3000
                    });

                    // Очищаем список выбранных пользователей
                    this.selectedUsers = [];
                    this.deleteUsersDialog = false;
                },
                error: (err) => {
                    console.error('Ошибка удаления пользователей и их задач:', err);

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: 'Не удалось удалить некоторых пользователей и их задачи',
                        life: 3000
                    });
                }
            });
        }
    }


    viewUserDetails(user: any): void {
        this.selectedUser = user; // Сохранить данные пользователя
        this.displayModal = true; // Показать модальное окно
    }

    confirmDelete(user: User): void {
        this.deleteUserDialog = false;

        if (user.id) {
            this.sharedStateService.deleteUserWithTodos(user.id).subscribe({
                next: () => {
                    // Обновляем список пользователей
                    this.users = this.users.filter(u => u.id !== user.id);

                    // Добавляем запись в историю изменений
                    const currentUser = localStorage.getItem('userEmail');
                    this.auditTrailService.addAuditRecord({
                        id: this.sharedStateService.generateId(),
                        timestamp: new Date(),
                        action: 'Удаление',
                        entity: 'Пользователь',
                        entityId: user.id,
                        performedBy: currentUser || 'Неизвестно',
                        details: `Удален пользователь: ${user.firstName || 'undefined'} ${user.lastName || 'undefined'}`
                    });

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Пользователь и его задачи удалены',
                        life: 3000
                    });
                },
                error: (err) => {
                    console.error('Ошибка удаления пользователя и его задач:', err);

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Ошибка',
                        detail: 'Не удалось удалить пользователя и его задачи',
                        life: 3000
                    });
                }
            });
        }
    }


    private generateId(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    getRoleDisplayName(role: string): string {
        switch (role) {
            case 'admin':
                return 'Админ';
            case 'user':
                return 'Пользователь';
            default:
                return role;
        }
    }

    formatPhoneNumber(value: string): void {
        if (!this.user) {
            this.user = {}; // Если объект ещё не создан, инициализируем его
        }

        // Удаляем всё, кроме цифр
        let phone = value.replace(/\D/g, '');

        // Ограничиваем ввод до 9 цифр
        if (phone.length > 9) {
            phone = phone.substring(0, 9);
        }

        // Автоматически добавляем пробелы
        if (phone.length >= 3 && phone.length <= 5) {
            phone = `${phone.substring(0, 3)} ${phone.substring(3)}`;
        } else if (phone.length > 5) {
            phone = `${phone.substring(0, 3)} ${phone.substring(3, 5)} ${phone.substring(5)}`;
        }

        // Обновляем значение в объекте user
        this.user.phoneNumber = phone;
    }

    saveUser() {
        this.submitted = true;

        if (!this.user?.firstName?.trim()) {
            console.warn('Имя пользователя обязательно!');
            return;
        }

        if (!this.user?.phoneNumber || !this.isValidPhoneNumber(this.user.phoneNumber)) {
            console.warn('Некорректный номер телефона!');
            return;
        }

        // Удаляем пробелы при сохранении номера в базу
        this.user.phoneNumber = this.user.phoneNumber.replace(/\D/g, '');

        const currentUserEmail = localStorage.getItem('userEmail') || 'Неизвестно';

        if (this.user.id) {
            // Обновление пользователя
            this.sharedStateService.updateUser(this.user.id, this.user).subscribe({
                next: () => {
                    this.auditTrailService.addAuditRecord({
                        id: this.sharedStateService.generateId(),
                        timestamp: new Date(),
                        action: 'Обновление',
                        entity: 'Пользователь',
                        entityId: this.user.id,
                        performedBy: currentUserEmail,
                        details: `Обновлен пользователь: ${this.user.firstName} ${this.user.lastName}`
                    });

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Пользователь обновлен',
                        life: 3000
                    });

                    // Обновляем список пользователей через `usersSubject`
                    const currentUsers = this.sharedStateService['usersSubject'].getValue();
                    const updatedUsers = currentUsers.map((u) =>
                        u.id === this.user.id ? { ...u, ...this.user } : u
                    );
                    this.sharedStateService.setUsers(updatedUsers);
                },
                error: (err) => console.error('Ошибка обновления пользователя:', err)
            });
        } else {
            // Добавление нового пользователя
            this.sharedStateService.addUser(this.user).subscribe({
                next: (newUser) => {
                    this.auditTrailService.addAuditRecord({
                        id: this.sharedStateService.generateId(),
                        timestamp: new Date(),
                        action: 'Добавление',
                        entity: 'Пользователь',
                        entityId: newUser.id,
                        performedBy: currentUserEmail,
                        details: `Добавлен новый пользователь: ${newUser.firstName} ${newUser.lastName}`
                    });

                    // Обновляем список пользователей через `usersSubject`
                    const currentUsers = this.sharedStateService['usersSubject'].getValue();
                    this.sharedStateService.setUsers([...currentUsers, newUser]);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Успешно',
                        detail: 'Пользователь создан',
                        life: 3000
                    });
                },
                error: (err) => console.error('Ошибка создания пользователя:', err)
            });
        }

        this.userDialog = false;
        this.user = {};
    }


    isValidPhoneNumber(phoneNumber: string): boolean {
        const digits = phoneNumber.replace(/\D/g, ''); // Удаляем все символы, кроме цифр
        return digits.length === 9 && digits[0] !== '0'; // Проверяем длину и первую цифру
    }

    refreshTable() {
        this.users = [...this.users]; // Создаём новый массив, чтобы Angular обнаружил изменения
    }

}