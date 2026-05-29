// Lógica de bloqueos de la quiniela.
// Las fechas están en hora de Costa Rica (GMT-6).
// El navegador del usuario puede estar en otra zona, así que
// convertimos todo a un instante absoluto usando el offset -06:00.

const OFFSET_CR = '-06:00'

// Convierte una fecha ISO local de Costa Rica (ej "2026-06-11T16:00")
// a un objeto Date absoluto correcto.
function fechaCR(isoLocal) {
  if (!isoLocal) return null
  // Añade segundos si faltan y el offset de Costa Rica
  let s = isoLocal.trim()
  if (s.length === 16) s += ':00'
  return new Date(s + OFFSET_CR)
}

// ¿Ya pasó la fecha/hora de este partido de grupos?
export function partidoBloqueado(fechaISO, ahora = new Date()) {
  const f = fechaCR(fechaISO)
  if (!f || isNaN(f.getTime())) return false // sin fecha válida = no se bloquea
  return ahora >= f
}

// Calcula cuándo termina la PRIMERA RONDA de la fase de grupos:
// el momento del primer partido más tardío entre los 12 grupos.
// (El "primer partido" de cada grupo es el de fecha más temprana de ese grupo.)
export function fechaCierreEliminacion(fechasGrupos) {
  const grupos = 'ABCDEFGHIJKL'.split('')
  let masTardio = null

  for (const g of grupos) {
    // fechas de los 6 partidos del grupo
    const fechasGrupo = []
    for (let i = 0; i < 6; i++) {
      const iso = fechasGrupos[`${g}_${i}`]
      const f = fechaCR(iso)
      if (f && !isNaN(f.getTime())) fechasGrupo.push(f)
    }
    if (!fechasGrupo.length) continue
    // el primer partido de este grupo = la fecha más temprana
    const primerPartido = new Date(Math.min(...fechasGrupo.map(d => d.getTime())))
    // guardamos el más tardío de todos los "primeros partidos"
    if (!masTardio || primerPartido > masTardio) masTardio = primerPartido
  }
  return masTardio
}

// ¿Ya está cerrada la fase de Eliminación y Especiales?
// Se cierra cuando todos los grupos jugaron su primer partido.
export function eliminacionBloqueada(fechasGrupos, ahora = new Date()) {
  const cierre = fechaCierreEliminacion(fechasGrupos)
  if (!cierre) return false
  return ahora >= cierre
}

// Texto amigable de cuándo se cierra (para mostrar al usuario)
export function textoCierre(fechasGrupos) {
  const cierre = fechaCierreEliminacion(fechasGrupos)
  if (!cierre) return ''
  return cierre.toLocaleString('es-CR', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Costa_Rica'
  })
}

// Formatea una fecha de partido para mostrarla
export function formatoFechaPartido(fechaISO) {
  const f = fechaCR(fechaISO)
  if (!f || isNaN(f.getTime())) return 'Sin fecha'
  return f.toLocaleString('es-CR', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Costa_Rica'
  })
}
