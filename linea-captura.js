(function(){
    const LOGO_URL = 'https://raw.githubusercontent.com/Prof-Luis1986/recursos-cetis50/refs/heads/main/logo-cetis50.jpg';
    const BANK_DATA = {
      banco: 'BBVA',
      cuenta: '0114681657',
      beneficiario: 'ASOCIACIÓN DE PADRES DE FAMILIA MARIANO MATAMOROS Y GURIDI CETIS 50',
      cantidad: '$1115.00 (Mil ciento quince pesos 00/100 M.N.)'
    };
    const ENCARGADOS_SERVICIOS = {
      MATUTINO: 'Carlos Rojas Cuéllar',
      VESPERTINO: 'Luis Elmer García Rodríguez'
    };
    const NOTES_TEXT = 'Indicaciones: Después de haber realizado tú pago, poner en la parte de enfrente del comprobante los siguientes datos: Nombre completo, Número de control, Turno, Teléfono, Grado y Grupo. Recuerda que deberás acudir al plantel a entregar tus documentos.';

    const form = document.getElementById('captureForm');
    const previewContainer = document.getElementById('previewContainer');
    const fichaWrap = document.getElementById('fichaWrap');
    const downloadBtn = document.getElementById('downloadBtn');
    const printBtn = document.getElementById('printBtn');

    function escapeHtml(str){
      if (!str) return '';
      return String(str).replace(/[&<>"']/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[s]));
    }

    function formatDateTime(date){
      const fecha = date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const hora = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `${fecha} ${hora}`;
    }

    const FICHA_STYLES = `
      body{font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#111;margin:0;padding:20px;background:#fff;}
      .ficha-document{border:1px solid #cfcfcf;border-radius:12px;padding:18px 20px;}
      .doc-header{display:grid;grid-template-columns:72px 1fr 72px;gap:12px;align-items:center;border-bottom:2px solid #222;padding-bottom:12px;margin-bottom:12px;}
      .doc-logo img{width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid rgba(0,0,0,0.12);}
      .doc-title{text-align:center;}
      .doc-title h2{margin:0;font-size:1.15rem;color:#1b2847;}
      .doc-title p{margin:4px 0 0;font-weight:700;color:#7a1e29;}
      .doc-meta{font-size:0.95rem;margin-bottom:14px;color:#222;}
      .doc-section{margin-bottom:14px;}
      .doc-section h3{margin:0 0 8px;font-size:1rem;color:#1b2847;}
      .doc-table{width:100%;border-collapse:collapse;font-size:0.9rem;}
      .doc-table th,.doc-table td{border:1px solid #333;padding:7px 8px;vertical-align:top;}
      .doc-table th{width:32%;background:#f3f3f3;text-align:left;}
      .doc-notes{border-top:2px solid #222;padding-top:12px;font-size:0.9rem;line-height:1.5;}
      .doc-notes strong{color:#1b2847;}
      .doc-authorization{margin-top:16px;text-align:center;font-size:0.95rem;}
      .doc-authorization .line{height:1px;background:#222;margin:10px auto 6px;width:min(70%,320px);}
      .doc-authorization .title{font-weight:700;color:#1b2847;}
      .doc-authorization .name{font-weight:600;color:#111;}
    `;

    function renderFicha(data){
      const encargado = ENCARGADOS_SERVICIOS[data.turno] || 'Por definir';
      return `
        <div class="ficha-document">
          <div class="doc-header">
            <div class="doc-logo"><img src="${LOGO_URL}" alt="Logo CETIS 50" /></div>
            <div class="doc-title">
              <h2>CETIS 50 Mariano Matamoros y Guridi</h2>
              <p>Línea de captura de pago</p>
            </div>
            <div class="doc-logo"><img src="${LOGO_URL}" alt="Logo CETIS 50" /></div>
          </div>

          <div class="doc-meta">
            <strong>Fecha y Hora de Generación:</strong> ${escapeHtml(data.fecha)}
          </div>

          <div class="doc-section">
            <h3>Datos del Alumno</h3>
            <table class="doc-table">
              <tr>
                <th>Nombre:</th>
                <td>${escapeHtml(data.nombre)}</td>
              </tr>
              <tr>
                <th>Número de Control:</th>
                <td>${escapeHtml(data.control)}</td>
              </tr>
              <tr>
                <th>Grupo:</th>
                <td>${escapeHtml(data.grupo)}</td>
              </tr>
              <tr>
                <th>Especialidad:</th>
                <td>${escapeHtml(data.especialidad)}</td>
              </tr>
              <tr>
                <th>Turno:</th>
                <td>${escapeHtml(data.turno)}</td>
              </tr>
            </table>
          </div>

          <div class="doc-section">
            <h3>Datos Bancarios</h3>
            <table class="doc-table">
              <tr>
                <th>Banco:</th>
                <td>${escapeHtml(BANK_DATA.banco)}</td>
              </tr>
              <tr>
                <th>Número de Cuenta:</th>
                <td>${escapeHtml(BANK_DATA.cuenta)}</td>
              </tr>
              <tr>
                <th>Beneficiario:</th>
                <td>${escapeHtml(BANK_DATA.beneficiario)}</td>
              </tr>
              <tr>
                <th>Cantidad:</th>
                <td>${escapeHtml(BANK_DATA.cantidad)}</td>
              </tr>
            </table>
          </div>

          <div class="doc-notes">
            <strong>Notas Importantes</strong><br />
            ${escapeHtml(NOTES_TEXT)}
          </div>

          <div class="doc-authorization">
            <div class="title">Autorización de Servicios Escolares</div>
            <div class="line"></div>
            <div class="name">${escapeHtml(encargado)}</div>
            <div>Encargado de Servicios Escolares</div>
          </div>
        </div>
      `;
    }

    function buildDownloadHtml(innerHtml){
      return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Línea de captura - CETIS 50</title>
  <style>${FICHA_STYLES}</style>
</head>
<body>
  ${innerHtml}
</body>
</html>`;
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const now = new Date();
      const data = {
        nombre: form.nombreCompleto.value.trim(),
        control: form.numeroControl.value.trim(),
        grupo: form.grupo.value.trim(),
        especialidad: form.especialidad.value.trim(),
        turno: form.turno.value,
        fecha: formatDateTime(now)
      };
      fichaWrap.innerHTML = renderFicha(data);
      previewContainer.style.display = 'block';
      previewContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    downloadBtn.addEventListener('click', () => {
      if (!fichaWrap.innerHTML.trim()) return;
      const html = buildDownloadHtml(fichaWrap.innerHTML);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const control = (form.numeroControl.value || 'alumno').trim();
      a.href = url;
      a.download = `linea-captura-${control || 'alumno'}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    printBtn.addEventListener('click', () => {
      window.print();
    });
  })();
