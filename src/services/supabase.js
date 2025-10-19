// Este archivo va a inicializar Supabase y exportar el cliente.
// En este contexto, un servicio es un script que ofrece funciones
// o clases para utilizar alguna funcionalidad.
import { createClient } from '@supabase/supabase-js';

// Definimos las claves.
const SUPABASE_URL = 'https://hiaajtbqutdjnhmznqjw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7wcxRReMdB5n5fcpNWWAZQ_Frg-rl0s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);