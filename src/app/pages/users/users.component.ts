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
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {FileUploadModule} from "primeng/fileupload";
import * as XLSX from "xlsx";
import {v4 as uuidv4} from "uuid";

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
        TranslatePipe,
        FileUploadModule,
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

    genderOptions: any[] = [];
    roleOptions: any[] = [];

    selectedUser: any = null;

    constructor(
        private translate: TranslateService,
        private authService: AuthService,
        private auditTrailService: AuditTrailService,
        private messageService: MessageService,
        private sharedStateService: SharedStateService,
    ) {
        this.initializeTranslations(); // Каждый раз при смене языка заново подгружаем переводы

        this.translate.onLangChange.subscribe(() => {
            this.initializeTranslations(); // Каждый раз при смене языка заново подгружаем переводы
        });
    }

    initializeTranslations() {
        this.translate.get([
            // Для колонок
            'firstName', 'email', 'phoneNumber', 'role',
            // Для опций
            'male', 'female', 'other', 'admin', 'user'
        ]).subscribe(translations => {
            // Инициализация колонок
            this.cols = [
                { field: 'firstName', header: translations['firstName'] },
                { field: 'email', header: translations['email'] },
                { field: 'phoneNumber', header: translations['phoneNumber'] },
                { field: 'role', header: translations['role'] }
            ];

            // Инициализация опций
            this.genderOptions = [
                { label: translations['male'], value: 'male' },
                { label: translations['female'], value: 'female' },
                { label: translations['other'], value: 'other' },
            ];

            this.roleOptions = [
                { label: translations['admin'], value: 'admin' },
                { label: translations['user'], value: 'user' },
            ];
        });
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
                this.translate.get(['error', 'userDataLoadFailed']).subscribe(translations => {
                    this.messageService.add({
                        severity: 'error',
                        summary: translations['error'],
                        detail: translations['userDataLoadFailed'],
                        life: 3000
                    });
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
                    this.translate.get(['success', 'selectedUsersAndTasksDeleted']).subscribe(translations => {
                        this.messageService.add({
                            severity: 'success',
                            summary: translations['success'],
                            detail: translations['selectedUsersAndTasksDeleted'],
                            life: 3000
                        });
                    });


                    // Очищаем список выбранных пользователей
                    this.selectedUsers = [];
                    this.deleteUsersDialog = false;
                },
                error: (err) => {
                    console.error('Ошибка удаления пользователей и их задач:', err);

                    this.translate.get(['error', 'someUsersAndTasksNotDeleted']).subscribe(translations => {
                        this.messageService.add({
                            severity: 'error',
                            summary: translations['error'],
                            detail: translations['someUsersAndTasksNotDeleted'],
                            life: 3000
                        });
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

                    this.translate.get(['success', 'userAndTasksDeleted']).subscribe(translations => {
                        this.messageService.add({
                            severity: 'success',
                            summary: translations['success'],
                            detail: translations['userAndTasksDeleted'],
                            life: 3000
                        });
                    });
                },
                error: (err) => {
                    console.error('Ошибка удаления пользователя и его задач:', err);

                    this.translate.get(['error', 'userAndTasksNotDeleted']).subscribe(translations => {
                        this.messageService.add({
                            severity: 'error',
                            summary: translations['error'],
                            detail: translations['userAndTasksNotDeleted'],
                            life: 3000
                        });
                    });
                }
            });
        }
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
    importUsers(event: any, fileUpload: any): void {
        const file = event.files[0]; // Получаем первый файл из массива files

        if (!file) {
            this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Файл не выбран'});
            return;
        }

        const reader = new FileReader();

        reader.onload = (e: any) => {
            const binaryData = e.target.result;
            const workbook = XLSX.read(binaryData, {type: 'binary'});

            // Читаем данные с первого листа
            const sheetName = workbook.SheetNames[0];
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            console.log('Импортированные данные:', data);

            // Вызов метода для валидации и сохранения данных
            this.validateAndSaveUsers(data as User[]);
            fileUpload.clear();
        };

        reader.onerror = () => {
            this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Не удалось прочитать файл'});
        };

        reader.readAsBinaryString(file);
    }

    validateAndSaveUsers(users: Partial<User>[]): void {
        // Обогащаем пользователей автоматически генерируемыми данными
        const enrichedUsers = users.map((user) => ({
            ...user,
            id: uuidv4(), // Генерация уникального UUID
            code: Math.floor(1000 + Math.random() * 9000), // Случайный 4-значный код
            dateAdded: new Date().toISOString().split('T')[0], // Текущая дата в формате YYYY-MM-DD
            phoneNumber: user.phoneNumber ? user.phoneNumber.toString() : '',
        }));

        // Проверяем корректность данных
        const invalidUsers = enrichedUsers.filter(
            (user) =>
                !user.email || // Проверка на наличие email
                !this.isValidEmail(user.email) || // Проверка формата email
                !user.firstName || // Проверка на наличие имени
                !user.lastName    // Проверка на наличие фамилии
        );

        if (invalidUsers.length > 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Ошибка',
                detail: `Некорректные данные у ${invalidUsers.length} пользователей`,
            });
            console.warn('Некорректные пользователи:', invalidUsers);
            return;
        }

        // Получаем текущий список пользователей
        const existingUsers = this.sharedStateService['usersSubject'].getValue();

        // Обновляем общий список пользователей
        const updatedUsers = [...existingUsers, ...enrichedUsers];
        this.sharedStateService.setUsers(updatedUsers); // Вызов метода setUsers для обновления состояния

        // Уведомление об успешном импорте
        this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Пользователи импортированы'});

        // Добавляем запись в аудит
        this.auditTrailService.addAuditRecord({
            id: this.sharedStateService.generateId(), // Уникальный ID записи
            timestamp: new Date(), // Время действия
            action: 'Импорт', // Действие
            entity: 'Пользователи', // Сущность
            entityId: `Импортировано ${enrichedUsers.length} пользователей`, // Идентификатор (например, описание импорта)
            performedBy: localStorage.getItem('userEmail') || 'Неизвестный', // Пользователь, выполняющий импорт
            details: `${enrichedUsers.length} пользователей добавлено в систему.`, // Подробности действия
        }).subscribe(() => {
            console.log('Запись аудита успешно добавлена.');
        });
    }
    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

                    this.translate.get(['success', 'userUpdated']).subscribe(translations => {
                        this.messageService.add({
                            severity: 'success',
                            summary: translations['success'],
                            detail: translations['userUpdated'],
                            life: 3000
                        });
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

                    this.translate.get(['success', 'userCreated']).subscribe(translations => {
                        this.messageService.add({
                            severity: 'success',
                            summary: translations['success'],
                            detail: translations['userCreated'],
                            life: 3000
                        });
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
}