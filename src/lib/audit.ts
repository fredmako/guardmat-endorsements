import { supabaseAdmin } from './supabase';

interface AuditLogParams {
  action: string;
  entityType: string;
  entityId?: string;
  adminEmail?: string;
  details?: Record<string, any>;
}

export async function logAudit({
  action,
  entityType,
  entityId,
  adminEmail,
  details = {},
}: AuditLogParams): Promise<void> {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      admin_email: adminEmail,
      details,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

export async function getAuditLogs(
  limit: number = 100,
  offset: number = 0
): Promise<any[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}
