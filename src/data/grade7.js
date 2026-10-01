export default [
  {
    id: "g7_1", grade: 7, stage: 1, kind: "platform",
    promptFa: "نام تصویر روبرو کدام گزینه است؟",
    choices: ["أطفال", "زائر", "طَبیب", "نَهر"],
    correctAnswer: "نَهر",
    explanationFa: "نَهر به معنی رود است.",
    image: new URL("../../assets/questions/grade7-river.jpeg", import.meta.url).href,
    imageAlt: "رودخانه در میان کوه‌ها و درختان",
  },
  {
    id: "g7_2", grade: 7, stage: 1, kind: "platform",
    promptFa: "ترجمهٔ عبارت «أهلاً بِکُم في الصَّفِّ السّابِعِ.» چیست؟",
    choices: [
      "هفتمی‌ها به کلاس خوش آمدید.",
      "به کلاس هفتم خوش آمدند.",
      "به کلاس هفتم خوش آمدید.",
      "به کلاس هفتمی‌ها خوش آمد می‌گوییم به شما.",
    ],
    correctAnswer: "به کلاس هفتم خوش آمدید.",
    explanationFa: "أهلاً بِکُم خطاب به شماست و الصَّفِّ السّابِعِ یعنی کلاس هفتم.",
  },
  {
    id: "g7_3", grade: 7, stage: 2, kind: "gate",
    promptFa: "متضاد کلمهٔ أَب کدام گزینه است؟",
    choices: ["اِبن", "اُمّ", "وَلَد", "هذِهِ"],
    correctAnswer: "اُمّ",
    explanationFa: "أَب یعنی پدر و اُمّ یعنی مادر.",
  },
  {
    id: "g7_4", grade: 7, stage: 2, kind: "gate",
    promptFa: "نام دیگر «شانه‌به‌سر» چیست؟",
    choices: ["بُلبُل", "توت", "هُدهُد", "فیل"],
    correctAnswer: "هُدهُد",
    explanationFa: "نام دیگر پرندهٔ شانه‌به‌سر، هُدهُد است.",
  },
  {
    id: "g7_5", grade: 7, stage: 3, kind: "gate",
    promptFa: "ترجمهٔ عبارت «أنا أُحِبُّ أُمِّي» چیست؟",
    choices: [
      "من مادر را دوست دارم.",
      "من مادرم را دوست دارم.",
      "تو پدرت را دوست داری.",
      "من پدرم را دوست دارم.",
    ],
    correctAnswer: "من مادرم را دوست دارم.",
    explanationFa: "أُمِّي یعنی مادرم و أُحِبُّ یعنی دوست دارم.",
  },
];
