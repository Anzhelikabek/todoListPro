export interface AuditRecord {
    id: string;
    timestamp: Date;
    action: string;
    entity: string;
    entityId?: string;
    performedBy: string;
    details: string;
}
