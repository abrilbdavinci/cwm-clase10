import { supabase } from "./supabase";

/**
 * 
 * @param {string} id 
 * @returns 
 */
export async function fetchUserProfileById(id) {
    const { data, error } = await supabase
        .from('user_profiles')
        .select()
        // eq => equals
        // Agrega una condición de igualdad en el WHERE.
        .eq('id', id)
        // limit(1) aclara que queremos que traiga solo un resultado.
        .limit(1)
        // single() le indica a Supabase que quiero que me de solo
        // el objeto del registro, y no un array de objetos.
        .single();
    
    if(error) {
        console.error('[user-profiles.js fetchUserProfileById] Error al traer el perfil del usuario:', id, error);
        throw new Error(error.message);
    }

    return data;
}

export async function createUserProfile(data) {
    const { error } = await supabase
        .from('user_profiles')
        .insert(data);

    if(error) {
        console.error('[user-profiles.js createUserProfile] Error al crear el usuario:', error);
        throw new Error(error.message);
    }
}

export async function updateUserProfile(id, data) {
    const { error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', id);

    if(error) {
        console.error('[user-profiles.js updateUserProfile] Error al actualizar el usuario:', id, error);
        throw new Error(error.message);
    }
}