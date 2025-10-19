<script>
import AppH1 from '../components/AppH1.vue';
import { subscribeToAuthStateChanges } from '../services/auth';
import { fetchLastGlobalChatMessages, sendNewGlobalChatMessage, subscribeToNewGlobalChatMessages } from '../services/global-chat';

let unsubcribeFromChat = () => {};
let unsubcribeFromAuth = () => {};

export default {
    name: 'PublicChat',
    components: { AppH1, },
    // data permite definir el "state" del componente.
    // Entendemos por "state" los valores propios del componente que
    // pueden variar durante la vida del mismo. Los valores del state
    // se pueden acceder en el <template>, y son reactivas.
    // Ser "reactiva" implica que Vue refresca el componente cuando
    // algún valor del "state" cambia.
    // La propiedad data debe llevar una función que retorne un
    // objeto con el state inicial.
    // data: function() {
    //     return {}
    // },
    // data: () => {
    //     return {}
    // },
    data() {
        return {
            messages: [],

            newMessage: {
                content: '',
            },

            user: {
                id: null,
                email: null,
                display_name: null,
                bio: null,
                career: null,
            },
        }
    },
    methods: {
        async handleSubmit() {
            await sendNewGlobalChatMessage({
                sender_id: this.user.id,
                email: this.user.email,
                content: this.newMessage.content,
            });

            // Limpiamos el camop del contenido.
            this.newMessage.content = "";
        },
        formatDate(dateString) {
            const date = new Date(dateString);

            const dateFormatter = new Intl.DateTimeFormat('es-AR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
            });
            
            return dateFormatter.format(date).replace(',', '');
        },
    },
    async mounted() {
        // TODO: Manejar el error.
        unsubcribeFromAuth = subscribeToAuthStateChanges(newUserState => this.user = newUserState);

        // Nos suscribimos para recibir los nuevos mensajes.
        unsubcribeFromChat = subscribeToNewGlobalChatMessages(async newMessage => {
            this.messages.push(newMessage);

            // Movemos el scroll.
            await this.$nextTick();

            this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
        });

        // Guardamos los mensajes de chat.
        this.messages = await fetchLastGlobalChatMessages();

        /*
            # nextTick
            Una de las tareas más demandantes que existen en JS es hacer el "repaint"
            de la pantalla.
            "Repaint" es el proceso de actualizar la vista de la pantalla para acomodarse
            al DOM y el CSS.
            Por esta razón, cuando Vue recibe nuevos valores en su state que provocan un
            cambio en el DOM, no los aplica instantaneamente.
            Sino que espera unos momentos a ver si no recibe nuevos cambios en el state,
            con el objetivo de poder aplicar múltiples cambios de una sola vez.

            Normalmente, esto es transparente para nosotros. Podemos decir que es 
            performance gratis.
            Pero hay ocasiones donde necesitamos expresamente esperar a que el DOM se
            actualice para poder realizar alguna acción.
            Por ejemplo, mover el scroll de un contenedor de elementos.

            Cuando recibimos los nuevos mensajes, por lo hablado, Vue no actualiza
            inmediatamente el DOM. Por eso, cuando tratamos de modificar el scroll no
            funciona. El elemento está todavía vacío (Vue no le agregó el contenido).
            Necesitamos esperar a que Vue agregue esos elementos.
            Ahí es donde entra nextTick().

            La función nextTick() retorna una Promise que se resuelve cuando Vue 
            actualiza el DOM.
        */
        await this.$nextTick();

        // Desde la propiedad especial $refs tenemos acceso a los elementos del DOM
        // que tienen un ref asignado.
        // console.log("El elemento contenedor del chat es: ", this.$refs.chatContainer);
        this.$refs.chatContainer.scrollTop = this.$refs.chatContainer.scrollHeight;
    },
    unmounted() {
        unsubcribeFromChat();
        unsubcribeFromAuth();
    }
}
</script>

<template>
    <AppH1>Chat general</AppH1>

    <div class="flex gap-4">
        <!-- 
        # "Template refs"
        Vue tiene un mecanismo que se llama "template refs", que sirve para poder obtener
        la referencia a un elemento del DOM del template.
        Para usarlo, primero tenemos que agregar un atributo "ref" con un valor 
        identificatorio en el elemento que queremos obtener.
        Luego, podemos usarlo desde nuestra etiqueta <script>.
        -->
        <section ref="chatContainer" class="overflow-y-auto w-9/12 h-100 p-4 border border-gray-300 rounded">
            <h2 class="sr-only">Lista de mensajes</h2>
            <ol class="flex flex-col items-start gap-4">
                <li
                    v-for="message in messages"
                    :key="message.id"
                    class="p-3 rounded bg-gray-100"
                >
                    <div class="mb-1">
                        <RouterLink 
                            class="font-bold text-blue-700"
                            :to="`/usuario/${message.sender_id}`"
                        >
                            {{ message.email }}
                        </RouterLink> 
                        dijo:
                    </div>
                    <div class="mb-1">{{ message.content }}</div>
                    <div class="text-sm text-gray-700">{{ formatDate(message.created_at) }}</div>
                </li>
            </ol>
        </section>
        <section class="w-3/12">
            <h2 class="mb-4 text-xl">Enviar un mensaje</h2>
            
            <form
                action="#"
                @submit.prevent="handleSubmit"
            >
                <div class="mb-4">
                    <span class="block mb-2">Email</span>
                    {{ user.email }}
                </div>
                <div class="mb-4">
                    <label for="content" class="block mb-2">Mensaje</label>
                    <!-- 
                    v-model crea un "two-way data binding" entre un valor 
                    del state del componente y un control de formulario,
                    como un input, textarea o select.
                    Esto significa que Vue va a mantener sincronizado el
                    valor del state con el del control de form.
                    Si el usuario modifica el campo del formulario, Vue va
                    a actualizar el valor del state.
                    Asimismo, si programáticamente cambiamos el valor del
                    state, Vue actualiza el campo del form.
                    -->
                    <textarea
                        id="content"
                        class="w-full p-2 border border-gray-400 rounded"
                        v-model="newMessage.content"
                    ></textarea>
                </div>
                <button type="submit" class="transition px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 focus:bg-blue-500 text-white">Enviar</button>
            </form>
        </section>
    </div>
</template>