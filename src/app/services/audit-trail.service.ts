import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuditRecord } from '../interfaces/audit-record';

@Injectable({
  providedIn: 'root',
})
export class AuditTrailService {
  private readonly localStorageKey = 'auditTrail'; // Ключ для localStorage
  private auditRecordsSubject = new BehaviorSubject<AuditRecord[]>([]); // Реактивное состояние записей
  auditRecords$ = this.auditRecordsSubject.asObservable(); // Observable для подписки
  private auditTrailSubject = new BehaviorSubject<AuditRecord[]>([]);
  auditTrail$ = this.auditTrailSubject.asObservable();
  constructor() {
    this.loadAuditTrailFromLocalStorage();
  }

  // Загрузка данных из localStorage
  private loadAuditTrailFromLocalStorage(): void {
    const storedRecords = localStorage.getItem(this.localStorageKey);
    const records = storedRecords ? JSON.parse(storedRecords) : [];
    this.auditRecordsSubject.next(records);
  }

  // Сохранение данных в localStorage
  private saveAuditTrailToLocalStorage(): void {
    const records = this.auditRecordsSubject.getValue();
    localStorage.setItem(this.localStorageKey, JSON.stringify(records));
  }

  // Добавление записи аудита
  addAuditRecord(record: AuditRecord): Observable<AuditRecord> {
    const currentRecords = this.auditRecordsSubject.getValue();
    const updatedRecords = [...currentRecords, record];
    this.auditRecordsSubject.next(updatedRecords);
    this.saveAuditTrailToLocalStorage();
    return of(record);
  }

  // Получение всех записей аудита
  getAuditRecords(): Observable<AuditRecord[]> {
    return this.auditRecords$;
  }
}
