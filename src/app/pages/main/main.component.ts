import {Component, OnInit} from '@angular/core';
import {ToastModule} from 'primeng/toast';
import {Button, ButtonDirective, ButtonModule} from 'primeng/button';
import {MessageService} from 'primeng/api';
import {TableModule} from 'primeng/table';
import {ToolbarModule} from 'primeng/toolbar';
import {Ripple} from 'primeng/ripple';
import {DialogModule} from 'primeng/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {NgClass, NgIf, NgStyle} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {SharedTableComponent} from '../../shared/shared-table/shared-table.component';
import {TabViewModule} from "primeng/tabview";
import {UsersComponent} from "../users/users.component";
import {TodosComponent} from "../todos/todos.component";
import {UsersTasksComponent} from "../users-tasks/users-tasks.component";
import {SidebarModule} from "primeng/sidebar";
import {AuditTrailComponent} from "../../components/audit-trail/audit-trail.component";
import {CalendarComponent} from "../../components/calendar/calendar.component";
import {DashboardComponent} from "../../components/dashboard/dashboard.component";
import * as XLSX from 'xlsx';
import {SharedStateService} from "../../services/shared-state.service";
import {FileUploadModule} from "primeng/fileupload";
import {AuditTrailService} from "../../services/audit-trail.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {ChatComponent} from "../../components/chat/chat.component";
import {CalendarModule} from "primeng/calendar";
import {Language} from "../../interfaces/language";
import {TooltipModule} from "primeng/tooltip";

@Component({
    selector: 'app-main',
    standalone: true,
    imports: [
        ButtonModule,
        TooltipModule,
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
        TabViewModule,
        UsersComponent,
        TodosComponent,
        UsersTasksComponent,
        SidebarModule,
        Button,
        AuditTrailComponent,
        DashboardComponent,
        FileUploadModule,
        TranslatePipe,
        ChatComponent,
        CalendarModule,
        ReactiveFormsModule,
        NgStyle,
        CalendarComponent,
    ],
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit{
    userEmail: string | null = '';
    displayModal: boolean = false;
    currentUser: any = ''
    userName: string = ''; // Имя пользователя
    sidebarVisible2: boolean = false;
    selectedFile: File | null = null; // Хранение выбранного файла
    isDarkTheme = false; // начальное значение светлой темы
    languages: Language[] = [];
    selectedLanguage: Language | null = null;

    constructor(
        private translate: TranslateService,
        private sharedStateService: SharedStateService,
        private messageService: MessageService,
        private authService: AuthService,
        private auditTrailService: AuditTrailService,
        private router: Router
    ) {
    }
    ngOnInit(): void {
        const email = localStorage.getItem('userEmail'); // Получаем email из localStorage
        const savedTheme = localStorage.getItem('theme');

        if (email) {
            this.loadUserName(email);
        } else {
            console.error('Email не найден в localStorage!');
        }

        if (savedTheme === 'dark') {
            this.isDarkTheme = true;
        } else {
            this.isDarkTheme = false;
        }
        this.applyTheme();
        this.initializeLanguages();
    }

    private initializeLanguages() {
        // Инициализация языков
        this.languages = [
            { label: 'Русский', code: 'ru' },
            { label: 'Кыргыз тили', code: 'ky' },
            { label: 'English', code: 'en' }
        ];

        // Получаем текущий язык из localStorage или используем 'ru' по умолчанию
        const currentLangCode = localStorage.getItem('language') || 'ru';

        // Устанавливаем текущий язык в TranslateService
        this.translate.addLangs(this.languages.map(lang => lang.code));
        this.translate.setDefaultLang(currentLangCode);
        this.translate.use(currentLangCode);

        // Устанавливаем выбранный язык в выпадающем списке
        this.selectedLanguage = this.languages.find(lang => lang.code === currentLangCode) || null;
    }

    onLanguageChange(selectedLang: Language) {
        const langCode = selectedLang.code; // Получаем код языка
        this.translate.use(langCode); // Переключаем язык
        localStorage.setItem('language', langCode); // Сохраняем язык в localStorage
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.applyTheme();
        // Сохраняем выбранную тему в localStorage
        localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    }
    private applyTheme() {
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            console.log("dark-theme")
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }

    loadUserName(email: string): void {
        this.sharedStateService.getUsers().subscribe((users) => {
            const user = users.find((user) => user.email === email);

            if (user) {
                this.userName = user.firstName ?? 'Гость'; // Задаём значение по умолчанию
            } else {
                this.userName = 'Гость'; // Если `user` undefined, задаём "Гость"
            }
        });
    }

    onLogout() {
        this.currentUser = this.authService.getCurrentUser();
        console.log(this.currentUser)
        if (this.currentUser) {
            this.userEmail = this.currentUser.email; // Установите email для отображения в модалке
            this.displayModal = true; // Открыть модальное окно
        } else {
            this.performLogout(); // Выполните выход без подтверждения
        }
    }

    performLogout() {
        this.authService.logout()
            .then(() => {
                this.router.navigate(['/login']).then(() => {
                    window.location.reload();
                });
            })
            .catch(err => alert('Error signing out: ' + err.message));
    }

    onFileSelected(event: any): void {
        console.log(event)
        const file = event.target.files[0];
        if (file && file.name.endsWith('.csv')) {
            this.selectedFile = file;
        } else {
            this.messageService.add({severity: 'error', summary: 'Ошибка', detail: 'Выберите CSV-файл'});
            this.selectedFile = null;
        }
    }

    isDuplicateId(id: string): boolean {
        const currentUsers = this.sharedStateService['usersSubject'].getValue();
        return currentUsers.some((user) => user.id === id);
    }

    exportToExcel(): void {
        const users = this.sharedStateService['usersSubject'].getValue(); // Получаем текущих пользователей

        // Оставляем только нужные поля
        const filteredUsers = users.map((user) => ({
            "Имя": `${user.firstName} ${user.lastName}`,
            "Email": user.email,
            "Роль": user.role,
            "Возраст": user.age,
            "Номер телефона": user.phoneNumber,
            "Пол": user.gender,
            "Дата рождение": user.dateOfBirth,
            "Изображение": user.profilePicture,
        }));

        const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
        const workbook = {Sheets: {'Users': worksheet}, SheetNames: ['Users']};

        XLSX.writeFile(workbook, 'users.xlsx');
    }
}