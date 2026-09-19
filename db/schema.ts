import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, uniqueIndex, check } from 'drizzle-orm/sqlite-core';
export const workspaces = sqliteTable('workspaces', {
 id:text('id').primaryKey(), owner:text('owner').notNull(), name:text('name').notNull(), demo:integer('demo').notNull().default(0), createdAt:text('created_at').notNull(),
}, t=>[index('idx_workspace_owner').on(t.owner)]);
export const members = sqliteTable('members', {
 id:text('id').primaryKey(), workspaceId:text('workspace_id').notNull().references(()=>workspaces.id), email:text('email').notNull(), name:text('name').notNull(), role:text('role').notNull(), patientIds:text('patient_ids').notNull().default('[]'), supplierId:text('supplier_id'), active:integer('active').notNull().default(1),
},t=>[uniqueIndex('idx_member_email_workspace').on(t.workspaceId,t.email),index('idx_member_email').on(t.email)]);
export const records = sqliteTable('records', {
 id:text('id').primaryKey(), workspaceId:text('workspace_id').notNull().references(()=>workspaces.id), kind:text('kind').notNull(), patientId:text('patient_id'), supplierId:text('supplier_id'), data:text('data').notNull(), revision:integer('revision').notNull().default(1), createdAt:text('created_at').notNull(), updatedAt:text('updated_at').notNull(), archived:integer('archived').notNull().default(0),
},t=>[check('stock_nonnegative',sql`kind != 'products' OR CAST(json_extract(data, '$.stock') AS INTEGER) >= 0`),index('idx_records_workspace_kind').on(t.workspaceId,t.kind,t.archived),index('idx_records_workspace_patient').on(t.workspaceId,t.patientId)]);
export const audit = sqliteTable('audit', {
 id:text('id').primaryKey(),workspaceId:text('workspace_id').notNull(),recordId:text('record_id'),actor:text('actor').notNull(),action:text('action').notNull(),summary:text('summary').notNull(),createdAt:text('created_at').notNull(),
},t=>[index('idx_audit_workspace_date').on(t.workspaceId,t.createdAt)]);
export const slots = sqliteTable('slots',{
 id:text('id').primaryKey(),recordId:text('record_id').notNull(),workspaceId:text('workspace_id').notNull(),
});
export const receipts = sqliteTable('receipts',{id:text('id').primaryKey(),createdAt:text('created_at').notNull()});
