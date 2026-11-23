const SPREADSHEET_ID = '1zSrQFBSZKLwMLk9uOFD17dROQmYOE_Zl1_AsqIU4B0g';
const SHEET_NAME = 'SEMESTRAL';

function doGet(e) {
  try {
    const numeroControl = String(e.parameter.numeroControl || '').trim();

    if (!numeroControl) {
      return jsonResponse({ ok: false, error: 'Falta numero de control.' }, 400);
    }

    const boleta = findBoleta(numeroControl);

    if (!boleta) {
      return jsonResponse({ ok: false, error: 'No se encontro la boleta para ese numero de control.' }, 404);
    }

    return jsonResponse({ ok: true, boleta: boleta });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message || String(err) }, 500);
  }
}

function findBoleta(numeroControl) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];

  if (!sheet) {
    throw new Error('No hay pestanas disponibles en la hoja de calculo.');
  }

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0].map(normalizeHeader);
  const rows = values.slice(1).map(rowToObject(headers));
  const targetControl = normalizeControl(numeroControl);
  const matches = rows.filter(row => normalizeControl(row.numero_control || row.no_control || row.control) === targetControl);

  if (!matches.length) {
    return null;
  }

  return buildBoleta(matches);
}

function buildBoleta(rows) {
  const first = rows[0];
  const nombreCompleto = first.nombre_completo ||
    [first.nombre, first.paterno, first.materno].filter(Boolean).join(' ');

  return {
    numero_control: first.numero_control || first.no_control || first.control || '',
    nombre_completo: nombreCompleto,
    nombre: first.nombre || '',
    paterno: first.paterno || '',
    materno: first.materno || '',
    carrera: first.carrera || '',
    generacion: first.generacion || first.ciclo_escolar || '',
    turno: first.turno || '',
    semestre: first.semestre || '',
    grupo: first.grupo || '',
    periodo: first.periodo || '',
    materias: rows.map(function(row) {
      return {
        clave: row.clave || row.clave_asignatura || row.clv_centro || '',
        nombre: row.materia || row.asignatura || row.nombre_materia || row.nombre_asignatura || '',
        docente_nombre: row.docente_nombre || row.docente || '',
        p1: row.p1 || row.periodo_1 || '',
        p2: row.p2 || row.periodo_2 || '',
        p3: row.p3 || row.periodo_3 || '',
        a1: row.a1 || row.asistencia_periodo_1 || row.asistencia_1 || '',
        a2: row.a2 || row.asistencia_periodo_2 || row.asistencia_2 || '',
        a3: row.a3 || row.asistencia_periodo_3 || row.asistencia_3 || '',
        calificacion_final: row.calificacion_final || row.calificacion || ''
      };
    })
  };
}

function rowToObject(headers) {
  return function(row) {
    return headers.reduce(function(obj, key, index) {
      if (key) {
        obj[key] = row[index];
      }
      return obj;
    }, {});
  };
}

function normalizeHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeControl(value) {
  return String(value || '').replace(/\D+/g, '');
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
