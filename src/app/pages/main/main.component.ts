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
    ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  // Управление модальными окнами
  productDialog: boolean = false;
  deleteProductDialog: boolean = false;
  deleteProductsDialog: boolean = false;

  // Продукты и их состояние
  products: Todo[] = [];
  product: Todo = {};
  selectedProducts: any[] = [];
  userEmail: string | null = ''
  displayModal: boolean = false; // Управление отображением модального окна

  // Данные таблицы
  selectedStatus: boolean | null = null; // Для фильтрации задач

  submitted: boolean = false;
  cols: any[] = [];
  isAdmin: boolean = false;


  statusOptions = [
    { label: 'Выполнено', value: true },
    { label: 'Не выполнено', value: false }
  ];

  constructor(private productService: TodoService, private messageService: MessageService,  private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    const userEmail = localStorage.getItem('userEmail'); // Получаем email пользователя
    this.isAdmin = this.authService.isAdmin(userEmail || '');
    if (!this.isAdmin) {
      console.log('CRUD недоступен для этого пользователя');
    }

    this.loadProducts();

    // Определение колонок
    this.cols = [
      { field: 'name', header: 'Заголовок' },
      { field: 'description', header: 'Описание' },
      { field: 'status', header: 'Статус' }
    ];
  }

  // Загрузка продуктов из localStorage
  loadProducts(): void {
    this.products = this.productService.getProducts();
  }

  // Открытие модального окна для создания нового продукта
  openNew() {
    this.product = {}; // Очистить текущий продукт
    this.submitted = false;
    this.productDialog = true;
  }

  // Удаление выбранных продуктов
  deleteSelectedProducts() {
    if (!this.selectedProducts || !this.selectedProducts.length) {
      return; // Если ничего не выбрано, ничего не делаем
    }
    this.deleteProductsDialog = true; // Открыть модалку подтверждения
  }

  confirmDeleteSelected() {
    if (!this.selectedProducts || !this.selectedProducts.length) {
      return; // Если ничего не выбрано, ничего не делаем
    }

    // Удаление выбранных продуктов
    this.selectedProducts.forEach((selected) => {
      if (selected.id) {
        this.productService.deleteProduct(selected.id); // Удаление из localStorage
      }
    });

    // Обновляем таблицу и сбрасываем выбранные продукты
    this.loadProducts();
    this.selectedProducts = [];

    // Закрываем модалку
    this.deleteProductsDialog = false;

    // Уведомление об успешном удалении
    this.messageService.add({
      severity: 'success',
      summary: 'Successful',
      detail:
        this.selectedProducts.length === 1
          ? `${this.selectedProducts[0].name} удалено`
          : 'Выбранные задачи удалены',
      life: 3000,
    });
  }

  // Редактирование продукта
  editProduct(product: Todo) {
    this.product = {...product}; // Копия продукта для редактирования
    this.productDialog = true;
  }

  // Удаление одного продукта
  deleteProduct(product: Todo) {
    this.deleteProductDialog = true;
    this.product = {...product};
  }

  // Подтверждение удаления одного продукта
  confirmDelete() {
    this.deleteProductDialog = false;
    this.productService.deleteProduct(this.product.id!); // Удаление из localStorage
    this.loadProducts(); // Обновить таблицу
    this.messageService.add({severity: 'success', summary: 'Успешно', detail: 'Задача удалена', life: 3000});
    this.product = {};
  }

  // Закрытие модального окна
  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  // Сохранение продукта
  saveProduct() {
    this.submitted = true;

    if (this.product.name?.trim()) {
      if (this.product.id) {
        // Обновление существующей задачи
        this.productService.updateProduct(this.product.id, this.product);
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Задача обновлена',
          life: 3000
        });
      } else {
        // Создание новой задачи
        this.product.id = this.createId();
        this.productService.addProduct(this.product);
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: 'Задача создана',
          life: 3000
        });
      }

      this.loadProducts(); // Обновление данных
      this.productDialog = false; // Закрыть модалку
      this.product = {}; // Очистить форму
    }
  }
  onLogout() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      console.log(currentUser)
      this.userEmail = currentUser.email; // Установите email для отображения в модалке
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

  confirmLogout() {
    this.displayModal = false; // Закрыть модальное окно
    this.performLogout(); // Выполнить выход
  }

  cancelLogout() {
    this.displayModal = false; // Просто закрыть модальное окно
  }

  // Генерация уникального ID
  createId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({length: 5}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  // Глобальный фильтр для таблицы
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
