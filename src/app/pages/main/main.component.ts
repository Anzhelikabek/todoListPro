import {Component} from '@angular/core';
import {ToastModule} from 'primeng/toast';
import {Button, ButtonDirective} from 'primeng/button';
import {MessageService} from 'primeng/api';
import {TodoService} from '../../services/todo.service';
import {TableModule} from 'primeng/table';
import {ToolbarModule} from 'primeng/toolbar';
import {Ripple} from 'primeng/ripple';
import {DialogModule} from 'primeng/dialog';
import {FormsModule} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {NgClass, NgIf} from '@angular/common';
import {DropdownModule} from 'primeng/dropdown';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {SharedTableComponent} from '../../shared/shared-table/shared-table.component';
import {TabViewModule} from "primeng/tabview";
import {UsersComponent} from "../users/users.component";
import {TodosComponent} from "../todos/todos.component";
import {UsersTasksComponent} from "../users-tasks/users-tasks.component";
import {UserService} from "../../services/user.service";
import {SidebarModule} from "primeng/sidebar";
import {AuditTrailComponent} from "../../components/audit-trail/audit-trail.component";
import {DashboardComponent} from "../../components/dashboard/dashboard.component";
import {User} from "../../interfaces/user";
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {SharedStateService} from "../../services/shared-state.service";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";
import {FileUploadModule} from "primeng/fileupload";

@Component({
  selector: 'app-main',
  standalone: true,
    imports: [
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
    ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  userEmail: string | null = '';
  displayModal: boolean = false;
  currentUser: any = ''
  userName: string = ''; // Имя пользователя
  sidebarVisible2: boolean = false;
  selectedFile: File | null = null; // Хранение выбранного файла


  constructor(
      private userService: UserService,
      private sharedStateService: SharedStateService,
      private todoService: TodoService,
      private messageService: MessageService,
      private authService: AuthService,
      private router: Router
  ) {}


  ngOnInit(): void {
    const email = localStorage.getItem('userEmail'); // Получаем email из localStorage

    if (email) {
      this.loadUserName(email);
    } else {
      console.error('Email не найден в localStorage!');
    }
  }

  loadUserName(email: string): void {
    this.userService.getUsers().subscribe((users) => {
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
            this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Выберите CSV-файл' });
            this.selectedFile = null;
        }
    }
    importUsers(event: any, fileUpload: any): void {
        const file = event.files[0]; // Получаем первый файл из массива files

        if (!file) {
            this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Файл не выбран' });
            return;
        }

        const reader = new FileReader();

        reader.onload = (e: any) => {
            const binaryData = e.target.result;
            const workbook = XLSX.read(binaryData, { type: 'binary' });

            // Читаем данные с первого листа
            const sheetName = workbook.SheetNames[0];
            const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            console.log('Импортированные данные:', data);

            // Вызов метода для валидации и сохранения данных
            this.validateAndSaveUsers(data as User[]);
            fileUpload.clear();
        };

        reader.onerror = () => {
            this.messageService.add({ severity: 'error', summary: 'Ошибка', detail: 'Не удалось прочитать файл' });
        };

        reader.readAsBinaryString(file);
    }
    validateAndSaveUsers(users: User[]): void {
        const invalidUsers = users.filter(
            (user) =>
                !user.email || // Проверка на наличие email
                !this.isValidEmail(user.email) ||
                !user.id ||
                this.isDuplicateId(user.id)
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
        const updatedUsers = [...existingUsers, ...users];
        this.sharedStateService.setUsers(updatedUsers); // Вызов метода setUsers

        this.messageService.add({ severity: 'success', summary: 'Успешно', detail: 'Пользователи импортированы' });
    }


    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isDuplicateId(id: string): boolean {
        const currentUsers = this.sharedStateService['usersSubject'].getValue();
        return currentUsers.some((user) => user.id === id);
    }
    exportToCsv(): void {
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

        const csvData = Papa.unparse(filteredUsers);

        // Добавляем BOM для корректного отображения кириллицы
        const bom = '\uFEFF';
        const blob = new Blob([bom + csvData], { type: 'text/csv;charset=utf-8;' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'users.csv';
        link.click();

        // Освобождаем память
        URL.revokeObjectURL(url);
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
        const workbook = { Sheets: { 'Users': worksheet }, SheetNames: ['Users'] };

        XLSX.writeFile(workbook, 'users.xlsx');
    }


}