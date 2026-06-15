import { describe, it, expect } from 'vitest';
import {
  nextNumero,
  fmtUsd,
  dateFr,
  genCarteNFC,
  escHtml,
  qualitePourType,
} from './crm-data.js';

describe('nextNumero', () => {
  it('génère le premier numéro quand la liste est vide', () => {
    expect(nextNumero('DEV-', 2026, [])).toBe('DEV-2026-001');
  });

  it('incrémente à partir du max existant', () => {
    expect(nextNumero('DEV-', 2026, ['DEV-2026-003', 'DEV-2026-007', 'DEV-2026-002'])).toBe('DEV-2026-008');
  });

  it('padde le numéro à 3 chiffres', () => {
    expect(nextNumero('FAC-', 2026, ['FAC-2026-042'])).toBe('FAC-2026-043');
  });

  it('ignore les refs sans suffixe numérique', () => {
    expect(nextNumero('CTR-', 2026, ['CTR-2026-005', 'invalide'])).toBe('CTR-2026-006');
  });
});

describe('fmtUsd', () => {
  it('formate zéro', () => {
    expect(fmtUsd(0)).toBe('$0');
  });

  it('formate un entier avec séparateur FR', () => {
    const result = fmtUsd(1000);
    expect(result).toMatch(/^\$1[.,\s]?000$/);
  });

  it('gère une valeur non numérique en retournant $0', () => {
    expect(fmtUsd(undefined)).toBe('$0');
    expect(fmtUsd(null)).toBe('$0');
  });
});

describe('dateFr', () => {
  it('convertit une date ISO en format FR', () => {
    expect(dateFr('2026-06-15')).toBe('15 JUN 2026');
  });

  it('retourne — pour une valeur vide', () => {
    expect(dateFr('')).toBe('—');
    expect(dateFr(null)).toBe('—');
    expect(dateFr(undefined)).toBe('—');
  });

  it('gère tous les mois', () => {
    const mois = ['JAN', 'FÉV', 'MAR', 'AVR', 'MAI', 'JUN', 'JUL', 'AOÛ', 'SEP', 'OCT', 'NOV', 'DÉC'];
    mois.forEach((m, i) => {
      const mm = String(i + 1).padStart(2, '0');
      expect(dateFr(`2026-${mm}-01`)).toBe(`01 ${m} 2026`);
    });
  });
});

describe('genCarteNFC', () => {
  it('génère une carte au format 4588 2201 XXXX XXXX', () => {
    const carte = genCarteNFC();
    expect(carte).toMatch(/^4588 2201 \d{4} \d{4}$/);
  });

  it('génère des cartes différentes à chaque appel', () => {
    const cartes = new Set(Array.from({ length: 20 }, () => genCarteNFC()));
    expect(cartes.size).toBeGreaterThan(1);
  });
});

describe('escHtml', () => {
  it('échappe les caractères HTML dangereux', () => {
    expect(escHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    );
  });

  it('échappe les apostrophes', () => {
    expect(escHtml("L'accord")).toBe('L&#39;accord');
  });

  it('gère null et undefined', () => {
    expect(escHtml(null)).toBe('');
    expect(escHtml(undefined)).toBe('');
  });
});

describe('qualitePourType', () => {
  it('retourne la qualité correcte pour chaque type', () => {
    expect(qualitePourType('Club')).toBe('Club sportif');
    expect(qualitePourType('Sponsor')).toBe('Sponsor / Partenaire');
    expect(qualitePourType('Académie')).toBe('Académie / Centre de formation');
    expect(qualitePourType('Athlète')).toBe('Athlète professionnel');
    expect(qualitePourType('Institution')).toBe('Institution / Fédération');
  });

  it('retourne le fallback pour un type inconnu', () => {
    expect(qualitePourType('Inconnu')).toBe('Partie contractante');
    expect(qualitePourType('')).toBe('Partie contractante');
  });
});
