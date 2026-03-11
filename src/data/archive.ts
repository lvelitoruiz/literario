export type ArticleKind = "ENSAYO" | "FICCIÓN" | "TEORÍA" | "RELATO" | "CRÓNICA";

export interface Article {
  id: string;
  slug: string;
  indexNumber: string;
  year: string;
  kind: ArticleKind;
  title: string;
  summary: string;
  author: string;
  publishedAt: string;
  // el cuerpo completo vive en un archivo Markdown basado en el slug
}

export const articles: Article[] = [
  {
    id: "002",
    slug: "cronica-necesidad-del-papel-fisico",
    indexNumber: "002",
    year: "2026",
    kind: "CRÓNICA",
    title: "La ¿necesidad? de escribir",
    summary:
      "Una breve reflexión sobre por qué algunas ideas necesitan ser escritas para no desbordarse por dentro.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
  {
    id: "001",
    slug: "rituales-breves",
    indexNumber: "001",
    year: "2026",
    kind: "ENSAYO",
    title: "Rituales Breves",
    summary:
      "Rituales mínimos: duendes que intervienen la escritura, conductores hipnotizados por la luz roja y ceremonias íntimas para cantar, hablar y extrañar.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
  {
    id: "003",
    slug: "compulsion-sangre-ritual",
    indexNumber: "003",
    year: "2026",
    kind: "ENSAYO",
    title: "¿Compulsión? / ¿Sangre ritual?",
    summary:
      "Dos fragmentos en espiral sobre psicosis, sangre y el placer oscuro de jugar con el propio latido.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
  {
    id: "004",
    slug: "culto-por-hiperdulia",
    indexNumber: "004",
    year: "2026",
    kind: "ENSAYO",
    title: "Culto por hiperdulía",
    summary:
      "Un monólogo devocional y hereje sobre altares íntimos, abstinencia, fe desviada y una adoración dirigida a alguien muy humano.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
  {
    id: "005",
    slug: "ayer-observacion",
    indexNumber: "005",
    year: "2026",
    kind: "ENSAYO",
    title: "Ayer… (observación clínica)",
    summary:
      "Siete fragmentos numerados sobre enajenación, frío interno y el miedo a ser observado desde el otro lado de la pantalla.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
  {
    id: "006",
    slug: "walk",
    indexNumber: "006",
    year: "2026",
    kind: "FICCIÓN",
    title: "Walk",
    summary:
      "Una caminata nocturna por Lima con un guía contradictorio de ojos rojos y una niña azul que se deja arrastrar por el peligro.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
  {
    id: "007",
    slug: "la-furia-de-pachacamac",
    indexNumber: "007",
    year: "2026",
    kind: "FICCIÓN",
    title: "La furia de Pachacamac",
    summary:
      "Una noche fría en Lima, una conversación en Kilka y la presencia latente de Pachacamac mientras dos personas caminan hacia ninguna parte.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
  {
    id: "008",
    slug: "azul-tristeza",
    indexNumber: "008",
    year: "2026",
    kind: "FICCIÓN",
    title: "Azul Tristeza",
    summary:
      "Un relato sobre una muñeca azul colgando de un maletín, la melancolía en Lima y la forma en que la tristeza se impregna en la retina.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
  {
    id: "009",
    slug: "ollama",
    indexNumber: "009",
    year: "2026",
    kind: "FICCIÓN",
    title: "Ollama",
    summary:
      "La vida interior de un llavero con forma de llama que observa a su dueño entre tristeza, videos y noches de ojos rojos.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
  {
    id: "010",
    slug: "canela",
    indexNumber: "010",
    year: "2026",
    kind: "FICCIÓN",
    title: "Canela",
    summary:
      "Un recuerdo de besos con sabor a canela, una despedida en taxi y la búsqueda imposible de un cigarrillo que prolongue esa ausencia.",
    author: "Luis",
    publishedAt: "11 de Marzo, 2026",
  },
];

