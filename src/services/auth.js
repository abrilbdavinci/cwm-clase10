// Servicio de autenticación.
import { supabase } from "./supabase";
import { createUserProfile, fetchUserProfileById, updateUserProfile } from "./user-profiles";

/*
# Manejando el estado de autenticación con el patrón de diseño Observer

https://refactoring.guru/design-patterns/observer

El patrón Observer nos permite modelar una relación de uno a muchos entre elementos
del sistema.

Busca resolver el escenario donde tenemos múltiples elementos (conocidos como 
"observers") que están interesados en ser inforamados de los cambios ocurridos en
otro elemento (conocido como el "subject").

En nuestro caso particular, nos va a servir, por lo pronto, para que cualquier
componente o archivo de nuestro sistema pueda enterarse de los cambios del estado de
autenticación, y automáticamente reciba los nuevos datos del usuario.

En este patrón, casi todo el trabajo lo hace el "subject". Es el "subject" el que 
necesita llevar un registro de los "observers" que se "suscriben", así como es quien 
tiene que informar a esos "observers" cada vez que cambie el estado.

"Suscribir" es como se suele llamar al proceso de que un "observer" pida ser inforamdo
de los cambios que ocurren. Aunque lo pueden ver con otros nombres también. Por ejemplo,
attach (adjuntar), listen (escuchar) y watch (observar).

En nuestro caso, los "observers" van a ser simplemente callbacks (funciones).


Checklist para implementar Observer:
- Tener el "subject". Nosotros vamos a usar una variable "user".
- Tener una lista de "observers". Lo vamos a resolver usando un array.
- Tener una función para poder "suscribir" un "observer" a los cambios.
- Tener una función para poder "notificar" a los "observers" de los cambios ocurridos.
*/
let user = {
    id: null,
    email: null,
    display_name: null,
    bio: null,
    career: null,
}
let observers = [];

fetchCurrentAuthUserData();

async function fetchCurrentAuthUserData() {
    // Tratamos de obtener los datos del usuario actualmente autenticado.
    const { data, error } = await supabase.auth.getUser();

    if(error || !data) {
        console.warn('No hay un usuario autenticado.');
        return;
    }

    user = {
        id: data.user.id,
        email: data.user.email,
    }
    notifyAll();

    fetchFullProfile();
}

async function fetchFullProfile() {
    try {
        const profile = await fetchUserProfileById(user.id);
        user = {
            ...user,
            ...profile,
        }
        notifyAll();
    } catch (error) {
        // ...        
    }
}

/**
 * 
 * @param {String} email 
 * @param {String} password 
 */
export async function register(email, password) {
    // Para la autenticación de Supabase, usamos la propiedad "auth" del cliente de 
    // Supabase.
    const { data, error } = await supabase
        .auth
        // signUp() registra un usuario.
        // Recibe 1 propiedad:
        // 1. Objeto con las credenciales (email y password) del registro.
        //  Adicionalmente, pueden pasar un objeto "options" de configuración, 
        //  para poder indicar, por ejemplo, a dónde redireccionar al usuario cuando 
        //  confirme el email.
        .signUp({
            email,
            password,
        });

    if(error) {
        console.error('[auth.js register] Error al crear el usuario: ', error);
        throw new Error(error.message);
    }

    console.log("[auth.js register] Usuario registrado con éxito: ", data);
    // Cada vez que cambien los datos del usuario autenticado (por ejemplo, cuando
    // inicie sesión, cierre sesión o edite su perfil) tenemos que ajustar los valores
    // de la variable "user", y notificar a todos los observers.
    user = {
        id: data.user.id,
        email: data.user.email,
    }
    notifyAll();

    // Creamos el perfil en la tabla de user_profiles.
    await createUserProfile({
        id: data.user.id,
        email: data.user.email,
    });
}

/**
 * 
 * @param {String} email 
 * @param {String} password 
 */
export async function login(email, password) {
    const { data, error } = await supabase
        .auth
        .signInWithPassword({
            email,
            password,
        });
    
    if(error) {
        console.error("[auth.js login] Error al iniciar sesión con el usuario. ", error);
        throw new Error(error.message);
    }

    console.log("Sesión iniciada correctamente: ", data);

    user = {
        id: data.user.id,
        email: data.user.email,
    }
    notifyAll();

    fetchFullProfile();
}

export async function logout() {
    supabase.auth.signOut();

    user = {
        id: null,
        email: null,
    }
    notifyAll();
}

export async function updateAuthUser(data) {
    try {
        await updateUserProfile(user.id, data);

        user = {
            ...user,
            ...data,
        }
        notifyAll();
    } catch (error) {
        // ...
    }
}

/*----------------------------------------------------------
| Implementación de las funciones del Observer
+-----------------------------------------------------------*/
/**
 * 
 * @param {Function} callback 
 */
export function subscribeToAuthStateChanges(callback) {
    // Agregamos el callback al "stack" de "observers".
    // Además, para que el observer pueda recibir inmediatamente los datos actuales
    // del estado de autenticación, lo notificamos.
    observers.push(callback);

    // console.log("Observer agregado. El stack actual es: ", observers);

    notify(callback);

    // Siempre que creamos funciones para una suscripción es necesario ofrecer algún mecanismo para
    // cancelar esa suscripción. De lo contrario, podemos sufrir lo que llamamos un "memory leak"
    // (filtración de memoria) y derroche de recursos del CPU.
    // En este caso, una forma simple de resolverlo es haciendo que esta función de suscripción
    // retorna una *nueva* función que al ejecutarse cancele la suscripción. Es decir, remueva
    // el observer que acabamos de agregar.
    return () => {
        observers = observers.filter(obs => obs !== callback);
        // console.log('Observer removido. El stack actual es: ', observers);
        
    }
}

/**
 * Notifica al observer pasándole una copia de los datos del usuario.
 * 
 * @param {Function} callback 
 */
function notify(callback) {
    callback({...user}); // Noten que es una COPIA de los datos.
}

/**
 * Notifica a todos los observers.
 */
function notifyAll() {
    observers.forEach(callback => notify(callback));
    // observers.forEach(notify); // Es lo mismo a lo anterior.
}