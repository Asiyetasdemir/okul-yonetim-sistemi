import { supabase } from '../supabaseClient.js';

/** Tüm öğrencileri (ilişkili veli/finans bilgisiyle) getirir.
 *  RLS sayesinde admin/öğretmen hepsini, veli sadece kendi çocuğunu,
 *  öğrenci sadece kendi profilini görür — ekstra filtre yazmaya gerek yok. */
export async function fetchStudents() {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      parents (*),
      student_finance (*),
      installments (*),
      payments (*),
      exams (*),
      behavior_logs (*)
    `)
    .order('name');

  if (error) {
    console.error('fetchStudents hatası:', error);
    throw error;
  }
  return data;
}

export async function fetchStudentById(studentId) {
  const { data, error } = await supabase
    .from('students')
    .select(`*, parents (*), student_finance (*), installments (*), payments (*), exams (*), behavior_logs (*)`)
    .eq('id', studentId)
    .single();

  if (error) throw error;
  return data;
}

export async function addStudent(student) {
  const { data, error } = await supabase.from('students').insert(student).select().single();
  if (error) throw error;
  return data;
}

export async function updateStudent(studentId, updates) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', studentId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addBehaviorLog(studentId, log) {
  const { data, error } = await supabase
    .from('behavior_logs')
    .insert({ student_id: studentId, ...log })
    .select()
    .single();
  if (error) throw error;
  return data;
}
