import type { SupabaseClient } from '@supabase/supabase-js';
export type ScheduledReport = { email_id: string; report_date: string };
export async function readScheduledReport(userId: string, client: SupabaseClient) {
 const { data, error } = await client.from('timectrl_reports').select('email_id,report_date').eq('user_id', userId).maybeSingle();
 if (error) throw error;
 return data as ScheduledReport | null;
}
export async function writeScheduledReport(userId: string, emailId: string, reportDate: string, scheduledAt: string, client: SupabaseClient) {
 const { error } = await client.from('timectrl_reports').upsert({ user_id: userId, email_id: emailId, report_date: reportDate, scheduled_at: scheduledAt });
 if (error) throw error;
}
export async function deleteScheduledReport(userId: string, client: SupabaseClient) {
 const { error } = await client.from('timectrl_reports').delete().eq('user_id', userId);
 if (error) throw error;
}
