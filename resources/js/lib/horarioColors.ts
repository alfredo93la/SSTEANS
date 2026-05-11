const PALETA = [
  { bg: "bg-purple-50",  border: "border-purple-200",  text: "text-purple-700"  },
  { bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700"    },
  { bg: "bg-green-50",   border: "border-green-200",   text: "text-green-700"   },
  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700"  },
  { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700"    },
  { bg: "bg-teal-50",    border: "border-teal-200",    text: "text-teal-700"    },
  { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"   },
  { bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700"  },
  { bg: "bg-cyan-50",    border: "border-cyan-200",    text: "text-cyan-700"    },
  { bg: "bg-pink-50",    border: "border-pink-200",    text: "text-pink-700"    },
];

export function colorMateria(materiaId: number) {
  return PALETA[materiaId % PALETA.length];
}

export function colorClase(materiaId: number, grupoId: number) {
  return PALETA[(materiaId * 31 + grupoId) % PALETA.length];
}
