<script>
import { RouterLink } from 'vue-router';
import AppH1 from '../components/AppH1.vue';
import { subscribeToAuthStateChanges } from '../services/auth';

let unsubscribeFromAuth = () => {}; // Esta función es un "placeholder".

export default {
    name: 'MyProfile',
    components: { AppH1, },
    data() {
        return {
            user: {
                id: null,
                email: null,
                display_name: null,
                bio: null,
                career: null,
            }
        }
    },
    mounted() {
        // Guardamos la función que desuscribre al observer.
        unsubscribeFromAuth = subscribeToAuthStateChanges(async newUserState => {
            this.user = newUserState;

            // Cargamos el perfil.
            // const profile = await fetchUserProfileById(this.user.id);
            // this.user = {
            //     ...this.user,
            //     ...profile,
            // }
        });
    },
    unmounted() {
        // Limpiamos la suscripción.
        unsubscribeFromAuth();
    },
}
</script>

<template>
    <div class="flex gap-4 items-end">
        <AppH1>Mi perfil</AppH1>
        <RouterLink to="/mi-perfil/editar" class="mb-4 text-blue-700 underline">Editar</RouterLink>
    </div>

    <div class="ms-4 my-8 italic text-gray-800">{{ user.bio || 'Sin especificar...' }}</div>

    <dl>
        <dt class="mb-1 font-bold">Email</dt>
        <dd class="mb-2">{{ user.email }}</dd>
        <dt class="mb-1 font-bold">Usuario</dt>
        <dd class="mb-2">{{ user.display_name || 'Sin especificar...' }}</dd>
        <dt class="mb-1 font-bold">Carrera</dt>
        <dd class="mb-2">{{ user.career || 'Sin especificar...' }}</dd>
    </dl>
</template>