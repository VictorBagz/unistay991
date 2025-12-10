import { supabase } from './supabase';
import { ContactSubmission } from '../types';

// CRUD operations for contact submissions
export const contactService = {
    async getAll(): Promise<ContactSubmission[]> {
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('timestamp', { ascending: false });
        if (error) {
            console.error('Error fetching contact submissions:', error);
            throw error;
        }
        return data as ContactSubmission[];
    },

    async getCounts(): Promise<number> {
        const { count, error } = await supabase
            .from('contact_submissions')
            .select('*', { count: 'exact', head: true });
        if (error) {
            console.error('Error counting contact submissions:', error);
            throw error;
        }
        return count || 0;
    },

    async add(submission: Omit<ContactSubmission, 'id'>): Promise<ContactSubmission> {
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert([submission])
            .select();
        if (error) {
            console.error('Error adding contact submission:', error);
            throw error;
        }
        return data[0] as ContactSubmission;
    },

    async update(id: string, submission: Partial<Omit<ContactSubmission, 'id'>>): Promise<void> {
        const { error } = await supabase
            .from('contact_submissions')
            .update(submission)
            .eq('id', id);
        if (error) {
            console.error('Error updating contact submission:', error);
            throw error;
        }
    },

    async markAsRead(id: string): Promise<void> {
        await this.update(id, { read: true });
    },

    async remove(id: string): Promise<void> {
        const { error } = await supabase
            .from('contact_submissions')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Error removing contact submission:', error);
            throw error;
        }
    },
};

// Handler compatible with AdminDashboard
export const contactHandler = {
    add: async (item: ContactSubmission) => {
        await contactService.add(item);
    },
    update: async (item: ContactSubmission) => {
        await contactService.update(item.id, item);
    },
    remove: async (id: string) => {
        await contactService.remove(id);
    },
};
