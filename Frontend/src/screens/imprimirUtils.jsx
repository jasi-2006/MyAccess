import { Image, Platform } from 'react-native';
import { resolveImageUrl } from '../services/api.js';
import { getRoleDisplayName } from '../utils/accessControl.js';

const ALL_FICHAS = '__all__';
const PRINT_STYLE_ID = 'myaccess-print-styles';
const senaLogoAsset = require('../assets/logoSena.png');
const firmaAsset = require('../assets/firma.png');
const senaLogoUri =
  typeof Image.resolveAssetSource === 'function'
    ? Image.resolveAssetSource(senaLogoAsset)?.uri
    : senaLogoAsset?.uri || senaLogoAsset?.default || null;
const firmaUri =
  typeof Image.resolveAssetSource === 'function'
    ? Image.resolveAssetSource(firmaAsset)?.uri
    : firmaAsset?.uri || firmaAsset?.default || null;

export function getFichaValue(user) {
  return String(user?.ficha || user?.files || '').trim();
}

export function learnerToProfile(learner) {
  if (!learner) return null;

  return {
    id: learner.id,
    fullName: learner.fullName || learner.full_name,
    full_name: learner.full_name || learner.fullName,
    typeDocument: learner.typeDocument,
    document: learner.document,
    bloodType: learner.bloodType,
    nameRole: learner.nameRole || learner.name_role,
    regional: learner.regional,
    trainingCenter: learner.trainingCenter,
    trainingProgram: learner.trainingProgram,
    ficha: learner.ficha || learner.files,
    photoUrl: learner.photoUrl,
  };
}

export function compareText(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'es', {
    numeric: true,
    sensitivity: 'base',
  });
}

export function compareLearners(a, b) {
  const fichaCompare = compareText(getFichaValue(a), getFichaValue(b));
  if (fichaCompare !== 0) return fichaCompare;

  const nameA = a?.fullName || a?.full_name || '';
  const nameB = b?.fullName || b?.full_name || '';
  const nameCompare = compareText(nameA, nameB);
  if (nameCompare !== 0) return nameCompare;

  return compareText(a?.document || a?.id, b?.document || b?.id);
}

export function installPrintStyles() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
  if (document.getElementById(PRINT_STYLE_ID)) return undefined;

  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      body * { visibility: hidden !important; }
      body:not(.print-single-carnet) #print-area,
      body:not(.print-single-carnet) #print-area * { visibility: visible !important; }
      body:not(.print-single-carnet) #print-area {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 12px !important;
        padding: 12px !important;
        background: #ffffff !important;
      }
      #print-area > div {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      body.print-single-carnet #single-print-area,
      body.print-single-carnet #single-print-area * { visibility: visible !important; }
      body.print-single-carnet #single-print-area {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        min-height: 100vh !important;
        display: flex !important;
        justify-content: center !important;
        align-items: flex-start !important;
        padding: 18px !important;
        background: #ffffff !important;
      }
    }
  `;
  document.head.appendChild(style);
  return () => document.getElementById(PRINT_STYLE_ID)?.remove();
}

const QR_PATTERN = [
  '11111110001001111111',
  '10000010110010100001',
  '10111010101110101101',
  '10111010010000101101',
  '10111010111110101101',
  '10000010001000100001',
  '11111110101010111111',
  '00000000110110000000',
  '10110111100011101011',
  '00101100111001011001',
  '11100011101011100011',
  '00111001010100101110',
  '10101110111110001011',
  '00000000101000100000',
  '11111110110101111111',
  '10000010001100100001',
  '10111010111010101101',
  '10111010010100101101',
  '10000010101110100001',
  '11111110011000111111',
];

function buildQrHtml() {
  const rows = QR_PATTERN.map((row) => {
    const cells = row.split('').map((cell, index) => {
      const color = cell === '1' ? '#111111' : '#FFFFFF';
      return `<div style="width:3px;height:3px;background:${color};"></div>`;
    }).join('');
    return `<div style="display:flex;">${cells}</div>`;
  }).join('');

  return `<div style="padding:5px;background:#FFFFFF;display:inline-block;"><div style="border:1px solid #111111;">${rows}</div></div>`;
}

export function buildCarnetPairHtml(learner, card) {
  const photoUrl = resolveImageUrl(learner?.photoUrl || card?.photoUrl);
  const fullName = (learner?.fullName || learner?.full_name || 'Sin nombre').trim();
  const roleDisplay = getRoleDisplayName(learner?.nameRole || learner?.name_role);
  const docType = learner?.typeDocument || 'C.C';
  const docNum = learner?.document || '0.000.000.000';
  const blood = learner?.bloodType || 'RH O+';
  const regional = (learner?.regional || 'Regional Quindio').trim();
  const center = (learner?.trainingCenter || 'Centro de Comercio y Turismo').trim();
  const program = learner?.trainingProgram || 'ADSO';
  const ficha = learner?.ficha || learner?.files || '0000000';
  const logoSrc = senaLogoUri || `${window.location.origin}/static/media/logoSena.png`;
  const siluetaSrc = typeof Image.resolveAssetSource === 'function'
    ? Image.resolveAssetSource(require('../assets/silueta.png'))?.uri
    : null;

  const photoHtml = photoUrl
    ? `<img src="${photoUrl}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" />`
    : `<img src="${siluetaSrc || ''}" style="width:100%;height:100%;object-fit:cover;" />`;

  const bars = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1];
  const barcodeHtml = `<div style="display:flex;align-items:flex-end;height:28px;width:100%;">${
    bars.map((w, i) => `<div style="width:${w}px;height:26px;background:#000;${i < bars.length - 1 ? 'margin-right:1px;' : ''}"></div>`).join('')
  }</div>`;

 
  const logoHtml = `<img src="${logoSrc}" style="width:80px;height:80px;object-fit:contain;" />`;

  const front = `
    <div style="width:265px;height:420px;border-radius:18px;border:1px solid #D7D7D7;background:#FDFDFD;box-sizing:border-box;display:flex;flex-direction:column;font-family:Arial,sans-serif;position:relative;overflow:hidden;box-shadow:0 6px 14px rgba(0,0,0,0.08);padding:12px 14px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="width:88px;display:flex;align-items:center;">
          ${logoHtml}
        </div>
        <div style="width:122px;height:152px;border-radius:10px;overflow:hidden;background:#E9E9E9;">
          ${photoHtml}
        </div>
      </div>

      <div style="margin-top:10px;">
        <div style="font-size:14px;color:#2F2F2F;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">
          ${roleDisplay}
        </div>
        <div style="height:4px;background:#0A8A4A;border-radius:2px;margin-bottom:8px;"></div>
        <div style="font-size:17px;font-weight:900;color:#118449;line-height:21px;margin-bottom:6px;">
          ${fullName}
        </div>
        <div style="font-size:10px;color:#3A3A3A;margin-bottom:10px;">
          ${docType} ${docNum} RH ${blood}
        </div>
        <div style="margin-bottom:12px;">
          ${barcodeHtml}
        </div>
        <div style="font-size:13px;color:#4A4A4A;font-weight:700;">Regional ${regional}</div>
        <div style="font-size:11px;color:#5D9C7A;font-weight:700;">${center}</div>
        <div style="font-size:10px;color:#4A4A4A;">${program}</div>
        <div style="font-size:10px;color:#4A4A4A;">Grupo No ${ficha}</div>
      </div>
    </div>`;

  const back = `
    <div style="width:265px;height:420px;border-radius:18px;border:1px solid #D7D7D7;background:#FFFFFF;padding:14px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;font-family:Arial,sans-serif;box-shadow:0 6px 14px rgba(0,0,0,0.08);-webkit-print-color-adjust:exact;print-color-adjust:exact;">
      <div style="font-size:10px;color:#2E2E2E;line-height:13px;text-align:left;">
        Este carnet pertenece a quien lo porta, unicamente para el cumplimiento de sus funciones y para la obtencion de servicios que el SENA presta a sus funcionarios y/o contratistas.
        <br/>
        Se solicita a las autoridades civiles y militares prestarle toda la colaboracion para su desempeno.
      </div>

      <div style="display:flex;justify-content:center;margin:8px 0;">
        ${buildQrHtml()}
      </div>

      <div style="text-align:center;margin-bottom:10px;">
        <img
          src="${firmaUri || ''}"
          alt="Firma de autoria"
          style="width:200px;max-width:100%;height:70px;object-fit:contain;display:block;margin:0 auto 3px;"
        />
        <div style="font-size:11px;color:#333333;font-weight:700;letter-spacing:0.4px;">FIRMA AUTORIZADA</div>
      </div>

      <div style="font-size:10px;color:#2E2E2E;line-height:13px;">
        Si por algun motivo este carnet es extraviado, por favor dirijase a la Direccion Regional Quindio - Avenida Centenario #44 Norte -15
      </div>
    </div>`;

  return `<div class="carnet-pair"><div class="carnet-front">${front}</div><div class="carnet-back">${back}</div></div>`;
}

export function buildPrintHtml(title, subtitle, bodyHtml, singleCarnet = false) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com"/>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @page { margin: 0; }
        body { font-family: 'Inter', Arial, sans-serif; background: #F0FFF8; padding: 24px; }
        ${singleCarnet ? 'body { padding: 18px; background: #ffffff; }' : ''}
        h1 { font-size: 22px; font-weight: 900; color: #0A8A4A; margin-bottom: 4px; }
        .subtitle { font-size: 13px; color: #6B7280; margin-bottom: 20px; }
        .grid { display: flex; flex-wrap: wrap; gap: 20px; }
        ${singleCarnet ? '.grid { display: flex; justify-content: center; }' : ''}
        .carnet-pair { display: flex; gap: 16px; margin-bottom: 28px; }
        ${singleCarnet ? '.carnet-pair { display: flex; gap: 16px; margin-bottom: 0; }' : ''}
        .print-btn {
          position: fixed; top: 16px; right: 16px;
          background: #0A8A4A; color: #fff; font-weight: 800;
          font-size: 14px; border: none; border-radius: 10px;
          padding: 10px 22px; cursor: pointer; box-shadow: 0 4px 14px rgba(10,138,74,0.4);
          font-family: 'Inter', Arial, sans-serif;
        }
        .print-btn:hover { background: #087C4A; }
        @media print {
          body { background: #fff; padding: 0; }
          .print-btn, h1, .subtitle { display: none !important; }
          .grid { display: block !important; }
          .carnet-pair { display: block !important; margin: 0 !important; }
          .carnet-front,
          .carnet-back {
            page-break-after: always !important;
            break-after: page !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            min-height: 100vh !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }
          .carnet-pair:last-child .carnet-back {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
        }
      </style>
    </head>
    <body>
      ${singleCarnet ? '' : '<button class="print-btn" onclick="window.print()">&#128438; Imprimir</button>'}
      ${!singleCarnet ? `<h1>${title}</h1>
      <p class="subtitle">${subtitle}</p>` : ''}
      ${bodyHtml}
    </body>
    </html>
  `;
}
