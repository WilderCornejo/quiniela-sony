import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── AUTH ──────────────────────────────────────────────
// Acceso por identificación + contraseña (sin email)

export async function registrar(nombre, identificacion, password) {
  // Validaciones de seguridad
  identificacion = String(identificacion).trim()
  nombre = String(nombre).trim()

  if (!/^[0-9]{6,15}$/.test(identificacion)) {
    throw new Error('La identificación debe tener entre 6 y 15 dígitos')
  }
  if (nombre.length < 2 || nombre.length > 40) {
    throw new Error('El nombre debe tener entre 2 y 40 caracteres')
  }
  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres')
  }

  // Verificar que la identificación no exista ya
  const { data: existe } = await supabase
    .from('participantes')
    .select('id')
    .eq('identificacion', identificacion)
    .maybeSingle()
  if (existe) throw new Error('Esa identificación ya está registrada')

  const { hash, salt } = await hashPassword(password)
  const { data, error } = await supabase
    .from('participantes')
    .insert([{
      nombre,
      identificacion,
      password_hash: hash + ':' + salt,
      email: null,
    }])
    .select('id, nombre, identificacion, es_admin')
    .single()
  if (error) throw error
  return data
}

export async function login(identificacion, password) {
  identificacion = String(identificacion).trim()

  // Control de intentos fallidos (anti fuerza bruta)
  const intentos = JSON.parse(sessionStorage.getItem('loginIntentos') || '{"n":0,"t":0}')
  const ahora = Date.now()
  if (intentos.n >= 5 && (ahora - intentos.t) < 60000) {
    throw new Error('Demasiados intentos. Espera 1 minuto.')
  }

  const { data, error } = await supabase
    .from('participantes')
    .select('id, nombre, identificacion, es_admin, password_hash')
    .eq('identificacion', identificacion)
    .maybeSingle()

  if (error || !data) {
    registrarIntentoFallido()
    throw new Error('Identificación o contraseña incorrectos')
  }

  const ok = await verifyPassword(password, data.password_hash)
  if (!ok) {
    registrarIntentoFallido()
    throw new Error('Identificación o contraseña incorrectos')
  }

  // Login exitoso: limpiar intentos y NO guardar el hash en sesión
  sessionStorage.removeItem('loginIntentos')
  const usuarioSeguro = {
    id: data.id,
    nombre: data.nombre,
    identificacion: data.identificacion,
    es_admin: data.es_admin,
  }
  sessionStorage.setItem('user', JSON.stringify(usuarioSeguro))
  return usuarioSeguro
}

function registrarIntentoFallido() {
  const intentos = JSON.parse(sessionStorage.getItem('loginIntentos') || '{"n":0,"t":0}')
  intentos.n += 1
  intentos.t = Date.now()
  sessionStorage.setItem('loginIntentos', JSON.stringify(intentos))
}

export function getUser() {
  const u = sessionStorage.getItem('user')
  return u ? JSON.parse(u) : null
}

export function logout() {
  sessionStorage.removeItem('user')
}

// Verifica la clave de admin contra la base de datos (no expuesta en el navegador)
export async function verificarAdmin(clave) {
  const { data } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('clave', 'admin_secret')
    .maybeSingle()
  if (!data) return false
  // Compara el hash de la clave ingresada con el guardado
  const enc = new TextEncoder().encode(String(clave))
  const buf = await crypto.subtle.digest('SHA-256', enc)
  const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hash === data.valor
}

// ── CONFIG ────────────────────────────────────────────
export async function getConfig(clave) {
  const { data } = await supabase.from('configuracion').select('valor').eq('clave', clave).maybeSingle()
  return data?.valor
}

export async function setConfig(clave, valor) {
  await supabase.from('configuracion').upsert({ clave, valor }, { onConflict: 'clave' })
}

// ── FECHAS DE PARTIDOS (editables por el admin) ──────
export async function getFechasGrupos(fechasDefault) {
  const { data } = await supabase
    .from('configuracion').select('valor').eq('clave', 'fechas_grupos').maybeSingle()
  if (data?.valor) {
    try { return JSON.parse(data.valor) } catch { return fechasDefault }
  }
  return fechasDefault
}

export async function guardarFechasGrupos(fechas) {
  await supabase.from('configuracion').upsert(
    { clave: 'fechas_grupos', valor: JSON.stringify(fechas) },
    { onConflict: 'clave' }
  )
}

// ── PREDICCIONES GRUPOS ───────────────────────────────
export async function guardarPrediccionGrupo(participante_id, grupo, partido_idx, equipo1, equipo2, goles1, goles2) {
  const { error } = await supabase.from('predicciones_grupos').upsert({
    participante_id, grupo, partido_idx, equipo1, equipo2,
    goles1: parseInt(goles1), goles2: parseInt(goles2),
    actualizado_en: new Date().toISOString()
  }, { onConflict: 'participante_id,grupo,partido_idx' })
  if (error) throw error
}

export async function getPrediccionesGrupos(participante_id) {
  const { data } = await supabase.from('predicciones_grupos').select('*').eq('participante_id', participante_id)
  return data || []
}

// ── PREDICCIONES KO ───────────────────────────────────
export async function guardarPrediccionKO(participante_id, ronda, partido_idx, equipo1, equipo2, goles1, goles2) {
  const { error } = await supabase.from('predicciones_ko').upsert({
    participante_id, ronda, partido_idx, equipo1, equipo2,
    goles1: parseInt(goles1) || 0, goles2: parseInt(goles2) || 0,
    actualizado_en: new Date().toISOString()
  }, { onConflict: 'participante_id,ronda,partido_idx' })
  if (error) throw error
}

export async function getPrediccionesKO(participante_id) {
  const { data } = await supabase.from('predicciones_ko').select('*').eq('participante_id', participante_id)
  return data || []
}

// ── PREDICCIONES ESPECIALES ───────────────────────────
export async function guardarEspeciales(participante_id, campeon, subcampeon, goleador) {
  const { error } = await supabase.from('predicciones_especiales').upsert({
    participante_id, campeon, subcampeon, goleador,
    actualizado_en: new Date().toISOString()
  }, { onConflict: 'participante_id' })
  if (error) throw error
}

export async function getEspeciales(participante_id) {
  const { data } = await supabase.from('predicciones_especiales').select('*').eq('participante_id', participante_id).single()
  return data
}

// ── RESULTADOS (admin) ────────────────────────────────
export async function guardarResultadoGrupo(grupo, partido_idx, equipo1, equipo2, goles1, goles2) {
  const { error } = await supabase.from('resultados_grupos').upsert({
    grupo, partido_idx, equipo1, equipo2,
    goles1: parseInt(goles1), goles2: parseInt(goles2), jugado: true
  }, { onConflict: 'grupo,partido_idx' })
  if (error) throw error
}

export async function getResultadosGrupos() {
  const { data } = await supabase.from('resultados_grupos').select('*').eq('jugado', true)
  return data || []
}

export async function guardarResultadoKO(ronda, partido_idx, equipo1, equipo2, goles1, goles2, jugado = false) {
  const { error } = await supabase.from('resultados_ko').upsert({
    ronda, partido_idx, equipo1, equipo2,
    goles1: parseInt(goles1) || 0, goles2: parseInt(goles2) || 0, jugado: !!jugado
  }, { onConflict: 'ronda,partido_idx' })
  if (error) throw error
}

// Trae TODOS los partidos de eliminatoria definidos por el admin (con o sin jugar)
// para mostrarle al usuario los enfrentamientos y que prediga el marcador.
export async function getResultadosKO() {
  const { data } = await supabase.from('resultados_ko').select('*')
  return data || []
}

export async function guardarResultadosEspeciales(campeon, subcampeon, goleador) {
  await supabase.from('resultados_especiales').upsert({ id: '1', campeon, subcampeon, goleador, torneo_terminado: true })
}

export async function getResultadosEspeciales() {
  const { data } = await supabase.from('resultados_especiales').select('*').limit(1).single()
  return data
}

// ── RANKING ───────────────────────────────────────────
export async function getRanking() {
  const { data } = await supabase
    .from('puntos')
    .select('*, participantes(nombre)')
    .order('total', { ascending: false })
  return data || []
}

export async function calcularYGuardarPuntos(participante_id) {
  const [predGrupos, predKO, predEsp, resGrupos, resEsp] = await Promise.all([
    getPrediccionesGrupos(participante_id),
    getPrediccionesKO(participante_id),
    getEspeciales(participante_id),
    getResultadosGrupos(),
    getResultadosEspeciales()
  ])

  let pts_grupos = 0
  for (const pred of predGrupos) {
    const real = resGrupos.find(r => r.grupo === pred.grupo && r.partido_idx === pred.partido_idx)
    if (!real) continue
    if (pred.goles1 === real.goles1 && pred.goles2 === real.goles2) {
      pts_grupos += 3 // resultado exacto
    } else {
      const predGanador = pred.goles1 > pred.goles2 ? 1 : pred.goles2 > pred.goles1 ? 2 : 0
      const realGanador = real.goles1 > real.goles2 ? 1 : real.goles2 > real.goles1 ? 2 : 0
      if (predGanador === realGanador) pts_grupos += 1 // solo ganador
    }
  }

  let pts_ko = 0
  const { data: resKO } = await supabase.from('resultados_ko').select('*').eq('jugado', true)
  for (const pred of predKO) {
    const real = (resKO || []).find(r => r.ronda === pred.ronda && r.partido_idx === pred.partido_idx)
    if (!real) continue
    // Puntaje por marcador (igual que en grupos): exacto = 3, solo el resultado = 1, lo demas = 0
    if (pred.goles1 === real.goles1 && pred.goles2 === real.goles2) {
      pts_ko += 3 // marcador exacto
    } else {
      const predGanador = pred.goles1 > pred.goles2 ? 1 : pred.goles2 > pred.goles1 ? 2 : 0
      const realGanador = real.goles1 > real.goles2 ? 1 : real.goles2 > real.goles1 ? 2 : 0
      if (predGanador === realGanador) pts_ko += 1 // solo el resultado (ganador o empate)
    }
  }

  let pts_especiales = 0
  if (resEsp) {
    if (predEsp?.campeon === resEsp.campeon) pts_especiales += 10
    if (predEsp?.subcampeon === resEsp.subcampeon) pts_especiales += 5
    if (predEsp?.goleador === resEsp.goleador) pts_especiales += 5
  }

  const total = pts_grupos + pts_ko + pts_especiales
  await supabase.from('puntos').upsert({
    participante_id, pts_grupos, pts_ko, pts_especiales, total,
    actualizado_en: new Date().toISOString()
  }, { onConflict: 'participante_id' })

  return { pts_grupos, pts_ko, pts_especiales, total }
}

// ── UTILS — Hash de contraseña con salt (PBKDF2) ──────
async function hashPassword(password, saltExistente = null) {
  // Genera o reutiliza un salt
  let salt = saltExistente
  if (!salt) {
    const saltBytes = crypto.getRandomValues(new Uint8Array(16))
    salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Deriva la clave con PBKDF2 (100.000 iteraciones — resistente a fuerza bruta)
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  )
  const hash = Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('')
  return { hash, salt }
}

async function verifyPassword(password, hashGuardado) {
  // hashGuardado tiene formato "hash:salt"
  const partes = String(hashGuardado).split(':')
  if (partes.length === 2) {
    // Formato nuevo con salt
    const [hashOriginal, salt] = partes
    const { hash } = await hashPassword(password, salt)
    return hash === hashOriginal
  } else {
    // Formato viejo (SHA-256 sin salt) — compatibilidad con cuentas antiguas
    const enc = new TextEncoder().encode(password)
    const buf = await crypto.subtle.digest('SHA-256', enc)
    const viejo = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
    return viejo === hashGuardado
  }
}
