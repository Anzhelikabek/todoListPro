import {Component} from '@angular/core';
import {SharedTableComponent} from '../../shared/shared-table/shared-table.component';
import {ButtonDirective} from 'primeng/button';

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [
    SharedTableComponent,
    ButtonDirective
  ]
})
export class UsersComponent {
  users: any[] = []; // Данные пользователей
  userColumns: { field: string; header: string }[] = []; // Определение колонок для таблицы
  selectedUsers: any[] = []; // Выбранные пользователи для удаления или редактирования

  constructor() {
  }

  ngOnInit() {
    // Пример данных пользователей
    this.users = [
      {id: 1, username: 'JohnDoe', email: 'john@example.com', role: 'Admin'},
      {id: 2, username: 'JaneSmith', email: 'jane@example.com', role: 'User'},
      {id: 3, username: 'AliceJohnson', email: 'alice@example.com', role: 'Manager'},
      {id: 4, username: 'BobBrown', email: 'bob@example.com', role: 'User'},
    ];

    // Определение колонок
    this.userColumns = [
      {field: 'username', header: 'Имя пользователя'},
      {field: 'email', header: 'Email'},
      {field: 'role', header: 'Роль'},
    ];
  }

  // Обработка редактирования пользователя
  // Обработка редактирования пользователя
  onEditUser(user: any): void {
    console.log('Редактирование пользователя:', user);
    alert(`Редактирование пользователя: ${user.username}`);
  }

  // Обработка удаления пользователя
  onDeleteUser(user: any): void {
    console.log('Удаление пользователя:', user);
    const confirmDelete = confirm(`Вы уверены, что хотите удалить пользователя ${user.username}?`);
    if (confirmDelete) {
      // Удаление пользователя из списка
      this.users = this.users.filter((u) => u.id !== user.id);
      alert(`Пользователь ${user.username} удалён.`);
    }
  }

  onDeleteSelected(): void {
    if (this.selectedUsers.length > 0) {
      const confirmDelete = confirm(
        `Вы уверены, что хотите удалить ${this.selectedUsers.length} пользователя(ей)?`
      );
      if (confirmDelete) {
        // Удаление выбранных пользователей
        this.selectedUsers.forEach((selectedUser) => {
          this.users = this.users.filter((u) => u.id !== selectedUser.id);
        });

        // Очистить массив выбранных пользователей
        this.selectedUsers = [];

        alert('Выбранные пользователи удалены.');
      }
    }
  }

}
