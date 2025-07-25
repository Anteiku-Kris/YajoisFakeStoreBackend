import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY! // clave secreta del proyecto (service_role si es necesario)
);

async function loginAsAdmin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@ejemplo.com',
    password: '123PanYqueso', // Usa la contraseña real aquí
  });

  if (error) {
    console.error('❌ Error al iniciar sesión:', error.message);
    return;
  }

  console.log('✅ Token obtenido:\n');
  console.log(data.session?.access_token);
}

loginAsAdmin();
