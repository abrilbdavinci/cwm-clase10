// Servicio que ofrece las funciones para interactuar con el chat global.
import { supabase } from "./supabase";

export async function sendNewGlobalChatMessage({ email, content, sender_id }) {
    // Insertamos un nuevo registro en la tabla de chats.
    const { data, error } = await supabase
        .from('global_chat_messages')
        .insert({
            sender_id,
            email,
            content,
        });
}

export async function fetchLastGlobalChatMessages() {
    // Vamos a traer los mensajes de nuestra base de Supabase.
    // Para todas las interacciones con Supabase vamos a usar el
    // cliente de Supabase que exportamos en [services/supabase.js]
    // El cliente de Supabase tiene métodos para itneractuar con
    // cada uno de los servicios.
    // Para interactuar con una tabla, usamos el método from(),
    // que recibe como argumento el nombre de la tabla.
    // De ahí, tenemos métodos para las distintas acciones de
    // SQL.
    // Por ejemplo, el método .select() ejecuta un SELECT.
    // El método .select(), al igual que casi todos los métodos de
    // Supabase, retorna un objeto con las claves "data" y "error".
    // En "data" figura la info que se obtiene, y en "error" el
    // error, en caso de que alguno haya ocurrido.
    // Importante: Presente especial atención al "await".
    // Podríamos decir que es el "await" el que ejecuta el query.
    const { data, error } = await supabase
        .from('global_chat_messages')
        .select();

    if(error) {
        throw new Error(error.message);
    }

    return data;
}

export function subscribeToNewGlobalChatMessages(callback) {
    // Pasa usar la API de Realtime, tenemos que crear un "canal"
    // de comunicación.
    // Para crearun canal, usamos el método channel, y le pasamos
    // un nombre. Pueden poner el que quieran, excepto "realtime".
    const chatChannel = supabase.channel('global_chat');
    
    // Una vez definido el canal, tenemos que indicar qué eventos
    // queremos escuchar.
    // Usamos el método on(), que recibe 3 parámetros.
    // 1. El tipo de evento de Realtime.
    // 2. El evento que queremos escuchar. Esto es un objeto.
    // 3. El callback que queremos ejecutar para el evento.
    chatChannel.on(
        'postgres_changes',
        {
            // Pueden ser '*', 'INSERT', 'UPDATE' o 'DELETE'.
            event: 'INSERT',
            // Aclaramos qué tabla nos interesa.
            table: 'global_chat_messages',
            // En qué schema está.
            schema: 'public',
        },
        // El callback recibe como parámetro el "payload", que es
        // la info relacionada al evento.
        payload => {
            // Llamamos a la función que nos pasaron.
            callback(payload.new);
        }
    );

    // Finalmente, tenemos que pedir suscribirnos al canal.
    chatChannel.subscribe();

    return () => {
        chatChannel.unsubscribe();
    }
}