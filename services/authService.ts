import { supabase } from './supabase';
import { User } from '../types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const formatUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;
    return {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
        email: supabaseUser.email,
    };
};

export const authService = {
  async signUp(
    name: string,
    email: string,
    password: string,
    universityId: string,
    contactNumber: string,
    studentNumber: string,
    dateOfBirth: string,
    profilePhoto: File | null
  ): Promise<User> {
    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            },
        },
    });

    if (signUpError) throw signUpError;
    if (!data.user) throw new Error('Signup successful, but no user data returned.');

    // --- Profile Photo Upload Logic ---
    let imageUrl = `https://picsum.photos/seed/${name.toLowerCase().replace(/\s/g, '')}/400/400`;
    if (profilePhoto) {
        // Use a unique file path to prevent overwrites
        const filePath = `${data.user.id}/${Date.now()}_${profilePhoto.name}`;
        const { error: uploadError } = await supabase.storage
            .from('profile-photos') // Must match your bucket name
            .upload(filePath, profilePhoto, {
                cacheControl: '3600',
                upsert: true, // Overwrite if file exists, useful for profile updates
            });
        
        if (uploadError) {
            console.error('Error uploading profile photo:', uploadError);
            // Fallback to default image, don't block signup
        } else {
            const { data: urlData } = supabase.storage
                .from('profile-photos') // Must match your bucket name
                .getPublicUrl(filePath);
            if (urlData.publicUrl) {
                imageUrl = urlData.publicUrl;
            }
        }
    }
    // --- End Photo Logic ---

    // Upsert the corresponding roommate profile to either create it or update it
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id, // This MUST match the auth.uid()
        name: name.split(' ')[0] || name, // Use first name
        email: data.user.email!,
        universityId: universityId,
        contactNumber: contactNumber,
        studentNumber: studentNumber,
        imageUrl: imageUrl, // Use the potentially updated image URL
        dateOfBirth: dateOfBirth, // Add the date of birth
    }, {
        onConflict: 'id', // Specify the column to check for conflicts
    });

    if (profileError) {
        console.error("Error upserting profile:", profileError);
        // Optional: You might want to delete the created user if profile creation fails
        // await supabase.auth.admin.deleteUser(data.user.id)
        throw profileError;
    }

    return formatUser(data.user);
  },

  async login(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Login successful, but no user data returned.');
    return formatUser(data.user);
  },

  // social login (OAuth) removed to avoid direct Google provider dependency

  async updateProfilePhoto(userId: string, profilePhoto: File): Promise<string> {
    if (!profilePhoto) throw new Error("No photo provided.");
    if (profilePhoto.size > 2 * 1024 * 1024) { // 2MB limit
      throw new Error('Image file is too large. Please use a file under 2MB.');
    }
  
    const filePath = `${userId}/${Date.now()}_${profilePhoto.name}`;
    const { error: uploadError } = await supabase.storage
      .from('profile-photos') // Must match your bucket name
      .upload(filePath, profilePhoto, { upsert: true });
  
    if (uploadError) {
      console.error('Error uploading new profile photo:', uploadError);
      throw new Error("Failed to upload new photo.");
    }
  
    const { data: urlData } = supabase.storage
      .from('profile-photos') // Must match your bucket name
      .getPublicUrl(filePath);
    
    if (!urlData.publicUrl) {
      throw new Error("Failed to get public URL for the new photo.");
    }
    
    const imageUrl = urlData.publicUrl;
  
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ imageUrl: imageUrl })
      .eq('id', userId);
    
    if (profileError) {
      console.error("Error updating profile with new photo URL:", profileError);
      throw new Error("Failed to update profile with new photo.");
    }
  
    return imageUrl;
  },

  // FIX: The logout function was returning a promise with a value, which did not match the Promise<void> type.
  // Made the function async and awaited the signOut call to handle the error and ensure a void return.
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
  },
};