export const GRUPOS = [
  { letra: 'A', equipos: [{n:'México',c:'mx'},{n:'Sudáfrica',c:'za'},{n:'Corea del Sur',c:'kr'},{n:'República Checa',c:'cz'}] },
  { letra: 'B', equipos: [{n:'Canadá',c:'ca'},{n:'Bosnia y Herzegovina',c:'ba'},{n:'Catar',c:'qa'},{n:'Suiza',c:'ch'}] },
  { letra: 'C', equipos: [{n:'Brasil',c:'br'},{n:'Marruecos',c:'ma'},{n:'Haití',c:'ht'},{n:'Escocia',c:'gb-sct'}] },
  { letra: 'D', equipos: [{n:'Estados Unidos',c:'us'},{n:'Paraguay',c:'py'},{n:'Australia',c:'au'},{n:'Turquía',c:'tr'}] },
  { letra: 'E', equipos: [{n:'Alemania',c:'de'},{n:'Curazao',c:'cw'},{n:'Costa de Marfil',c:'ci'},{n:'Ecuador',c:'ec'}] },
  { letra: 'F', equipos: [{n:'Países Bajos',c:'nl'},{n:'Japón',c:'jp'},{n:'Túnez',c:'tn'},{n:'Suecia',c:'se'}] },
  { letra: 'G', equipos: [{n:'Bélgica',c:'be'},{n:'Egipto',c:'eg'},{n:'Irán',c:'ir'},{n:'Nueva Zelanda',c:'nz'}] },
  { letra: 'H', equipos: [{n:'España',c:'es'},{n:'Cabo Verde',c:'cv'},{n:'Arabia Saudí',c:'sa'},{n:'Uruguay',c:'uy'}] },
  { letra: 'I', equipos: [{n:'Francia',c:'fr'},{n:'Senegal',c:'sn'},{n:'Irak',c:'iq'},{n:'Noruega',c:'no'}] },
  { letra: 'J', equipos: [{n:'Argentina',c:'ar'},{n:'Argelia',c:'dz'},{n:'Jordania',c:'jo'},{n:'Austria',c:'at'}] },
  { letra: 'K', equipos: [{n:'Portugal',c:'pt'},{n:'R.D. del Congo',c:'cd'},{n:'Uzbekistán',c:'uz'},{n:'Colombia',c:'co'}] },
  { letra: 'L', equipos: [{n:'Inglaterra',c:'gb-eng'},{n:'Croacia',c:'hr'},{n:'Panamá',c:'pa'},{n:'Ghana',c:'gh'}] },
]

export function flagUrl(code) {
  return `https://flagcdn.com/h40/${code}.png`
}

export function getPartidosGrupo(grupo) {
  const pares = []
  const eq = grupo.equipos
  for (let i = 0; i < eq.length; i++)
    for (let j = i + 1; j < eq.length; j++)
      pares.push({ e1: eq[i], e2: eq[j], idx: pares.length })
  return pares
}

// ── FECHAS DE PARTIDOS DE GRUPOS (hora de Costa Rica, GMT-6) ──
// Formato ISO. El índice corresponde al par generado por getPartidosGrupo.
// Orden de pares para equipos [0,1,2,3]:
//   idx0: 0-1 | idx1: 0-2 | idx2: 0-3 | idx3: 1-2 | idx4: 1-3 | idx5: 2-3
// Estas fechas se pueden corregir desde el Panel de Administrador.
export const FECHAS_GRUPOS_DEFAULT = {
  // GRUPO A: México, Sudáfrica, Corea, Chequia
  'A_0': '2026-06-11T16:00', // MEX-SUD
  'A_1': '2026-06-18T22:00', // MEX-COR
  'A_2': '2026-06-24T22:00', // MEX-CHE
  'A_3': '2026-06-24T22:00', // SUD-COR
  'A_4': '2026-06-18T13:00', // SUD-CHE
  'A_5': '2026-06-11T23:00', // COR-CHE
  // GRUPO B: Canadá, Bosnia, Catar, Suiza
  'B_0': '2026-06-12T16:00', // CAN-BOS
  'B_1': '2026-06-18T19:00', // CAN-QAT
  'B_2': '2026-06-24T16:00', // CAN-SUI
  'B_3': '2026-06-24T16:00', // BOS-QAT
  'B_4': '2026-06-18T16:00', // BOS-SUI
  'B_5': '2026-06-12T16:00', // QAT-SUI
  // GRUPO C: Brasil, Marruecos, Haití, Escocia
  'C_0': '2026-06-13T19:00', // BRA-MAR
  'C_1': '2026-06-19T22:00', // BRA-HAI
  'C_2': '2026-06-24T19:00', // BRA-ESC
  'C_3': '2026-06-24T19:00', // MAR-HAI
  'C_4': '2026-06-19T19:00', // MAR-ESC
  'C_5': '2026-06-13T22:00', // HAI-ESC
  // GRUPO D: USA, Paraguay, Australia, Turquía
  'D_0': '2026-06-12T22:00', // USA-PAR
  'D_1': '2026-06-19T16:00', // USA-AUS
  'D_2': '2026-06-25T23:00', // USA-TUR
  'D_3': '2026-06-25T23:00', // PAR-AUS
  'D_4': '2026-06-19T00:00', // PAR-TUR
  'D_5': '2026-06-14T01:00', // AUS-TUR
  // GRUPO E: Alemania, Curazao, Costa de Marfil, Ecuador
  'E_0': '2026-06-14T14:00', // ALE-CUR
  'E_1': '2026-06-20T17:00', // ALE-COS
  'E_2': '2026-06-25T17:00', // ALE-ECU
  'E_3': '2026-06-25T17:00', // CUR-COS
  'E_4': '2026-06-20T21:00', // CUR-ECU
  'E_5': '2026-06-14T20:00', // COS-ECU
  // GRUPO F: Países Bajos, Japón, Suecia, Túnez
  'F_0': '2026-06-14T17:00', // PBA-JAP
  'F_1': '2026-06-20T14:00', // PBA-SUE
  'F_2': '2026-06-25T20:00', // PBA-TUN
  'F_3': '2026-06-25T20:00', // JAP-SUE
  'F_4': '2026-06-21T01:00', // JAP-TUN
  'F_5': '2026-06-14T23:00', // SUE-TUN
  // GRUPO G: Bélgica, Egipto, Irán, Nueva Zelanda
  'G_0': '2026-06-15T16:00', // BEL-EGI
  'G_1': '2026-06-21T16:00', // BEL-IRA
  'G_2': '2026-06-27T00:00', // BEL-NZE
  'G_3': '2026-06-27T00:00', // EGI-IRA
  'G_4': '2026-06-21T22:00', // EGI-NZE
  'G_5': '2026-06-15T22:00', // IRA-NZE
  // GRUPO H: España, Cabo Verde, Arabia Saudí, Uruguay
  'H_0': '2026-06-15T13:00', // ESP-CVE
  'H_1': '2026-06-21T13:00', // ESP-SAU
  'H_2': '2026-06-26T21:00', // ESP-URU
  'H_3': '2026-06-26T21:00', // CVE-SAU
  'H_4': '2026-06-21T19:00', // CVE-URU
  'H_5': '2026-06-15T19:00', // SAU-URU
  // GRUPO I: Francia, Senegal, Irak, Noruega
  'I_0': '2026-06-16T16:00', // FRA-SEN
  'I_1': '2026-06-22T19:00', // FRA-IRA
  'I_2': '2026-06-26T16:00', // FRA-NOR
  'I_3': '2026-06-26T16:00', // SEN-IRA
  'I_4': '2026-06-22T16:00', // SEN-NOR
  'I_5': '2026-06-16T19:00', // IRA-NOR
  // GRUPO J: Argentina, Argelia, Jordania, Austria
  'J_0': '2026-06-16T22:00', // ARG-AGL
  'J_1': '2026-06-23T00:00', // ARG-JOR
  'J_2': '2026-06-22T14:00', // ARG-AUS
  'J_3': '2026-06-23T00:00', // AGL-JOR
  'J_4': '2026-06-27T20:30', // AGL-AUS
  'J_5': '2026-06-17T01:00', // JOR-AUS
  // GRUPO K: Portugal, RD Congo, Uzbekistán, Colombia
  'K_0': '2026-06-17T14:00', // POR-CON
  'K_1': '2026-06-23T14:00', // POR-UZB
  'K_2': '2026-06-27T20:30', // POR-COL
  'K_3': '2026-06-23T23:00', // CON-UZB
  'K_4': '2026-06-23T23:00', // CON-COL
  'K_5': '2026-06-17T23:00', // UZB-COL
  // GRUPO L: Inglaterra, Croacia, Ghana, Panamá
  'L_0': '2026-06-17T17:00', // ING-CRO
  'L_1': '2026-06-23T20:00', // ING-GHA
  'L_2': '2026-06-27T18:00', // ING-PAN
  'L_3': '2026-06-23T20:00', // CRO-GHA
  'L_4': '2026-06-22T20:00', // CRO-PAN
  'L_5': '2026-06-17T20:00', // GHA-PAN
}

// ── CUADRO OFICIAL DE ELIMINACIÓN — Mundial 2026 ──
// Cada partido tiene su número oficial y la procedencia de cada lado.

export const DIECISEISAVOS = [
  { num: 73, l1: '2° Grupo A', l2: '2° Grupo B' },
  { num: 74, l1: '1° Grupo E', l2: '3° Grupo A/B/C/D/F' },
  { num: 75, l1: '1° Grupo F', l2: '2° Grupo C' },
  { num: 76, l1: '1° Grupo C', l2: '2° Grupo F' },
  { num: 77, l1: '1° Grupo I', l2: '3° Grupo C/D/F/G/H' },
  { num: 78, l1: '2° Grupo E', l2: '2° Grupo I' },
  { num: 79, l1: '1° Grupo A', l2: '3° Grupo C/E/F/H/I' },
  { num: 80, l1: '1° Grupo L', l2: '3° Grupo E/H/I/J/K' },
  { num: 81, l1: '1° Grupo D', l2: '3° Grupo B/E/F/I/J' },
  { num: 82, l1: '1° Grupo G', l2: '3° Grupo A/E/H/I/J' },
  { num: 83, l1: '2° Grupo K', l2: '2° Grupo L' },
  { num: 84, l1: '1° Grupo H', l2: '2° Grupo J' },
  { num: 85, l1: '1° Grupo B', l2: '3° Grupo E/F/G/I/J' },
  { num: 86, l1: '1° Grupo J', l2: '2° Grupo H' },
  { num: 87, l1: '1° Grupo K', l2: '3° Grupo D/E/I/J/L' },
  { num: 88, l1: '2° Grupo D', l2: '2° Grupo G' },
]

export const OCTAVOS = [
  { num: 89, l1: 'Ganador P74', l2: 'Ganador P77' },
  { num: 90, l1: 'Ganador P73', l2: 'Ganador P75' },
  { num: 91, l1: 'Ganador P76', l2: 'Ganador P78' },
  { num: 92, l1: 'Ganador P79', l2: 'Ganador P80' },
  { num: 93, l1: 'Ganador P83', l2: 'Ganador P84' },
  { num: 94, l1: 'Ganador P81', l2: 'Ganador P82' },
  { num: 95, l1: 'Ganador P86', l2: 'Ganador P88' },
  { num: 96, l1: 'Ganador P85', l2: 'Ganador P87' },
]

export const CUARTOS = [
  { num: 97, l1: 'Ganador P89', l2: 'Ganador P90' },
  { num: 98, l1: 'Ganador P93', l2: 'Ganador P94' },
  { num: 99, l1: 'Ganador P91', l2: 'Ganador P92' },
  { num: 100, l1: 'Ganador P95', l2: 'Ganador P96' },
]

export const SEMIFINALES = [
  { num: 101, l1: 'Ganador P97', l2: 'Ganador P98' },
  { num: 102, l1: 'Ganador P99', l2: 'Ganador P100' },
]

export const TERCER_PUESTO = [
  { num: 103, l1: 'Perdedor P101', l2: 'Perdedor P102' },
]

export const FINAL = [
  { num: 104, l1: 'Ganador P101', l2: 'Ganador P102' },
]

export const KO_ROUNDS = [
  { id: 'dieciseisavos', title: 'Dieciseisavos de Final', icon: 'ti-tournament', pts: 2, matches: DIECISEISAVOS },
  { id: 'octavos',        title: 'Octavos de Final',       icon: 'ti-shield',      pts: 3, matches: OCTAVOS },
  { id: 'cuartos',        title: 'Cuartos de Final',       icon: 'ti-shield-check',pts: 4, matches: CUARTOS },
  { id: 'semis',          title: 'Semifinales',            icon: 'ti-flame',       pts: 5, matches: SEMIFINALES },
  { id: 'tercer_puesto',  title: '3er y 4to Puesto',       icon: 'ti-award',       pts: 4, matches: TERCER_PUESTO },
  { id: 'final',          title: 'Gran Final',             icon: 'ti-trophy',      pts: 8, matches: FINAL },
]

export const SELECCIONES = [
  'México','Corea del Sur','Sudáfrica','República Checa','Canadá','Suiza','Catar',
  'Bosnia y Herzegovina','Brasil','Marruecos','Escocia','Haití','Estados Unidos','Australia',
  'Paraguay','Turquía','Alemania','Ecuador','Costa de Marfil','Curazao',
  'Países Bajos','Japón','Túnez','Suecia','Bélgica','Irán','Egipto','Nueva Zelanda',
  'España','Uruguay','Arabia Saudí','Cabo Verde','Francia','Senegal','Noruega','Irak',
  'Argentina','Austria','Argelia','Jordania','Portugal','Colombia','Uzbekistán',
  'R.D. del Congo','Inglaterra','Croacia','Panamá','Ghana'
]

// Lista de goleadores destacados (atacantes y figuras) por selección.
// El usuario también puede escribir un nombre que no esté aquí.
export const GOLEADORES_POR_PAIS = [
  { pais: 'Argentina', jugadores: ['Lionel Messi','Lautaro Martínez','Julián Álvarez','Ángel Di María','Nicolás González','Alejandro Garnacho','Giuliano Simeone'] },
  { pais: 'Brasil', jugadores: ['Neymar Jr.','Vinicius Jr.','Raphinha','Gabriel Martinelli','Matheus Cunha','Endrick','Igor Thiago','Luiz Henrique'] },
  { pais: 'Francia', jugadores: ['Kylian Mbappé','Ousmane Dembélé','Marcus Thuram','Bradley Barcola','Michael Olise','Randal Kolo Muani','Kingsley Coman'] },
  { pais: 'España', jugadores: ['Lamine Yamal','Pedri','Álvaro Morata','Ferran Torres','Nico Williams','Mikel Oyarzabal','Dani Olmo','Ayoze Pérez'] },
  { pais: 'Inglaterra', jugadores: ['Harry Kane','Bukayo Saka','Phil Foden','Cole Palmer','Marcus Rashford','Jude Bellingham','Ollie Watkins'] },
  { pais: 'Alemania', jugadores: ['Florian Wirtz','Jamal Musiala','Kai Havertz','Niclas Füllkrug','Serge Gnabry','Leroy Sané'] },
  { pais: 'Portugal', jugadores: ['Cristiano Ronaldo','Rafael Leão','Bruno Fernandes','Gonçalo Ramos','João Félix','Pedro Neto','Francisco Conceição'] },
  { pais: 'Países Bajos', jugadores: ['Cody Gakpo','Memphis Depay','Donyell Malen','Wout Weghorst','Xavi Simons','Brian Brobbey'] },
  { pais: 'Bélgica', jugadores: ['Romelu Lukaku','Jérémy Doku','Kevin De Bruyne','Leandro Trossard','Charles De Ketelaere'] },
  { pais: 'Uruguay', jugadores: ['Darwin Núñez','Federico Valverde','Facundo Pellistri','Maximiliano Araújo','Rodrigo Aguirre'] },
  { pais: 'Croacia', jugadores: ['Andrej Kramarić','Ante Budimir','Bruno Petković','Luka Modrić','Igor Matanović'] },
  { pais: 'México', jugadores: ['Santiago Giménez','Raúl Jiménez','Hirving Lozano','Alexis Vega','César Huerta','Germán Berterame'] },
  { pais: 'Marruecos', jugadores: ['Achraf Hakimi','Youssef En-Nesyri','Brahim Díaz','Hakim Ziyech','Ayoub El Kaabi','Soufiane Rahimi'] },
  { pais: 'Senegal', jugadores: ['Sadio Mané','Nicolas Jackson','Iliman Ndiaye','Habib Diallo','Boulaye Dia'] },
  { pais: 'Estados Unidos', jugadores: ['Christian Pulisic','Folarin Balogun','Ricardo Pepi','Timothy Weah','Josh Sargent','Haji Wright'] },
  { pais: 'Japón', jugadores: ['Kaoru Mitoma','Takefusa Kubo','Ayase Ueda','Daizen Maeda','Junya Ito'] },
  { pais: 'Colombia', jugadores: ['Luis Díaz','James Rodríguez','Jhon Durán','Rafael Santos Borré','Luis Suárez','Jhon Córdoba'] },
  { pais: 'Suiza', jugadores: ['Breel Embolo','Dan Ndoye','Zeki Amdouni','Ruben Vargas','Xherdan Shaqiri'] },
  { pais: 'Dinamarca', jugadores: ['Rasmus Højlund','Christian Eriksen','Jonas Wind','Mikkel Damsgaard'] },
  { pais: 'Australia', jugadores: ['Mathew Leckie','Mitchell Duke','Jackson Irvine','Kusini Yengi'] },
  { pais: 'Corea del Sur', jugadores: ['Son Heung-min','Lee Kang-in','Hwang Hee-chan','Cho Gue-sung','Oh Hyeon-gyu'] },
  { pais: 'Serbia', jugadores: ['Dušan Vlahović','Aleksandar Mitrović','Dušan Tadić','Luka Jović'] },
  { pais: 'Canadá', jugadores: ['Jonathan David','Alphonso Davies','Cyle Larin','Tajon Buchanan'] },
  { pais: 'Catar', jugadores: ['Akram Afif','Almoez Ali','Yusuf Abdurisag'] },
  { pais: 'Ecuador', jugadores: ['Enner Valencia','Kevin Rodríguez','Leonardo Campana','Kendry Páez'] },
  { pais: 'Irán', jugadores: ['Mehdi Taremi','Sardar Azmoun','Alireza Jahanbakhsh'] },
  { pais: 'Arabia Saudí', jugadores: ['Salem Al-Dawsari','Firas Al-Buraikan','Saleh Al-Shehri'] },
  { pais: 'Túnez', jugadores: ['Wahbi Khazri','Youssef Msakni','Elyes Skhiri'] },
  { pais: 'Costa de Marfil', jugadores: ['Sébastien Haller','Wilfried Zaha','Nicolas Pépé','Jean-Philippe Krasso'] },
  { pais: 'Egipto', jugadores: ['Mohamed Salah','Omar Marmoush','Mostafa Mohamed','Trezeguet'] },
  { pais: 'Ghana', jugadores: ['Mohammed Kudus','Iñaki Williams','Jordan Ayew','Antoine Semenyo'] },
  { pais: 'Noruega', jugadores: ['Erling Haaland','Martin Ødegaard','Alexander Sørloth','Antonio Nusa'] },
  { pais: 'Austria', jugadores: ['Marko Arnautović','Michael Gregoritsch','Christoph Baumgartner','Patrick Wimmer'] },
  { pais: 'Escocia', jugadores: ['Che Adams','Lyndon Dykes','John McGinn','Scott McTominay'] },
  { pais: 'Argelia', jugadores: ['Riyad Mahrez','Islam Slimani','Baghdad Bounedjah','Amine Gouiri'] },
  { pais: 'Panamá', jugadores: ['Ismael Díaz','José Fajardo','Cecilio Waterman'] },
  { pais: 'Paraguay', jugadores: ['Miguel Almirón','Antonio Sanabria','Julio Enciso','Adam Bareiro'] },
  { pais: 'Sudáfrica', jugadores: ['Percy Tau','Lyle Foster','Themba Zwane'] },
  { pais: 'Nueva Zelanda', jugadores: ['Chris Wood','Ben Waine','Kosta Barbarouses'] },
  { pais: 'Uzbekistán', jugadores: ['Eldor Shomurodov','Abbosbek Fayzullaev'] },
  { pais: 'Jordania', jugadores: ['Mousa Al-Tamari','Yazan Al-Naimat','Ali Olwan'] },
  { pais: 'Cabo Verde', jugadores: ['Ryan Mendes','Garry Rodrigues','Bebé'] },
  { pais: 'Curazao', jugadores: ['Tahith Chong','Leandro Bacuna','Juninho Bacuna'] },
  { pais: 'Haití', jugadores: ['Frantzdy Pierrot','Duckens Nazon'] },
  { pais: 'Irak', jugadores: ['Aymen Hussein','Mohanad Ali','Ali Jasim'] },
  { pais: 'R.D. del Congo', jugadores: ['Cédric Bakambu','Yoane Wissa','Silas Katompa'] },
  { pais: 'Bosnia y Herzegovina', jugadores: ['Edin Džeko','Ermedin Demirović','Smail Prevljak'] },
  { pais: 'República Checa', jugadores: ['Patrik Schick','Adam Hložek','Tomáš Chorý'] },
  { pais: 'Suecia', jugadores: ['Alexander Isak','Viktor Gyökeres','Anthony Elanga','Dejan Kulusevski'] },
]

// Lista plana para el selector (todos los nombres)
export const GOLEADORES = GOLEADORES_POR_PAIS.flatMap(g => g.jugadores)
