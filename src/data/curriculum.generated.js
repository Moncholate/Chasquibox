/* AUTO-GENERATED from Grammar HUB/curriculum.json — do not edit by hand.
   Change curriculum.json and run `npm run sync-curriculum` in Grammar HUB. */

export const NIVELES = ["basico1","basico2","elemental1","elemental2","intermedio1","intermedio2","avanzado"];

/* El nombre de cada curso, ES/EN. */
export const CURSOS = {
  "basico1": {
    "es": "Básico I",
    "en": "Basic I"
  },
  "basico2": {
    "es": "Básico II",
    "en": "Basic II"
  },
  "elemental1": {
    "es": "Elemental I",
    "en": "Elementary I"
  },
  "elemental2": {
    "es": "Elemental II",
    "en": "Elementary II"
  },
  "intermedio1": {
    "es": "Intermedio I",
    "en": "Intermediate I"
  },
  "intermedio2": {
    "es": "Intermedio II",
    "en": "Intermediate II"
  },
  "avanzado": {
    "es": "Intermedio Alto",
    "en": "Upper-Interm."
  }
};

/* Los TIEMPOS con nombre visible y el curso en que se enseñan. Los demás
   contenidos (modales, wh-, categorías) no llevan etiqueta y por eso no están:
   el dado sortea tiempos. */
export const TIEMPOS = {
  "to-be-pres": {
    "level": "basico1",
    "unit": "2B",
    "label": {
      "es": "Verbo be (presente)",
      "en": "Verb be (present)"
    }
  },
  "simple-present": {
    "level": "basico1",
    "unit": "5A",
    "unitBe": "2B",
    "unitQuestions": "5B",
    "unitThirdPerson": "6A",
    "label": {
      "es": "Presente Simple",
      "en": "Simple Present"
    }
  },
  "present-continuous": {
    "level": "basico2",
    "unit": "9A",
    "label": {
      "es": "Presente Continuo",
      "en": "Present Continuous"
    }
  },
  "to-be-past": {
    "level": "basico2",
    "unit": "10B",
    "label": {
      "es": "Verbo be (pasado)",
      "en": "Verb be (past)"
    }
  },
  "simple-past": {
    "level": "basico2",
    "unit": "11A",
    "unitBe": "10B",
    "unitIrregulars": "11B",
    "label": {
      "es": "Pasado Simple",
      "en": "Simple Past"
    }
  },
  "future-going-to": {
    "level": "elemental2",
    "unit": "10B",
    "label": {
      "es": "Futuro (going to)",
      "en": "Future (going to)"
    }
  },
  "present-perfect": {
    "level": "elemental2",
    "unit": "12A",
    "label": {
      "es": "Presente Perfecto",
      "en": "Present Perfect"
    }
  },
  "past-continuous": {
    "level": "intermedio1",
    "unit": "2B",
    "label": {
      "es": "Pasado Continuo",
      "en": "Past Continuous"
    }
  },
  "simple-future": {
    "level": "intermedio1",
    "unit": "6A",
    "label": {
      "es": "Futuro Simple (will)",
      "en": "Simple Future (will)"
    }
  },
  "past-perfect": {
    "level": "intermedio2",
    "unit": "12A",
    "label": {
      "es": "Pasado Perfecto",
      "en": "Past Perfect"
    }
  },
  "used-to": {
    "level": "intermedio2",
    "unit": "11A",
    "label": {
      "es": "Used to",
      "en": "Used to"
    }
  },
  "present-perfect-continuous": {
    "level": "avanzado",
    "unit": "2B",
    "label": {
      "es": "Presente Perfecto Continuo",
      "en": "Present Perfect Continuous"
    }
  }
};
