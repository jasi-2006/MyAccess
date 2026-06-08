import { Image, Platform } from 'react-native';
import { resolveImageUrl } from '../services/api.js';
import { getRoleDisplayName } from '../utils/accessControl.js';

const ALL_FICHAS = '__all__';
const PRINT_STYLE_ID = 'myaccess-print-styles';
const senaLogoAsset = require('../assets/logoSena.png');
const senaLogoUri =
  typeof Image.resolveAssetSource === 'function'
    ? Image.resolveAssetSource(senaLogoAsset)?.uri
    : senaLogoAsset?.uri || senaLogoAsset?.default || null;

export function getFichaValue(user) {
  return String(user?.ficha || user?.files || '').trim();
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

export function buildCarnetPairHtml(learner, card) {
  const photoUrl = resolveImageUrl(learner?.photoUrl || card?.photoUrl);
  const fullName = (learner?.fullName || learner?.full_name || 'Sin nombre').trim();
  const roleDisplay = getRoleDisplayName(learner?.nameRole || learner?.name_role);
  const docType = learner?.typeDocument || 'C.C';
  const docNum = learner?.document || '';
  const blood = learner?.bloodType || '';
  const email = learner?.email || '';
  const regional = (learner?.regional || 'Regional Quindio').trim();
  const center = (learner?.trainingCenter || 'Centro Comercio y Turismo').trim();
  const program = learner?.trainingProgram || 'NA';
  const ficha = learner?.ficha || learner?.files || '';
  const initial = fullName.charAt(0).toUpperCase();
  const logoSrc = senaLogoUri || `${window.location.origin}/static/media/logoSena.png`;

  const photoHtml = photoUrl
    ? `<img src="${photoUrl}" crossorigin="anonymous" style="width:100%;height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#E8F5E9,#A5D6A7);display:flex;align-items:center;justify-content:center;"><span style="font-size:36px;font-weight:900;color:#2E7D32;">${initial}</span></div>`;

  const bars = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1];
  const barcodeHtml = `<div style="display:flex;align-items:flex-end;height:28px;width:100%;">${
    bars.map((w, i) => `<div style="width:${w}px;height:26px;background:#000;${i < bars.length - 1 ? 'margin-right:1px;' : ''}"></div>`).join('')
  }</div>`;

  const qrPattern = [
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

  const qrHtml = `<div style="padding:5px;background:#fff;border:1px solid #111;display:inline-block;">${
    qrPattern.map((row) => `<div style="display:flex;">${row.split('').map((c) => `<div style="width:3.5px;height:3.5px;background:${c === '1' ? '#111' : '#fff'};"></div>`).join('')}</div>`).join('')
  }</div>`;

  const logoHtml = `<img src="${logoSrc}" style="width:72px;height:72px;object-fit:contain;" onerror="this.outerHTML='<div style=&quot;width:72px;height:72px;background:#39A900;border-radius:50%;display:flex;align-items:center;justify-content:center;&quot;><span style=&quot;color:#fff;font-weight:900;font-size:14px;font-family:Arial,sans-serif;&quot;>SENA</span></div>'" />`;

  const front = `
    <div style="width:265px;height:420px;border-radius:24px;border:1px solid #C5C9C7;background:#FFFFFF;box-sizing:border-box;display:flex;flex-direction:column;font-family:'Inter',Arial,sans-serif;position:relative;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);-webkit-print-color-adjust:exact;print-color-adjust:exact;">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;height:140px;padding:14px 14px 4px 14px;box-sizing:border-box;position:relative;z-index:2;">
        <div style="display:flex;flex-direction:column;justify-content:space-between;height:100%;align-items:flex-start;">
          <div style="display:flex;flex-direction:column;align-items:center;">
            ${logoHtml}
          </div>
          <div style="font-size:12px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.5px;font-family:'Inter',Arial,sans-serif;line-height:1;margin-bottom:2px;">
            ${roleDisplay}
          </div>
        </div>
        <div style="width:108px;height:122px;border-radius:6px;overflow:hidden;background:#E5E7EB;display:flex;align-items:center;justify-content:center;box-sizing:border-box;">
          ${photoHtml}
        </div>
      </div>

      <div style="height:5px;background:#00A74F;width:100%;margin:0;padding:0;box-sizing:border-box;"></div>

      <div style="padding:10px 14px 14px 14px;box-sizing:border-box;display:flex;flex-direction:column;font-family:'Inter',Arial,sans-serif;gap:2px;position:relative;z-index:2;">
        <div style="font-size:18px;font-weight:800;color:#0B7F35;line-height:1.2;font-family:'Inter',Arial,sans-serif;word-wrap:break-word;word-break:keep-all;margin-bottom:2px;">
          ${fullName}
        </div>
        <div style="font-size:11.5px;font-weight:600;color:#374151;margin-bottom:6px;font-family:'Inter',Arial,sans-serif;letter-spacing:0.2px;">
          ${docType} ${docNum} RH ${blood}
        </div>
        <div style="margin-bottom:12px;">
          ${barcodeHtml}
        </div>
        <div style="color:#374151;font-size:11px;font-weight:700;">
          ${regional}
        </div>
        <div style="color:#0B7F35;font-size:11px;font-weight:700;">
          ${center}
        </div>
        <div style="color:#374151;font-size:11px;font-weight:700;text-transform:uppercase;">
          ${program}
        </div>
        ${ficha ? `<div style="color:#374151;font-size:11px;font-weight:700;">Grupo No ${ficha}</div>` : ''}
      </div>
    </div>`;

  const back = `
    <div style="width:265px;height:420px;border-radius:24px;border:1px solid #C5C9C7;background:#FFFFFF;padding:20px 14px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;font-family:'Inter',Arial,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.08);-webkit-print-color-adjust:exact;print-color-adjust:exact;position:relative;overflow:hidden;">
      <div style="font-size:9.5px;color:#374151;line-height:1.4;font-weight:500;">
        Este carnet pertenece a quien lo porta, unicamente para el cumplimiento de sus funciones y para la obtencion de servicios que el SENA presta a sus funcionarios y/o contratistas.<br/>Se solicita a las autoridades civiles y militares prestarle toda la colaboracion para su desempeño.
      </div>
      
      ${email ? `<div style="text-align:center;font-size:9px;color:#374151;margin-bottom:12px;font-weight:500;">&#9993; ${email}</div>` : ''}
      
      <div style="text-align:center;padding:12px 0;border-top:1px solid #C5C9C7;border-bottom:1px solid #C5C9C7;margin: 20px 0;">
        <div style="font-size:10px;color:#2B2B2B;font-weight:700;text-transform:capitalize;">cesar augusto ospina p</div>
        <div style="font-size:10px;color:#0B7F35;font-weight:600;">Firma de autoria</div>
      </div>
      
      <div style="font-size:9px;color:#374151;line-height:1.4;font-weight:500;">
        Si por algun motivo este carnet es extraviado, por favor dirijase a la Direccion Regional Quindio - Avenida Centenario #44 Norte-15.
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
