<script>
// import Home from './pages/Home.vue';
import { logout, subscribeToAuthStateChanges } from './services/auth';

export default {
    name: 'App',
    data() {
        return {
            user: {
                id: null,
                email: null,
            },
        }
    },
    methods: {
        handleLogout() {
            logout();

            // Redireccionamos al usuario al login.
            // Esto requiere usar la instanacia de Router de Vue Router.
            // La tenemos disponible en la propiedad especial $router.
            this.$router.push('/ingresar');
        },
    },
    mounted() {
        // Nos suscribimos para recibir los cambios en el estado de autenticación.
        subscribeToAuthStateChanges(newUserState => this.user = newUserState);
    }
    // La propiedad "components" de Vue indica qué componentes usamos en el template.
    // components: { Home, },
}
</script>

<template>
    <!-- 
    En Tailwind, cada clase representa un valor de un estilo.
    La mayoría de estas clases llevan la nomenclatura de:
        <estilo>-<valor>
            
    Por ejemplo:
        .p-4                padding: 1rem;
        .text-xl            font-size: 1.25rem;
        .border-0           border: 0;

    Hay ciertos casos que pueden tener 3 segmentos. Por ejemplo, manejo de colores:
        .text-red-700
        .bg-slate-500
    
    Por último, hay algunas clases (como display o text-decoration) donde el nombre
    de la clase hace referencia solo al valor del estilo.
    Por ejemplo:
        .flex               display: flex;
        .grid               display: grid;
        .underline          text-decoration: underline;
    -->
    <nav class="flex items-center gap-8 p-4 bg-slate-200">
        <p class="text-xl">DV Social</p>
        <ul class="flex gap-4">
            <li><RouterLink to="/">Home</RouterLink></li>
            <template v-if="user.id === null">
                <li><RouterLink to="/ingresar">Ingresar</RouterLink></li>
                <li><RouterLink to="/crear-cuenta">Crear cuenta</RouterLink></li>
            </template>
            <template v-else>
                <li><RouterLink to="/chat">Chat general</RouterLink></li>
                <li><RouterLink to="/mi-perfil">Mi perfil</RouterLink></li>
                <li>
                    <form 
                        action="#"
                        @submit.prevent="handleLogout"
                    >
                        <button type="submit">{{ user.email }} (Cerrar sesión)</button>
                    </form>
                </li>
            </template>
        </ul>
    </nav>
    <main class="container p-4 mx-auto">
        <!--
        RouterView es un componete que registra globalmente el use(router) (en main.js).
        Esto define dónde queremos que se monte los componentes de las vistas que 
        correspondan a la URL.
        -->
        <RouterView />
    </main>
    <footer class="flex justify-center items-center h-25 bg-slate-900 text-white">
        <p>Da Vinci &copy; 2025</p>
    </footer>
</template>