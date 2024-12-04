import { Component, EventEmitter, Input, Output } from '@angular/core';
import {NgClass, NgForOf, NgIf, NgStyle} from '@angular/common';
import {TableModule} from 'primeng/table';
import {Ripple} from 'primeng/ripple';
import {ButtonDirective} from 'primeng/button';
import {PhoneNumberFormatPipe} from "../../pipes/phone-number-format.pipe";

@Component({
  selector: 'app-shared-table',
  standalone: true,
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.scss'],
  imports: [
    NgForOf,
    TableModule,
    NgIf,
    Ripple,
    ButtonDirective,
    NgClass,
    NgStyle,
    PhoneNumberFormatPipe,
  ]
})
export class SharedTableComponent {
  private _selectedItems: any[] = []; // Локальное хранилище выбранных элементов

  @Input()
  get selectedItems(): any[] {
    return this._selectedItems;
  }

  @Output() selectedItemsChange = new EventEmitter<any[]>(); // Событие для двухсторонней привязки

  set selectedItems(value: any[]) {
    this._selectedItems = value;
    this.selectedItemsChange.emit(this._selectedItems); // Генерация события при изменении
  }

  @Output() viewDetails = new EventEmitter<any>();
  @Input() transformColumn: (value: string) => string = (value) => value;
  @Input() data: any[] = [];
  @Input() columns: { field: string; header: string }[] = [];
  @Input() rows: number = 5;
  @Input() isAdmin: boolean = false;
  @Input() showViewButton: boolean = false; // По умолчанию кнопка не отображается

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  onViewDetails(item: any): void {
    this.viewDetails.emit(item);
  }
  onRowSelect(event: any) {
    this.selectedItemsChange.emit(this._selectedItems); // Обновляем привязку при выборе строки
  }

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }
}
