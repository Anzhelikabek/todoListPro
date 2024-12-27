import {Component} from '@angular/core';
import {AuditTrailService} from '../../services/audit-trail.service';
import {AuditRecord} from '../../interfaces/audit-record';
import {DatePipe, CommonModule} from '@angular/common';
import {TableModule} from 'primeng/table';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonDirective} from "primeng/button";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-audit-trail',
    standalone: true,
    templateUrl: './audit-trail.component.html',
    imports: [DatePipe, CommonModule, TableModule, InputTextModule, ButtonDirective, ConfirmDialogModule, TranslatePipe],
    styleUrls: ['./audit-trail.component.scss'],
    providers: [ConfirmationService, MessageService],
})
export class AuditTrailComponent {
    auditRecords: AuditRecord[] = [];
    filteredRecords: AuditRecord[] = []; // Отфильтрованные записи

    constructor(private auditTrailService: AuditTrailService,
                private translate: TranslateService,
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
        this.translate.get(['areYouSureClearHistory', 'confirmation', 'yes', 'no']).subscribe(translations => {
            this.confirmationService.confirm({
                message: translations['areYouSureClearHistory'],
                header: translations['confirmation'],
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: translations['yes'],
                rejectLabel: translations['no'],
                accept: () => {
                    this.clearAuditTrail();
                },
            });
        });
    }

    loadAuditRecords(): void {
        this.auditTrailService.getAuditRecords().subscribe((records) => {
            this.auditRecords = records;
            this.filteredRecords = [...this.auditRecords]; // Изначально показываем все записи
        });
    }

    clearAuditTrail(): void {
        this.auditTrailService.clearAuditTrail().subscribe((success) => {
            if (success) {
                console.log('История изменений успешно очищена.');
            }
        });
    }
}
