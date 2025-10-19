<script>
import { RouterLink } from 'vue-router';
import AppH1 from '../components/AppH1.vue';
import { fetchUserProfileById } from '../services/user-profiles';

export default {
    name: 'UserProfile',
    components: { AppH1, },
    data() {
        return {
            user: {
                id: null,
                email: null,
                display_name: null,
                bio: null,
                career: null,
            },
            loading: false,
        }
    },
    async mounted() {
        try {
            this.loading = true;

            // this.$route nos da acceso al objeto de la ruta que se está renderizando.
            // Vamos a tener toda la info de la misma, incluyendo los valores de cualquier
            // parámetro de ruta en la propiedad "params".
            // El parámetro "id" sale del ":id" que pusimos en la ruta cuando la definimos.
            this.user = await fetchUserProfileById(this.$route.params.id);
        } catch (error) {
            // TODO...
        }
        this.loading = false;
    },
}
</script>

<template>
    <AppH1>Perfil de {{ user.email }}</AppH1>

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