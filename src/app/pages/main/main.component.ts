import {Component} from '@angular/core';
import {ToastModule} from 'primeng/toast';
import {ButtonDirective} from 'primeng/button';
import {Todo} from '../../interfaces/todo';
import {MessageService} from 'primeng/api';
import {TodoService} from '../../services/todo.service';
import {Table, TableModule} from 'primeng/table';
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
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  userEmail: string | null = '';
  displayModal: boolean = false;
  currentUser: any = ''
  userName: string = ''; // Имя пользователя

  constructor(
      private userService: UserService,
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
        this.userName = user.firstName; // Сохраняем имя пользователя
      } else {
        console.warn('Пользователь с таким email не найден!');
        this.userName = 'Гость'; // Значение по умолчанию
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
}