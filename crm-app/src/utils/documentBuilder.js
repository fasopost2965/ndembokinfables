// Moteur générique de génération PDF partagé par devis, factures et contrats.
// Utilise window.print() dans une nouvelle fenêtre — aucune dépendance externe.

const MOIS = ['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'];

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0) + ' $';
}

function dateFr(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * @param {{ type: 'devis'|'facture', doc: object, lignes: object[], client: object|null, company: object }} opts
 * @returns {string} HTML complet prêt pour impression
 */
export function buildDocumentHTML({ type, doc, lignes, client, company }) {
  const TYPE_LABELS = { devis: 'DEVIS', facture: 'FACTURE' };
  const typeLabel = TYPE_LABELS[type] || type.toUpperCase();

  const totalHT = lignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0), 0);
  const tva = Number(company.tva) || 0;
  const totalTVA = totalHT * (tva / 100);
  const totalTTC = totalHT + totalTVA;

  const logoHtml = company.logoUrl
    ? `<img src="${company.logoUrl}" alt="Logo" style="height:52px;max-width:200px;object-fit:contain"/>`
    : `<div style="font-size:20px;font-weight:700;letter-spacing:.02em;color:#254354">${company.nom || 'Ndembo Kin Connect'}</div>`;

  const lignesRows = lignes.map((l, i) => {
    const st = (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0);
    return `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8f9fa'}">
      <td style="padding:10px 16px;font-size:13px;color:#1a1a1a;border-bottom:1px solid #e5e8eb">${l.description || '—'}</td>
      <td style="padding:10px 16px;text-align:center;font-size:13px;color:#5b6b77;border-bottom:1px solid #e5e8eb">${l.quantite}</td>
      <td style="padding:10px 16px;text-align:right;font-family:monospace;font-size:13px;color:#5b6b77;border-bottom:1px solid #e5e8eb">${fmt(Number(l.prixUnitaire))}</td>
      <td style="padding:10px 16px;text-align:right;font-family:monospace;font-size:13px;font-weight:700;color:#254354;border-bottom:1px solid #e5e8eb">${fmt(st)}</td>
    </tr>`;
  }).join('');

  const echeance = doc.expiration || doc.echeance;
  const clientVille = [client?.ville, client?.pays].filter(Boolean).join(', ');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>${typeLabel} ${doc.ref}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;background:#fff;padding:32px;max-width:820px;margin:0 auto}
    table{width:100%;border-collapse:collapse}
    th{background:#254354;color:#fff;padding:10px 16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;text-align:left}
    .btn-print{display:block;text-align:center;padding:16px;background:#f0f4f7;border-radius:8px;margin-bottom:28px}
    .btn-print button{padding:10px 28px;background:#254354;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:700;cursor:pointer}
    @media print{
      .btn-print{display:none!important}
      body{padding:0}
      @page{margin:12mm 10mm;size:A4}
    }
  </style>
</head>
<body>
  <div class="btn-print">
    <button onclick="window.print()">🖨 Imprimer / Enregistrer en PDF</button>
  </div>

  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:3px solid #254354">
    <div>${logoHtml}</div>
    <div style="text-align:right">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:#BC000D;margin-bottom:4px">${typeLabel}</div>
      <div style="font-size:24px;font-weight:700;font-family:monospace;color:#254354">${doc.ref}</div>
      <div style="font-size:11px;color:#9aabb6;margin-top:4px">Émis le ${dateFr(doc.date)}</div>
      ${echeance ? `<div style="font-size:11px;color:#9aabb6">Échéance : ${dateFr(echeance)}</div>` : ''}
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px">
    <div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#9aabb6;margin-bottom:8px">Émetteur</div>
      <div style="font-weight:700;font-size:14px;color:#254354;margin-bottom:4px">${company.nom || ''}</div>
      <div style="font-size:12px;color:#5b6b77;line-height:1.65">${company.adresseCourte || company.adresse || ''}</div>
      <div style="font-size:12px;color:#5b6b77">${company.email || ''}</div>
      <div style="font-size:12px;color:#5b6b77">${company.tel || ''}</div>
      ${company.nif ? `<div style="font-size:11px;color:#9aabb6;margin-top:4px">NIF ${company.nif} — RCCM ${company.rccm || ''}</div>` : ''}
    </div>
    <div>
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#9aabb6;margin-bottom:8px">Destinataire</div>
      <div style="font-weight:700;font-size:14px;color:#254354;margin-bottom:4px">${client?.nom || doc.clientNom || '—'}</div>
      ${client?.adresse ? `<div style="font-size:12px;color:#5b6b77;line-height:1.65">${client.adresse}</div>` : ''}
      ${clientVille ? `<div style="font-size:12px;color:#5b6b77">${clientVille}</div>` : ''}
      ${client?.email ? `<div style="font-size:12px;color:#5b6b77">${client.email}</div>` : ''}
      ${client?.tel ? `<div style="font-size:12px;color:#5b6b77">${client.tel}</div>` : ''}
    </div>
  </div>

  <div style="background:#f0f4f7;border-radius:6px;padding:12px 16px;margin-bottom:${doc.description ? '12px' : '24px'};border-left:3px solid #254354">
    <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9aabb6">Objet — </span>
    <span style="font-weight:600;color:#254354">${doc.objet}</span>
  </div>
  ${doc.description ? `<div style="font-size:13px;color:#5b6b77;line-height:1.65;margin-bottom:24px;padding:12px 16px;border-left:2px solid #1E9FD8;background:#f4fbff;border-radius:0 6px 6px 0">${doc.description}</div>` : ''}

  <table style="margin-bottom:24px;border-radius:8px;overflow:hidden;box-shadow:0 1px 6px rgba(0,0,0,.08)">
    <thead>
      <tr>
        <th style="width:50%">Prestation / Service</th>
        <th style="width:10%;text-align:center">Qté</th>
        <th style="width:20%;text-align:right">Prix unit.</th>
        <th style="width:20%;text-align:right">Sous-total</th>
      </tr>
    </thead>
    <tbody>${lignesRows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="padding:14px 16px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9aabb6">Total HT</td>
        <td style="padding:14px 16px;text-align:right;font-family:monospace;font-size:17px;font-weight:700;color:#254354">${fmt(totalHT)}</td>
      </tr>
      ${tva > 0 ? `
      <tr>
        <td colspan="3" style="padding:6px 16px;text-align:right;font-size:11px;color:#9aabb6">TVA ${tva}%</td>
        <td style="padding:6px 16px;text-align:right;font-family:monospace;font-size:13px;color:#9aabb6">${fmt(totalTVA)}</td>
      </tr>
      <tr style="background:#254354">
        <td colspan="3" style="padding:14px 16px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.7)">Total TTC</td>
        <td style="padding:14px 16px;text-align:right;font-family:monospace;font-size:19px;font-weight:700;color:#fff">${fmt(totalTTC)}</td>
      </tr>` : `
      <tr style="background:#254354">
        <td colspan="3" style="padding:14px 16px;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.7)">Total</td>
        <td style="padding:14px 16px;text-align:right;font-family:monospace;font-size:19px;font-weight:700;color:#fff">${fmt(totalHT)}</td>
      </tr>`}
    </tfoot>
  </table>

  ${doc.notes ? `<div style="background:#f8f9fa;border-radius:6px;padding:14px 16px;margin-bottom:20px;font-size:12.5px;color:#5b6b77;line-height:1.6;border:1px solid #e5e8eb"><strong>Notes :</strong> ${doc.notes}</div>` : ''}

  ${company.conditionsDefaut ? `
  <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e8eb">
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#9aabb6;margin-bottom:8px">Conditions de règlement</div>
    <div style="font-size:12px;color:#5b6b77;line-height:1.65">${company.conditionsDefaut}</div>
  </div>` : ''}

  ${company.banque ? `
  <div style="margin-top:20px;padding:14px 16px;background:#f0f4f7;border-radius:6px;font-size:12px;color:#5b6b77;line-height:1.6">
    <strong style="color:#254354">Coordonnées bancaires : </strong>${company.banque}${company.swift ? ' — SWIFT : ' + company.swift : ''}
  </div>` : ''}

  <div style="margin-top:48px;padding-top:16px;border-top:1px solid #e5e8eb;display:flex;justify-content:space-between;font-size:11px;color:#9aabb6">
    <div>${company.nom}${company.rccm ? ' — RCCM ' + company.rccm : ''}${company.nif ? ' — NIF ' + company.nif : ''}</div>
    <div>Généré le ${new Date().toLocaleDateString('fr-FR')}</div>
  </div>
</body>
</html>`;
}

/** Ouvre une fenêtre et lance window.print() */
export function printDocument(opts) {
  const html = buildDocumentHTML(opts);
  const w = window.open('', '_blank', 'width=920,height=760');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}
