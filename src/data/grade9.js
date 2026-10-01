export default [
  {
    id: "g9_1", grade: 9, stage: 1, kind: "platform",
    promptFa: "کدام کلمه، مؤنث نیست؟",
    choices: ["زَهْراء", "صَحراء", "شَجَرة", "مُوسی"],
    correctAnswer: "مُوسی",
    explanationFa: "مُوسی نام مذکر است.",
  },
  {
    id: "g9_2", grade: 9, stage: 1, kind: "platform",
    promptFa: "کدام گزینه، مثنّای مذکر است؟",
    choices: ["مُسْلِمینَ", "مُؤْمنات", "حافِظَیْنِ", "أوراق"],
    correctAnswer: "حافِظَیْنِ",
    explanationFa: "حافِظَیْنِ صورت مثنّای مذکر در حالت نصب یا جر است.",
  },
  {
    id: "g9_3", grade: 9, stage: 2, kind: "gate",
    promptFa: "کدام گزینه، جمع مؤنث سالم است؟",
    choices: ["أوقات", "أصوات", "أبیات", "غافلات"],
    correctAnswer: "غافلات",
    explanationFa: "غافلات جمع مؤنث سالمِ غافلة است.",
  },
  {
    id: "g9_4", grade: 9, stage: 2, kind: "order",
    promptFa: "مفرد «مُجاهِدینَ» و سپس مفرد «مُجاهدات» را به ترتیب جمع کن.",
    tokens: ["مُجاهِد", "مُجاهِدَة"],
    correctAnswer: "مُجاهِد مُجاهِدَة",
    explanationFa: "مفرد مُجاهِدینَ، مُجاهِد و مفرد مُجاهدات، مُجاهِدَة است.",
  },
  {
    id: "g9_5", grade: 9, stage: 3, kind: "gate",
    promptFa: "اللّاعبونَ .................... في المسابقةِ. کدام گزینه، به درستی جای خالی را پر می‌کند؟",
    choices: ["فائزةٌ", "فائزانِ", "فائزاتٌ", "فائزونَ"],
    correctAnswer: "فائزونَ",
    explanationFa: "اللّاعبونَ جمع مذکر است و فائزونَ با آن هماهنگ می‌شود.",
  },
];
