import './src/styles.css'
import {
  supabase, registrar, login, getUser, logout, verificarAdmin,
  guardarPrediccionGrupo, getPrediccionesGrupos,
  guardarPrediccionKO, getPrediccionesKO,
  guardarEspeciales, getEspeciales,
  getRanking, calcularYGuardarPuntos,
  getConfig, setConfig,
  getFechasGrupos, guardarFechasGrupos,
  guardarResultadoGrupo, getResultadosGrupos,
  guardarResultadoKO, guardarResultadosEspeciales, getResultadosEspeciales
} from './src/lib/supabase.js'
import { GRUPOS, getPartidosGrupo, KO_ROUNDS, SELECCIONES, GOLEADORES, GOLEADORES_POR_PAIS, flagUrl, FECHAS_GRUPOS_DEFAULT } from './src/lib/data.js'
import { montarBalon3D } from './src/lib/balon3d.js'
import { montarTrofeo, montarMedalla, montarMiniBalon } from './src/lib/iconos3d.js'
import { textoSedes } from './src/lib/sedes.js'
import { partidoBloqueado, eliminacionBloqueada, textoCierre, formatoFechaPartido } from './src/lib/bloqueos.js'

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  CONFIGURACIÃ“N DEL GRUPO  (cambiar al clonar la app)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const CONDOMINIO = import.meta.env.VITE_NOMBRE_SEDE || 'Condominio Calzadas Coloniales'
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let user = null
let inscripcionesAbiertas = true
let torneoIniciado = false
let prediccionesGrupos = []
let prediccionesKO = []
let especiales = null
let fechasGrupos = {}

// â”€â”€ INIT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function init() {
  user = getUser()
  inscripcionesAbiertas = (await getConfig('inscripciones_abiertas')) === 'true'
  torneoIniciado = (await getConfig('torneo_iniciado')) === 'true'
  fechasGrupos = await getFechasGrupos(FECHAS_GRUPOS_DEFAULT)

  if (user) {
    await cargarPredicciones()
    renderApp()
  } else {
    renderAuth()
  }
}

async function cargarPredicciones() {
  if (!user) return
  prediccionesGrupos = await getPrediccionesGrupos(user.id)
  prediccionesKO = await getPrediccionesKO(user.id)
  especiales = await getEspeciales(user.id)
}

// â”€â”€ TOAST â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function toast(msg, tipo = 'ok') {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.className = 'toast' + (tipo === 'err' ? ' err' : '')
  el.classList.add('show')
  clearTimeout(el._t)
  el._t = setTimeout(() => el.classList.remove('show'), 2800)
}

// â”€â”€ AUTH PAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderAuth() {
  document.getElementById('app').innerHTML = `
    <div class="hero">
      <div class="hero-logos-row"><img src="./teletica-logo.png" class="hero-side-logo logo-teletica" alt="Teletica"><div id="ball-canvas" class="ball-canvas"></div><img src="./qbt-logo.webp" class="hero-side-logo logo-qbt" alt="QBT"></div>
      <div class="hero-badge">FIFA World Cup 2026</div>
      <h1>QUINIELA<br><em>MUNDIAL</em> 2026</h1>
      <div class="hero-sub">${textoSedes()}</div>
      <div class="condo-badge">
        <i class="ti ti-building-community"></i> ${CONDOMINIO}
      </div>
    </div>
    <div style="max-width:420px;margin:40px auto;padding:0 16px;">
      <div class="card fade-up">
        <div class="card-title"><i class="ti ti-user-circle"></i>Acceso al torneo</div>

        <div id="auth-tabs" style="display:flex;gap:0;margin-bottom:20px;border:1px solid var(--border);border-radius:6px;overflow:hidden;">
          <button id="btn-login-tab" onclick="switchAuthTab('login')"
            style="flex:1;padding:10px;font-family:'Orbitron',monospace;font-size:9px;letter-spacing:1px;cursor:pointer;border:none;background:var(--neon-dim);color:var(--neon);text-transform:uppercase;">
            Iniciar SesiÃ³n
          </button>
          <button id="btn-reg-tab" onclick="switchAuthTab('registro')"
            style="flex:1;padding:10px;font-family:'Orbitron',monospace;font-size:9px;letter-spacing:1px;cursor:pointer;border:none;background:transparent;color:var(--text-dim);text-transform:uppercase;border-left:1px solid var(--border);">
            Registrarse
          </button>
        </div>

        <div id="form-login">
          <div class="form-group">
            <label class="form-label">NÃºmero de identificaciÃ³n</label>
            <input class="input" id="l-id" type="text" inputmode="numeric" placeholder="Ej: 0303010339" autocomplete="off" />
          </div>
          <div class="form-group">
            <label class="form-label">Filial</label>
            <div style="display:flex;gap:8px;">
              <select class="select" id="l-filial-letra" style="flex:0 0 90px;">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
                <option value="H">H</option>
              </select>
              <input class="input" id="l-filial-num" type="text" inputmode="numeric"
                placeholder="NÂ° de filial (ej: 18)" maxlength="4" autocomplete="off" style="flex:1;" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">ContraseÃ±a</label>
            <input class="input" id="l-pass" type="password" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
          </div>
          <button class="btn full" onclick="doLogin()">
            <i class="ti ti-login"></i> Entrar al torneo
          </button>
        </div>

        <div id="form-registro" style="display:none;">
          ${!inscripcionesAbiertas ? `<div style="text-align:center;padding:20px;color:var(--warn);font-family:'Orbitron',monospace;font-size:11px;letter-spacing:1px;">âš  INSCRIPCIONES CERRADAS</div>` : `
          <div class="form-group">
            <label class="form-label">Nombre completo</label>
            <input class="input" id="r-nombre" type="text" placeholder="Tu nombre" maxlength="40" />
          </div>
          <div class="form-group">
            <label class="form-label">NÃºmero de identificaciÃ³n</label>
            <input class="input" id="r-id" type="text" inputmode="numeric" placeholder="Ej: 0303010339" autocomplete="off" />
            <span class="form-hint">Escribe tu cÃ©dula completa, solo nÃºmeros, sin guiones ni espacios.</span>
          </div>
          <div class="form-group">
            <label class="form-label">Filial (casa / apartamento)</label>
            <div style="display:flex;gap:8px;">
              <select class="select" id="r-filial-letra" style="flex:0 0 90px;">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
                <option value="G">G</option>
                <option value="H">H</option>
              </select>
              <input class="input" id="r-filial-num" type="text" inputmode="numeric"
                placeholder="NÂ° de filial (ej: 18)" maxlength="4" autocomplete="off" style="flex:1;" />
            </div>
            <span class="form-hint">Elige la letra y escribe solo el nÃºmero. Ejemplo: A + 18</span>
          </div>
          <div class="form-group">
            <label class="form-label">ContraseÃ±a</label>
            <input class="input" id="r-pass" type="password" placeholder="MÃ­nimo 8 caracteres" />
            <span class="form-hint">MÃ­nimo 8 caracteres. Combina letras y nÃºmeros.</span>
          </div>
          <button class="btn full success" onclick="doRegistro()">
            <i class="ti ti-user-plus"></i> Inscribirme a la quiniela
          </button>`}
        </div>
      </div>
      <p style="text-align:center;font-size:12px;color:var(--text-dim);margin-top:12px;">
        Â¿Eres admin? <span style="color:var(--neon);cursor:pointer;" onclick="showAdminLogin()">Acceso administrador</span>
      </p>
    </div>
    <div class="toast" id="toast"></div>
  `
  window.switchAuthTab = (tab) => {
    document.getElementById('form-login').style.display = tab === 'login' ? 'block' : 'none'
    document.getElementById('form-registro').style.display = tab === 'registro' ? 'block' : 'none'
    document.getElementById('btn-login-tab').style.background = tab === 'login' ? 'var(--neon-dim)' : 'transparent'
    document.getElementById('btn-login-tab').style.color = tab === 'login' ? 'var(--neon)' : 'var(--text-dim)'
    document.getElementById('btn-reg-tab').style.background = tab === 'registro' ? 'var(--neon-dim)' : 'transparent'
    document.getElementById('btn-reg-tab').style.color = tab === 'registro' ? 'var(--neon)' : 'var(--text-dim)'
  }

  setTimeout(() => montarBalon3D('ball-canvas'), 50)
}

window.doLogin = async () => {
  const id = document.getElementById('l-id')?.value.trim()
  const letra = document.getElementById('l-filial-letra')?.value
  const num = document.getElementById('l-filial-num')?.value.trim()
  const pass = document.getElementById('l-pass')?.value
  if (!id || !num || !pass) { toast('Completa todos los campos', 'err'); return }
  const filial = letra + num
  try {
    user = await login(id, filial, pass)
    await cargarPredicciones()
    renderApp()
  } catch (e) { toast(e.message, 'err') }
}

window.doRegistro = async () => {
  const nombre = document.getElementById('r-nombre')?.value.trim()
  const id = document.getElementById('r-id')?.value.trim()
  const letra = document.getElementById('r-filial-letra')?.value
  const num = document.getElementById('r-filial-num')?.value.trim()
  const pass = document.getElementById('r-pass')?.value
  if (!nombre || !id || !num || !pass) { toast('Completa todos los campos', 'err'); return }
  const filial = letra + num
  try {
    user = await registrar(nombre, id, filial, pass)
    sessionStorage.setItem('user', JSON.stringify(user))
    await cargarPredicciones()
    renderApp()
    toast('Â¡Bienvenido, ' + nombre + '!')
  } catch (e) { toast('Error: ' + e.message, 'err') }
}

window.showAdminLogin = async () => {
  const secret = prompt('Clave de administrador:')
  if (!secret) return
  try {
    const ok = await verificarAdmin(secret)
    if (ok) {
      sessionStorage.setItem('adminMode', '1')
      renderAdmin()
      showPage('admin')
    } else {
      toast('Clave incorrecta', 'err')
    }
  } catch (e) {
    toast('Error verificando', 'err')
  }
}

// â”€â”€ MAIN APP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderApp() {
  const tabs = [
    { id: 'grupos', icon: 'ti-layout-grid', label: 'Grupos' },
    { id: 'eliminacion', icon: 'ti-tournament', label: 'EliminaciÃ³n' },
    { id: 'especiales', icon: 'ti-star', label: 'Especiales' },
    { id: 'ranking', icon: 'ti-podium', label: 'Ranking' },
  ]
  if (user?.es_admin || sessionStorage.getItem('adminMode')) {
    tabs.push({ id: 'admin', icon: 'ti-settings', label: 'Admin' })
  }

  document.getElementById('app').innerHTML = `
    <div class="hero">
      <div class="hero-logos-row"><img src="./teletica-logo.png" class="hero-side-logo logo-teletica" alt="Teletica"><div id="ball-canvas" class="ball-canvas"></div><img src="./qbt-logo.webp" class="hero-side-logo logo-qbt" alt="QBT"></div>
      <div class="hero-badge">FIFA World Cup 2026</div>
      <h1>QUINIELA<br><em>MUNDIAL</em> 2026</h1>
      <div class="hero-sub">${textoSedes()}</div>
      <div class="condo-badge">
        <i class="ti ti-building-community"></i> ${CONDOMINIO}
      </div>
      <div class="user-chip" style="margin-top:10px;">
        <i class="ti ti-user" style="font-size:14px;"></i>
        ${user.nombre} <span style="opacity:0.6;">Â· Filial ${user.filial}</span>
        <span style="opacity:0.5;margin:0 2px;">|</span>
        <span style="cursor:pointer;font-size:10px;" onclick="doLogout()">Salir</span>
      </div>
    </div>

    <nav class="nav">
      ${tabs.map(t => `
        <div class="nav-tab" id="tab-${t.id}" onclick="showPage('${t.id}')">
          <i class="ti ${t.icon}"></i>${t.label}
        </div>
      `).join('')}
    </nav>

    <div id="page-grupos" class="page active"></div>
    <div id="page-eliminacion" class="page"></div>
    <div id="page-especiales" class="page"></div>
    <div id="page-ranking" class="page"></div>
    ${user?.es_admin || sessionStorage.getItem('adminMode') ? '<div id="page-admin" class="page"></div>' : ''}

    <div class="toast" id="toast"></div>
  `

  window.showPage = (id) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'))
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'))
    document.getElementById('page-' + id)?.classList.add('active')
    document.getElementById('tab-' + id)?.classList.add('active')
    if (id === 'grupos') renderGrupos()
    if (id === 'eliminacion') renderEliminacion()
    if (id === 'especiales') renderEspeciales()
    if (id === 'ranking') renderRanking()
    if (id === 'admin') renderAdmin()
  }

  window.doLogout = () => {
    logout()
    sessionStorage.removeItem('adminMode')
    user = null
    renderAuth()
  }

  renderGrupos()
  document.getElementById('tab-grupos')?.classList.add('active')
  setTimeout(() => montarBalon3D('ball-canvas'), 50)
}

// â”€â”€ GRUPOS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getPredGrupo(grupo, idx) {
  return prediccionesGrupos.find(p => p.grupo === grupo && p.partido_idx === idx)
}

function renderGrupos() {
  const editable = !torneoIniciado
  const cont = document.getElementById('page-grupos')
  if (!cont) return

  const totalPartidos = GRUPOS.reduce((s, g) => s + getPartidosGrupo(g).length, 0)
  const completados = prediccionesGrupos.filter(p => p.goles1 !== null && p.goles2 !== null).length
  const pct = Math.round((completados / totalPartidos) * 100)

  cont.innerHTML = `
    <div class="card fade-up">
      <div class="card-title"><i class="ti ti-layout-grid"></i>Fase de Grupos</div>
      <p style="font-size:13px;color:var(--text-dim);margin-bottom:10px;">
        Ingresa el marcador que predices para cada partido. ${!editable ? '<span style="color:var(--warn);">Solo lectura â€” torneo en curso.</span>' : ''}
      </p>
      <div style="background:rgba(0,255,150,0.07);border:1px solid rgba(0,255,150,0.25);border-radius:6px;padding:8px 12px;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
        <i class="ti ti-device-floppy" style="color:var(--success);font-size:16px;"></i>
        <span style="font-size:12px;color:var(--success);">
          Guardado automÃ¡tico: cada marcador se graba solo. Puedes cerrar y continuar otro dÃ­a.
        </span>
      </div>
      <div id="progreso-txt" style="font-size:12px;color:var(--text-dim);margin-bottom:6px;">
        Completados: ${completados} / ${totalPartidos}
      </div>
      <div class="progress-bar"><div id="progreso-fill" class="progress-fill" style="width:${pct}%"></div></div>
    </div>

    <div class="groups-grid">
      ${GRUPOS.map(g => {
        const partidos = getPartidosGrupo(g)
        return `<div class="group-card fade-up">
          <div class="group-header">
            <span class="group-letter">G${g.letra}</span>
            <span class="group-sub">GRUPO ${g.letra}</span>
          </div>
          ${partidos.map(({ e1, e2, idx }) => {
            const pred = getPredGrupo(g.letra, idx)
            const fechaISO = fechasGrupos[`${g.letra}_${idx}`]
            const bloqueado = partidoBloqueado(fechaISO)
            return `<div class="match-row ${bloqueado ? 'match-locked' : ''}">
              <span class="team">
                <img class="flag" src="${flagUrl(e1.c)}" alt="${e1.n}" loading="lazy" />
                ${e1.n}
              </span>
              <div class="score-box">
                <input class="score-inp" type="number" min="0" max="20" value="${pred?.goles1 ?? ''}" placeholder="-"
                  ${bloqueado ? 'disabled' : ''}
                  onchange="saveGrupo('${g.letra}',${idx},'${e1.n}','${e2.n}',this,'s1')" data-g="${g.letra}" data-i="${idx}" data-f="s1" />
                <span class="score-sep">:</span>
                <input class="score-inp" type="number" min="0" max="20" value="${pred?.goles2 ?? ''}" placeholder="-"
                  ${bloqueado ? 'disabled' : ''}
                  onchange="saveGrupo('${g.letra}',${idx},'${e1.n}','${e2.n}',this,'s2')" data-g="${g.letra}" data-i="${idx}" data-f="s2" />
              </div>
              <span class="team r">
                ${e2.n}
                <img class="flag" src="${flagUrl(e2.c)}" alt="${e2.n}" loading="lazy" />
              </span>
              <div class="match-fecha">
                ${bloqueado
                  ? '<i class="ti ti-lock"></i> Cerrado Â· ' + formatoFechaPartido(fechaISO)
                  : '<i class="ti ti-clock"></i> ' + formatoFechaPartido(fechaISO)}
              </div>
            </div>`
          }).join('')}
        </div>`
      }).join('')}
    </div>
  `

  window.saveGrupo = async (grupo, idx, e1, e2, el, field) => {
    // Seguridad: no permitir guardar si el partido ya empezÃ³
    if (partidoBloqueado(fechasGrupos[`${grupo}_${idx}`])) {
      toast('Este partido ya estÃ¡ cerrado', 'err')
      return
    }
    const row = document.querySelectorAll(`[data-g="${grupo}"][data-i="${idx}"]`)
    const s1 = row[0]?.value
    const s2 = row[1]?.value
    if (s1 === '' || s2 === '') return
    try {
      await guardarPrediccionGrupo(user.id, grupo, idx, e1, e2, parseInt(s1), parseInt(s2))
      prediccionesGrupos = await getPrediccionesGrupos(user.id)
      row.forEach(inp => {
        inp.style.borderColor = 'var(--success)'
        setTimeout(() => inp.style.borderColor = '', 1800)
      })
      toast('âœ“ Marcador guardado')
      actualizarProgresoGrupos()
      await calcularYGuardarPuntos(user.id)
    } catch (e) { toast('Error guardando: ' + e.message, 'err') }
  }
}

function actualizarProgresoGrupos() {
  const totalPartidos = GRUPOS.reduce((s, g) => s + getPartidosGrupo(g).length, 0)
  const completados = prediccionesGrupos.filter(p => p.goles1 !== null && p.goles2 !== null).length
  const pct = Math.round((completados / totalPartidos) * 100)
  const fill = document.getElementById('progreso-fill')
  const txt = document.getElementById('progreso-txt')
  if (fill) fill.style.width = pct + '%'
  if (txt) txt.textContent = `Completados: ${completados} / ${totalPartidos}`
}

// â”€â”€ ELIMINACIÃ“N â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getPredKO(ronda, idx) {
  return prediccionesKO.find(p => p.ronda === ronda && p.partido_idx === idx)
}

function renderEliminacion() {
  const cont = document.getElementById('page-eliminacion')
  if (!cont) return

  const bloqueado = eliminacionBloqueada(fechasGrupos)
  const editable = !bloqueado

  cont.innerHTML = `
    <div class="card fade-up">
      <div class="card-title"><i class="ti ti-tournament"></i>EliminaciÃ³n Directa</div>
      ${bloqueado
        ? `<div class="aviso-bloqueo">
             <i class="ti ti-lock"></i>
             Esta fase ya estÃ¡ cerrada. Se cerrÃ³ al terminar la primera ronda de grupos.
           </div>`
        : `<p style="font-size:13px;color:var(--text-dim);">
             Cada partido muestra su nÃºmero oficial y de dÃ³nde vienen los equipos.
             Escribe tu predicciÃ³n del equipo y el marcador.
           </p>
           <div class="aviso-cierre">
             <i class="ti ti-clock"></i>
             Puedes llenar esta fase hasta: <strong>${textoCierre(fechasGrupos)}</strong>
           </div>`}
    </div>

    ${KO_ROUNDS.map(ronda => `
      <div class="ko-section fade-up">
        <div class="ko-label">
          <i class="ti ${ronda.icon}"></i>${ronda.title}
          <span style="font-size:10px;color:var(--neon);margin-left:auto;">${ronda.pts} pts por acierto</span>
        </div>
        <div class="ko-grid">
          ${ronda.matches.map((m, idx) => {
            const pred = getPredKO(ronda.id, idx)
            return `<div class="ko-match">
              <div class="ko-match-head">
                <span class="ko-num">#${m.num}</span> ${ronda.title}
              </div>
              <div class="ko-row">
                <span class="ko-source">${m.l1}</span>
                <input class="input ko-team-inp"
                  type="text" placeholder="Tu predicciÃ³n" value="${pred?.equipo1 || ''}"
                  onchange="saveKO('${ronda.id}',${idx},this,'t1')" ${!editable ? 'disabled' : ''} />
                <input class="score-inp" type="number" min="0" max="20" value="${pred?.goles1 ?? ''}" placeholder="-"
                  onchange="saveKO('${ronda.id}',${idx},this,'s1')" ${!editable ? 'disabled' : ''}
                  data-r="${ronda.id}" data-i="${idx}" data-f="s1" />
              </div>
              <div class="ko-vs-divider"><span>VS</span></div>
              <div class="ko-row">
                <span class="ko-source">${m.l2}</span>
                <input class="input ko-team-inp"
                  type="text" placeholder="Tu predicciÃ³n" value="${pred?.equipo2 || ''}"
                  onchange="saveKO('${ronda.id}',${idx},this,'t2')" ${!editable ? 'disabled' : ''} />
                <input class="score-inp" type="number" min="0" max="20" value="${pred?.goles2 ?? ''}" placeholder="-"
                  onchange="saveKO('${ronda.id}',${idx},this,'s2')" ${!editable ? 'disabled' : ''}
                  data-r="${ronda.id}" data-i="${idx}" data-f="s2" />
              </div>
            </div>`
          }).join('')}
        </div>
      </div>
    `).join('')}
  `

  const pendingKO = {}

  window.saveKO = async (ronda, idx, el, field) => {
    if (eliminacionBloqueada(fechasGrupos)) {
      toast('La fase de eliminaciÃ³n ya estÃ¡ cerrada', 'err')
      return
    }
    const key = `${ronda}_${idx}`
    if (!pendingKO[key]) pendingKO[key] = {}
    pendingKO[key][field] = el.value

    const pred = getPredKO(ronda, idx)
    const merged = {
      t1: pred?.equipo1 || '', t2: pred?.equipo2 || '',
      s1: pred?.goles1 ?? '', s2: pred?.goles2 ?? '',
      ...pendingKO[key]
    }
    if (merged.t1 && merged.t2) {
      try {
        await guardarPrediccionKO(user.id, ronda, idx, merged.t1, merged.t2, merged.s1 || 0, merged.s2 || 0)
        prediccionesKO = await getPrediccionesKO(user.id)
        el.style.borderColor = 'var(--success)'
        setTimeout(() => el.style.borderColor = '', 1500)
        await calcularYGuardarPuntos(user.id)
      } catch (e) { toast('Error: ' + e.message, 'err') }
    }
  }
}

// â”€â”€ ESPECIALES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderEspeciales() {
  const cont = document.getElementById('page-especiales')
  if (!cont) return

  const selOpts = (val) => SELECCIONES.map(s => `<option value="${s}" ${s === val ? 'selected' : ''}>${s}</option>`).join('')

  // Selector de goleador agrupado por paÃ­s
  const golEnLista = GOLEADORES.includes(especiales?.goleador)
  const golGrupos = GOLEADORES_POR_PAIS.map(g => `
    <optgroup label="${g.pais}">
      ${g.jugadores.map(j => `<option value="${j}" ${j === especiales?.goleador ? 'selected' : ''}>${j}</option>`).join('')}
    </optgroup>
  `).join('')

  const bloqueado = eliminacionBloqueada(fechasGrupos)
  const dis = bloqueado ? 'disabled' : ''

  cont.innerHTML = `
    <div class="card fade-up">
      <div class="card-title"><i class="ti ti-star"></i>Predicciones Especiales</div>
      ${bloqueado
        ? `<div class="aviso-bloqueo">
             <i class="ti ti-lock"></i>
             Esta fase ya estÃ¡ cerrada. Se cerrÃ³ al terminar la primera ronda de grupos.
           </div>`
        : `<div class="aviso-cierre">
             <i class="ti ti-clock"></i>
             Puedes llenar esta fase hasta: <strong>${textoCierre(fechasGrupos)}</strong>
           </div>`}
      <div class="pts-grid" style="margin-bottom:0;margin-top:12px;">
        <div class="pts-item"><span class="pts-val">10</span><div class="pts-desc">CampeÃ³n correcto</div></div>
        <div class="pts-item"><span class="pts-val">5</span><div class="pts-desc">SubcampeÃ³n correcto</div></div>
        <div class="pts-item"><span class="pts-val">5</span><div class="pts-desc">Goleador correcto</div></div>
      </div>
    </div>

    <div class="pick-grid fade-up">
      <div class="pick-card">
        <div id="icon-trofeo" class="pick-icon-3d"></div>
        <div class="pick-label">CampeÃ³n del mundo</div>
        <select class="select" ${dis} onchange="saveEsp('campeon',this.value)">
          <option value="">-- Selecciona --</option>
          ${selOpts(especiales?.campeon)}
        </select>
      </div>
      <div class="pick-card">
        <div id="icon-medalla" class="pick-icon-3d"></div>
        <div class="pick-label">SubcampeÃ³n</div>
        <select class="select" ${dis} onchange="saveEsp('subcampeon',this.value)">
          <option value="">-- Selecciona --</option>
          ${selOpts(especiales?.subcampeon)}
        </select>
      </div>
      <div class="pick-card">
        <div id="icon-balon" class="pick-icon-3d"></div>
        <div class="pick-label">Goleador del torneo</div>
        <select class="select" id="sel-goleador" ${dis} onchange="onGoleadorSelect(this.value)">
          <option value="">-- Selecciona de la lista --</option>
          ${golGrupos}
          <option value="__OTRO__" ${especiales?.goleador && !golEnLista ? 'selected' : ''}>âœï¸ Otro jugador (escribir)</option>
        </select>
        <input class="input" id="inp-goleador-otro" type="text" ${dis}
          placeholder="Escribe el nombre del jugador"
          value="${especiales?.goleador && !golEnLista ? especiales.goleador : ''}"
          style="margin-top:8px;display:${especiales?.goleador && !golEnLista ? 'block' : 'none'};"
          onchange="saveEsp('goleador',this.value)" />
      </div>
    </div>
  `

  window.onGoleadorSelect = (val) => {
    const inpOtro = document.getElementById('inp-goleador-otro')
    if (val === '__OTRO__') {
      inpOtro.style.display = 'block'
      inpOtro.focus()
      // no guardamos aÃºn, esperamos a que escriba
    } else {
      inpOtro.style.display = 'none'
      inpOtro.value = ''
      saveEsp('goleador', val)
    }
  }

  const espPending = { ...especiales }

  window.saveEsp = async (field, val) => {
    if (eliminacionBloqueada(fechasGrupos)) {
      toast('La fase de especiales ya estÃ¡ cerrada', 'err')
      return
    }
    espPending[field] = val
    try {
      await guardarEspeciales(user.id, espPending.campeon || null, espPending.subcampeon || null, espPending.goleador || null)
      especiales = await getEspeciales(user.id)
      toast('âœ“ Guardado')
      await calcularYGuardarPuntos(user.id)
    } catch (e) { toast('Error: ' + e.message, 'err') }
  }

  setTimeout(() => {
    montarTrofeo('icon-trofeo')
    montarMedalla('icon-medalla')
    montarMiniBalon('icon-balon')
  }, 50)
}

// â”€â”€ RANKING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function renderRanking() {
  const cont = document.getElementById('page-ranking')
  if (!cont) return
  cont.innerHTML = `<div class="card fade-up"><div class="card-title"><i class="ti ti-podium"></i>Tabla de posiciones</div><div class="empty"><i class="ti ti-loader"></i>Cargando ranking...</div></div>`

  try {
    const ranking = await getRanking()
    if (!ranking.length) {
      cont.innerHTML = `<div class="card fade-up"><div class="card-title"><i class="ti ti-podium"></i>Tabla de posiciones</div><div class="empty"><i class="ti ti-users"></i>AÃºn no hay participantes con puntos</div></div>`
      return
    }

    cont.innerHTML = `
      <div class="card fade-up">
        <div class="card-title"><i class="ti ti-podium"></i>Tabla de posiciones</div>
        <table class="rank-table">
          <thead><tr>
            <th>#</th>
            <th>Participante</th>
            <th>Grupos</th>
            <th>KO</th>
            <th>Especiales</th>
            <th>Total</th>
          </tr></thead>
          <tbody>
            ${ranking.map((r, i) => {
              const pos = i + 1
              const cls = pos === 1 ? 'gold' : pos === 2 ? 'silver' : pos === 3 ? 'bronze' : ''
              const medal = pos === 1 ? 'ðŸ¥‡' : pos === 2 ? 'ðŸ¥ˆ' : pos === 3 ? 'ðŸ¥‰' : pos
              return `<tr class="rank-row">
                <td><span class="rank-pos ${cls}">${medal}</span></td>
                <td style="font-weight:600;font-size:15px;">${r.participantes?.nombre || 'â€”'}</td>
                <td style="font-family:'Orbitron',monospace;font-size:13px;color:var(--text-dim);">${r.pts_grupos}</td>
                <td style="font-family:'Orbitron',monospace;font-size:13px;color:var(--text-dim);">${r.pts_ko}</td>
                <td style="font-family:'Orbitron',monospace;font-size:13px;color:var(--text-dim);">${r.pts_especiales}</td>
                <td><span class="rank-pts">${r.total}</span></td>
              </tr>`
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="card fade-up">
        <div class="card-title"><i class="ti ti-info-circle"></i>Sistema de puntos</div>
        <div class="pts-grid">
          <div class="pts-item"><span class="pts-val">3</span><div class="pts-desc">Marcador exacto grupos</div></div>
          <div class="pts-item"><span class="pts-val">1</span><div class="pts-desc">Ganador grupos</div></div>
          <div class="pts-item"><span class="pts-val">2</span><div class="pts-desc">Octavos</div></div>
          <div class="pts-item"><span class="pts-val">3</span><div class="pts-desc">Cuartos</div></div>
          <div class="pts-item"><span class="pts-val">4</span><div class="pts-desc">Semis</div></div>
          <div class="pts-item"><span class="pts-val">5</span><div class="pts-desc">Final</div></div>
          <div class="pts-item"><span class="pts-val">10</span><div class="pts-desc">CampeÃ³n</div></div>
          <div class="pts-item"><span class="pts-val">5</span><div class="pts-desc">Goleador</div></div>
        </div>
      </div>
    `
  } catch (e) {
    cont.innerHTML = `<div class="card"><div class="empty"><i class="ti ti-alert-triangle"></i>Error cargando ranking</div></div>`
  }
}

// â”€â”€ ADMIN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderAdmin() {
  const cont = document.getElementById('page-admin')
  if (!cont) return

  cont.innerHTML = `
    <div class="card fade-up">
      <div class="card-title"><i class="ti ti-settings"></i>Panel de AdministraciÃ³n</div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
        <button class="btn" onclick="toggleInscripciones()">
          <i class="ti ti-toggle-left"></i> Inscripciones: <span id="lbl-inscripciones" style="color:var(--success);">${inscripcionesAbiertas ? 'ABIERTAS' : 'CERRADAS'}</span>
        </button>
        <button class="btn" onclick="toggleTorneo()">
          <i class="ti ti-player-play"></i> Torneo: <span id="lbl-torneo" style="color:${torneoIniciado ? 'var(--success)' : 'var(--warn)'};">${torneoIniciado ? 'INICIADO' : 'NO INICIADO'}</span>
        </button>
        <button class="btn success" onclick="recalcularTodos()">
          <i class="ti ti-refresh"></i> Recalcular todos los puntos
        </button>
      </div>

      <hr class="sep" />
      <div class="card-title" style="margin-top:8px;"><i class="ti ti-calendar-event"></i>Fechas de partidos (bloqueo automÃ¡tico)</div>
      <p style="font-size:13px;color:var(--text-dim);margin-bottom:6px;">
        Estas fechas controlan cuÃ¡ndo se bloquea cada partido. VerifÃ­calas contra el fixture oficial.
        Si corriges una, pulsa "Guardar fechas".
      </p>
      <div class="aviso-cierre" style="margin-bottom:14px;">
        <i class="ti ti-clock"></i>
        EliminaciÃ³n y Especiales se cierran: <strong>${textoCierre(fechasGrupos)}</strong>
      </div>
      <div id="fechas-editor">
        ${GRUPOS.map(g => {
          const partidos = getPartidosGrupo(g)
          return `<div class="fechas-grupo">
            <div class="fechas-grupo-tit">GRUPO ${g.letra}</div>
            ${partidos.map(({ e1, e2, idx }) => `
              <div class="fecha-row">
                <span class="fecha-equipos">${e1.n.slice(0,12)} vs ${e2.n.slice(0,12)}</span>
                <input class="input fecha-input" type="datetime-local"
                  id="fecha_${g.letra}_${idx}"
                  value="${fechasGrupos[`${g.letra}_${idx}`] || ''}" />
              </div>
            `).join('')}
          </div>`
        }).join('')}
      </div>
      <button class="btn full success" style="margin-top:12px;" onclick="guardarFechas()">
        <i class="ti ti-device-floppy"></i> Guardar fechas
      </button>

      <hr class="sep" />
      <div class="card-title" style="margin-top:8px;"><i class="ti ti-ball-football"></i>Resultados reales â€” Grupos</div>
      <p style="font-size:13px;color:var(--text-dim);margin-bottom:16px;">Ingresa aquÃ­ los marcadores reales cuando se jueguen los partidos.</p>

      <div class="admin-grid" id="admin-grupos-cont">
        ${GRUPOS.map(g => {
          const partidos = getPartidosGrupo(g)
          return partidos.map(({ e1, e2, idx }) => `
            <div class="admin-match">
              <div class="admin-match-title">GRUPO ${g.letra} â€” P${idx + 1}</div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-size:13px;flex:1;">${e1.f} ${e1.n}</span>
                <input class="score-inp" type="number" min="0" max="20" placeholder="-"
                  id="rg_${g.letra}_${idx}_s1" style="width:36px;" />
                <span style="color:var(--text-dim);">:</span>
                <input class="score-inp" type="number" min="0" max="20" placeholder="-"
                  id="rg_${g.letra}_${idx}_s2" style="width:36px;" />
                <span style="font-size:13px;flex:1;text-align:right;">${e2.n} ${e2.f}</span>
                <button class="btn sm success" onclick="saveResGrupo('${g.letra}',${idx},'${e1.n}','${e2.n}')">
                  <i class="ti ti-check"></i>
                </button>
              </div>
            </div>
          `).join('')
        }).join('')}
      </div>

      <hr class="sep" />
      <div class="card-title" style="margin-top:8px;"><i class="ti ti-trophy"></i>Resultados especiales finales</div>
      <div class="pick-grid" style="margin-top:12px;">
        <div class="pick-card">
          <span class="pick-icon">ðŸ†</span>
          <div class="pick-label">CampeÃ³n real</div>
          <select class="select" id="res-campeon">
            <option value="">-- Selecciona --</option>
            ${SELECCIONES.map(s => `<option>${s}</option>`).join('')}
          </select>
        </div>
        <div class="pick-card">
          <span class="pick-icon">ðŸ¥ˆ</span>
          <div class="pick-label">SubcampeÃ³n real</div>
          <select class="select" id="res-subcampeon">
            <option value="">-- Selecciona --</option>
            ${SELECCIONES.map(s => `<option>${s}</option>`).join('')}
          </select>
        </div>
        <div class="pick-card">
          <span class="pick-icon">âš½</span>
          <div class="pick-label">Goleador real</div>
          <select class="select" id="res-goleador">
            <option value="">-- Selecciona --</option>
            ${GOLEADORES_POR_PAIS.map(g => `<optgroup label="${g.pais}">${g.jugadores.map(j => `<option>${j}</option>`).join('')}</optgroup>`).join('')}
          </select>
        </div>
      </div>
      <button class="btn full success" style="margin-top:12px;" onclick="saveResEspeciales()">
        <i class="ti ti-check"></i> Guardar resultados finales y calcular ganador
      </button>
    </div>
  `

  window.toggleInscripciones = async () => {
    inscripcionesAbiertas = !inscripcionesAbiertas
    await setConfig('inscripciones_abiertas', String(inscripcionesAbiertas))
    document.getElementById('lbl-inscripciones').textContent = inscripcionesAbiertas ? 'ABIERTAS' : 'CERRADAS'
    document.getElementById('lbl-inscripciones').style.color = inscripcionesAbiertas ? 'var(--success)' : 'var(--danger)'
    toast(inscripcionesAbiertas ? 'Inscripciones abiertas' : 'Inscripciones cerradas')
  }

  window.toggleTorneo = async () => {
    torneoIniciado = !torneoIniciado
    await setConfig('torneo_iniciado', String(torneoIniciado))
    document.getElementById('lbl-torneo').textContent = torneoIniciado ? 'INICIADO' : 'NO INICIADO'
    document.getElementById('lbl-torneo').style.color = torneoIniciado ? 'var(--success)' : 'var(--warn)'
    toast('Estado del torneo actualizado')
  }

  window.saveResGrupo = async (grupo, idx, e1, e2) => {
    const s1 = document.getElementById(`rg_${grupo}_${idx}_s1`)?.value
    const s2 = document.getElementById(`rg_${grupo}_${idx}_s2`)?.value
    if (s1 === '' || s2 === '') { toast('Ingresa ambos marcadores', 'err'); return }
    try {
      await guardarResultadoGrupo(grupo, idx, e1, e2, s1, s2)
      toast(`âœ“ Resultado Grupo ${grupo} P${idx + 1} guardado`)
    } catch (e) { toast('Error: ' + e.message, 'err') }
  }

  window.saveResEspeciales = async () => {
    const c = document.getElementById('res-campeon')?.value
    const s = document.getElementById('res-subcampeon')?.value
    const g = document.getElementById('res-goleador')?.value
    if (!c || !s || !g) { toast('Selecciona los 3 resultados', 'err'); return }
    try {
      await guardarResultadosEspeciales(c, s, g)
      toast('âœ“ Resultados finales guardados')
    } catch (e) { toast('Error: ' + e.message, 'err') }
  }

  window.recalcularTodos = async () => {
    toast('Recalculando puntos...')
    try {
      const { data: todos } = await supabase.from('participantes').select('id')
      for (const p of todos || []) {
        await calcularYGuardarPuntos(p.id)
      }
      toast('âœ“ Puntos actualizados para todos')
    } catch (e) { toast('Error: ' + e.message, 'err') }
  }

  window.guardarFechas = async () => {
    const nuevasFechas = {}
    GRUPOS.forEach(g => {
      getPartidosGrupo(g).forEach(({ idx }) => {
        const inp = document.getElementById(`fecha_${g.letra}_${idx}`)
        if (inp && inp.value) nuevasFechas[`${g.letra}_${idx}`] = inp.value
      })
    })
    try {
      await guardarFechasGrupos(nuevasFechas)
      fechasGrupos = nuevasFechas
      toast('âœ“ Fechas guardadas correctamente')
    } catch (e) { toast('Error: ' + e.message, 'err') }
  }
}

// â”€â”€ START â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
init()




