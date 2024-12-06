import { Component } from '@angular/core';
import { AuditTrailService } from '../../services/audit-trail.service';
import { AuditRecord } from '../../interfaces/audit-record';
import { DatePipe, CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  templateUrl: './audit-trail.component.html',
  imports: [DatePipe, CommonModule, TableModule, InputTextModule],
  styleUrls: ['./audit-trail.component.scss'],
})
export class AuditTrailComponent {
  auditRecords: AuditRecord[] = [];
  filteredRecords: AuditRecord[] = []; // Отфильтрованные записи

  constructor(private auditTrailService: AuditTrailService) {}

  ngOnInit(): void {
    this.loadAuditRecords();
  }

  loadAuditRecords(): void {
    this.auditTrailService.getAuditRecords().subscribe((records) => {
      this.auditRecords = records;
      this.filteredRecords = [...this.auditRecords]; // Изначально показываем все записи
    });
  }

  globalFilter(event: any): void {
    const query = event.target.value.toLowerCase();
    this.filteredRecords = this.auditRecords.filter((record) =>
        Object.values(record).some((value) =>
            value && value.toString().toLowerCase().includes(query)
        )
    );
  }
}
