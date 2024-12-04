import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'phoneNumberFormat',
  standalone: true
})
export class PhoneNumberFormatPipe implements PipeTransform {
  transform(phoneNumber: string): string {
    if (!phoneNumber) {
      return '';
    }

    // Убедимся, что в номере только цифры
    const digits = phoneNumber.replace(/\D/g, '');

    // Если длина номера не 9, возвращаем его как есть
    if (digits.length !== 9) {
      return phoneNumber;
    }

    // Форматируем номер в формате +996 999 09 09 66
    return `+996 ${digits.substring(0, 3)} ${digits.substring(3, 5)} ${digits.substring(5, 7)} ${digits.substring(7)}`;
  }
}
