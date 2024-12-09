import {Component} from '@angular/core';
import {AuditTrailService} from '../../services/audit-trail.service';
import {AuditRecord} from '../../interfaces/audit-record';
import {DatePipe, CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonDirective} from "primeng/button";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";

@Component({
    selector: 'app-audit-trail',
    standalone: true,
    templateUrl: './audit-trail.component.html',
    imports: [DatePipe, CommonModule, TableModule, InputTextModule, ButtonDirective, ConfirmDialogModule],
    styleUrls: ['./audit-trail.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class AuditTrailComponent {
    auditRecords: AuditRecord[] = [];
    filteredRecords: AuditRecord[] = []; // Отфильтрованные записи

    constructor(private auditTrailService: AuditTrailService,
                private messageService: MessageService,
                private confirmationService: ConfirmationService,) {
    }

    ngOnInit(): void {
        this.auditTrailService.auditRecords$.subscribe((records) => {
            this.auditRecords = records;
        });
        this.loadAuditRecords();
    }

    confirmClearAuditTrail(): void {
        this.confirmationService.confirm({
            message: 'Вы уверены, что хотите очистить историю изменений?',
            header: 'Подтверждение',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.clearAuditTrail();
            },
        });
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

    clearAuditTrail(): void {
        this.auditTrailService.clearAuditTrail().subscribe((success) => {
            if (success) {
                console.log('История изменений успешно очищена.');
            }
        });
    }
}
