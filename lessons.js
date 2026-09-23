/* Sizan English: lesson data
   compare roles: s = who (কে), v = action/being (কাজ), o = what/how (কী/কেমন), q = question word (প্রশ্ন)
   icon = Tabler icon name (see icons.js). hl = pattern words highlighted in examples.
   word.ex = [English example, Bangla meaning]
*/
window.LESSONS = [
  {
    id: 1, icon: "hand-stop", title: "Hello! I am Sizan", bn: "হ্যালো! আমি সিজান",
    hl: ["I", "am"],
    words: [
      { en: "hello", bn: "হ্যালো (শুভেচ্ছা)", say: "হ্যালো", icon: "hand-stop", ex: ["Hello, Rafi!", "হ্যালো, রাফি!"] },
      { en: "I", bn: "আমি", say: "আই", icon: "user", ex: ["I am Sizan.", "আমি সিজান।"] },
      { en: "am", bn: "হই / আছি", say: "অ্যাম", icon: "equal", ex: ["I am at home.", "আমি বাসায় আছি।"] },
      { en: "name", bn: "নাম", say: "নেইম", icon: "tag", ex: ["My name is Sizan.", "আমার নাম সিজান।"] },
      { en: "fine", bn: "ভালো", say: "ফাইন", icon: "mood-smile", ex: ["I am fine, thank you.", "আমি ভালো আছি, ধন্যবাদ।"] },
      { en: "happy", bn: "খুশি", say: "হ্যাপি", icon: "mood-happy", ex: ["I am happy today.", "আজ আমি খুশি।"] }
    ],
    pattern: {
      rows: [{ en: "I am ___", bn: "আমি ___" }],
      compare: { bn: [["আমি", "s"], ["সিজান", "o"]], en: [["I", "s"], ["am", "v"], ["Sizan", "o"]] },
      points: [
        "বাংলায় বলি “আমি সিজান”। মাঝে কোনো শব্দ লাগে না।",
        "ইংরেজিতে মাঝে <b>am</b> বসাতে হয়: <b>I am Sizan.</b>",
        "<b>I</b> সবসময় বড় হাতের অক্ষরে লেখা হয়।"
      ]
    },
    examples: [
      { en: "Hello! I am Sizan.", bn: "হ্যালো! আমি সিজান।" },
      { en: "My name is Sizan.", bn: "আমার নাম সিজান।" },
      { en: "I am fine.", bn: "আমি ভালো আছি।" },
      { en: "I am happy.", bn: "আমি খুশি।" },
      { en: "I am at home.", bn: "আমি বাসায় আছি।" },
      { en: "I am from Bangladesh.", bn: "আমি বাংলাদেশ থেকে এসেছি।" },
      { en: "I am hungry.", bn: "আমার খিদে পেয়েছে।" },
      { en: "I am ready.", bn: "আমি তৈরি।" }
    ],
    fill: [
      { q: "I ___ fine.", a: "am", opts: ["am", "is", "are"], bn: "আমি ভালো আছি।" },
      { q: "My ___ is Sizan.", a: "name", opts: ["name", "happy", "fine"], bn: "আমার নাম সিজান।" }
    ],
    story: {
      title: "Meet Sizan", bn: "সিজানের সাথে পরিচয়",
      lines: [
        { en: "Hello!", bn: "হ্যালো!" },
        { en: "My name is Sizan.", bn: "আমার নাম সিজান।" },
        { en: "I am from Bangladesh.", bn: "আমি বাংলাদেশ থেকে এসেছি।" },
        { en: "I am at home.", bn: "আমি বাসায় আছি।" },
        { en: "I am happy.", bn: "আমি খুশি।" }
      ]
    },
    write: { prompt: "নিজের সম্পর্কে একটা বাক্য লেখো", start: "I am ", hint: "I am Sizan. / I am happy. / I am at home." }
  },

  {
    id: 2, icon: "users", title: "You, He, She", bn: "তুমি, সে (ছেলে), সে (মেয়ে)",
    hl: ["am", "is", "are"],
    words: [
      { en: "you", bn: "তুমি / আপনি", say: "ইউ", icon: "user-circle", ex: ["You are my friend.", "তুমি আমার বন্ধু।"] },
      { en: "he", bn: "সে (ছেলে)", say: "হি", icon: "man", ex: ["He is my father.", "সে আমার বাবা।"] },
      { en: "she", bn: "সে (মেয়ে)", say: "শি", icon: "woman", ex: ["She is my sister.", "সে আমার বোন।"] },
      { en: "is", bn: "হয় / আছে (he, she এর সাথে)", say: "ইজ", icon: "equal", ex: ["He is happy.", "সে খুশি।"] },
      { en: "are", bn: "হও / আছ (you এর সাথে)", say: "আর", icon: "equal-double", ex: ["You are kind.", "তুমি দয়ালু।"] },
      { en: "tired", bn: "ক্লান্ত", say: "টায়ার্ড", icon: "zzz", ex: ["I am tired today.", "আজ আমি ক্লান্ত।"] }
    ],
    pattern: {
      rows: [
        { en: "I am", bn: "আমি" },
        { en: "You are", bn: "তুমি" },
        { en: "He is / She is", bn: "সে" }
      ],
      compare: { bn: [["সে", "s"], ["ক্লান্ত", "o"]], en: [["He", "s"], ["is", "v"], ["tired", "o"]] },
      points: [
        "বাংলায় “সে” একটাই শব্দ। ইংরেজিতে ছেলে হলে <b>He</b>, মেয়ে হলে <b>She</b>।",
        "মনে রাখো: <b>I → am</b>, <b>You → are</b>, <b>He / She → is</b>।"
      ]
    },
    examples: [
      { en: "You are my friend.", bn: "তুমি আমার বন্ধু।" },
      { en: "He is my brother.", bn: "সে আমার ভাই।" },
      { en: "She is my mother.", bn: "সে আমার মা।" },
      { en: "He is tired.", bn: "সে ক্লান্ত।" },
      { en: "She is happy.", bn: "সে খুশি।" },
      { en: "I am tired.", bn: "আমি ক্লান্ত।" },
      { en: "You are a good man.", bn: "তুমি একজন ভালো মানুষ।" },
      { en: "She is at home.", bn: "সে বাসায় আছে।" }
    ],
    fill: [
      { q: "He ___ tired.", a: "is", opts: ["am", "is", "are"], bn: "সে ক্লান্ত।" },
      { q: "You ___ my friend.", a: "are", opts: ["am", "is", "are"], bn: "তুমি আমার বন্ধু।" }
    ],
    story: {
      title: "My Family", bn: "আমার পরিবার",
      lines: [
        { en: "I am Sizan.", bn: "আমি সিজান।" },
        { en: "He is my father.", bn: "সে আমার বাবা।" },
        { en: "She is my mother.", bn: "সে আমার মা।" },
        { en: "You are my friend.", bn: "তুমি আমার বন্ধু।" },
        { en: "We are happy.", bn: "আমরা খুশি।" }
      ]
    },
    write: { prompt: "তোমার পরিবারের কাউকে নিয়ে একটা বাক্য লেখো", start: "He is ", hint: "He is my brother. / She is my mother." }
  },

  {
    id: 3, icon: "bus", title: "This is a bus", bn: "এটা একটা বাস",
    hl: ["this", "that", "is"],
    words: [
      { en: "this", bn: "এটা (কাছের)", say: "দিস", icon: "hand-finger-down", ex: ["This is my bag.", "এটা আমার ব্যাগ।"] },
      { en: "that", bn: "ওটা (দূরের)", say: "দ্যাট", icon: "hand-finger-right", ex: ["That is a big truck.", "ওটা একটা বড় ট্রাক।"] },
      { en: "bus", bn: "বাস", say: "বাস", icon: "bus", ex: ["I go by bus.", "আমি বাসে যাই।"] },
      { en: "truck", bn: "ট্রাক", say: "ট্রাক", icon: "truck", ex: ["This is a truck.", "এটা একটা ট্রাক।"] },
      { en: "phone", bn: "ফোন", say: "ফোন", icon: "device-mobile", ex: ["This is my phone.", "এটা আমার ফোন।"] },
      { en: "bag", bn: "ব্যাগ", say: "ব্যাগ", icon: "backpack", ex: ["That is my bag.", "ওটা আমার ব্যাগ।"] }
    ],
    pattern: {
      rows: [
        { en: "This is a ___", bn: "এটা একটা ___" },
        { en: "That is a ___", bn: "ওটা একটা ___" }
      ],
      compare: { bn: [["এটা", "s"], ["একটা বাস", "o"]], en: [["This", "s"], ["is", "v"], ["a bus", "o"]] },
      points: [
        "কাছের জিনিস = <b>this</b>, দূরের জিনিস = <b>that</b>।",
        "একটা জিনিস বোঝাতে আগে <b>a</b> বসে: <b>a bus</b>, <b>a phone</b>।"
      ]
    },
    examples: [
      { en: "This is a bus.", bn: "এটা একটা বাস।" },
      { en: "That is a truck.", bn: "ওটা একটা ট্রাক।" },
      { en: "This is my phone.", bn: "এটা আমার ফোন।" },
      { en: "That is his bag.", bn: "ওটা তার ব্যাগ।" },
      { en: "This is my friend Rafi.", bn: "এ আমার বন্ধু রাফি।" },
      { en: "That bus is big.", bn: "ওই বাসটা বড়।" },
      { en: "This is my house.", bn: "এটা আমার বাড়ি।" },
      { en: "That is a shop.", bn: "ওটা একটা দোকান।" }
    ],
    fill: [
      { q: "This ___ a truck.", a: "is", opts: ["is", "am", "are"], bn: "এটা একটা ট্রাক।" },
      { q: "This is ___ phone.", a: "my", opts: ["my", "I", "am"], bn: "এটা আমার ফোন।" }
    ],
    story: {
      title: "At the Bus Stop", bn: "বাস স্ট্যান্ডে",
      lines: [
        { en: "I am at the bus stop.", bn: "আমি বাস স্ট্যান্ডে আছি।" },
        { en: "This is a bus.", bn: "এটা একটা বাস।" },
        { en: "That is a truck.", bn: "ওটা একটা ট্রাক।" },
        { en: "The truck is big.", bn: "ট্রাকটা বড়।" },
        { en: "This is my bus!", bn: "এটা আমার বাস!" }
      ]
    },
    write: { prompt: "তোমার কাছে থাকা একটা জিনিস নিয়ে লেখো", start: "This is my ", hint: "This is my phone. / This is my bag." }
  },

  {
    id: 4, icon: "hand-grab", title: "I have a phone", bn: "আমার একটা ফোন আছে",
    hl: ["have", "has"],
    words: [
      { en: "have", bn: "আছে (আমার / তোমার)", say: "হ্যাভ", icon: "hand-grab", ex: ["I have a phone.", "আমার একটা ফোন আছে।"] },
      { en: "has", bn: "আছে (তার)", say: "হ্যাজ", icon: "user-check", ex: ["He has a car.", "তার একটা গাড়ি আছে।"] },
      { en: "brother", bn: "ভাই", say: "ব্রাদার", icon: "gender-male", ex: ["My brother is at home.", "আমার ভাই বাসায় আছে।"] },
      { en: "sister", bn: "বোন", say: "সিস্টার", icon: "gender-female", ex: ["My sister is happy.", "আমার বোন খুশি।"] },
      { en: "car", bn: "গাড়ি", say: "কার", icon: "car", ex: ["This is my car.", "এটা আমার গাড়ি।"] },
      { en: "money", bn: "টাকা", say: "মানি", icon: "cash", ex: ["I have money.", "আমার কাছে টাকা আছে।"] }
    ],
    pattern: {
      rows: [
        { en: "I have ___", bn: "আমার ___ আছে" },
        { en: "He has / She has ___", bn: "তার ___ আছে" }
      ],
      compare: { bn: [["আমার", "s"], ["একটা ফোন", "o"], ["আছে", "v"]], en: [["I", "s"], ["have", "v"], ["a phone", "o"]] },
      points: [
        "বাংলায় “আছে” শেষে বসে। ইংরেজিতে <b>have</b> বসে মাঝে।",
        "<b>I, You, We, They</b> → have। <b>He, She</b> → has।"
      ]
    },
    examples: [
      { en: "I have a phone.", bn: "আমার একটা ফোন আছে।" },
      { en: "I have a brother.", bn: "আমার একটা ভাই আছে।" },
      { en: "She has a sister.", bn: "তার একটা বোন আছে।" },
      { en: "He has a car.", bn: "তার একটা গাড়ি আছে।" },
      { en: "You have a nice bag.", bn: "তোমার একটা সুন্দর ব্যাগ আছে।" },
      { en: "We have money.", bn: "আমাদের কাছে টাকা আছে।" },
      { en: "I have two sisters.", bn: "আমার দুই বোন আছে।" },
      { en: "They have a big house.", bn: "তাদের একটা বড় বাড়ি আছে।" }
    ],
    fill: [
      { q: "I ___ a brother.", a: "have", opts: ["have", "has", "is"], bn: "আমার একটা ভাই আছে।" },
      { q: "She ___ a car.", a: "has", opts: ["have", "has", "am"], bn: "তার একটা গাড়ি আছে।" }
    ],
    story: {
      title: "My Brother and Sister", bn: "আমার ভাই আর বোন",
      lines: [
        { en: "I have a brother.", bn: "আমার একটা ভাই আছে।" },
        { en: "His name is Rafi.", bn: "তার নাম রাফি।" },
        { en: "I have a sister.", bn: "আমার একটা বোন আছে।" },
        { en: "Her name is Mim.", bn: "তার নাম মিম।" },
        { en: "We have a small house.", bn: "আমাদের একটা ছোট বাড়ি আছে।" }
      ]
    },
    write: { prompt: "তোমার কী কী আছে? একটা বাক্য লেখো", start: "I have ", hint: "I have a phone. / I have a sister." }
  },

  {
    id: 5, icon: "palette", title: "The bus is big", bn: "বাসটা বড়",
    hl: ["big", "small", "new", "old", "red", "hot", "cold"],
    words: [
      { en: "big", bn: "বড়", say: "বিগ", icon: "arrows-maximize", ex: ["The bus is big.", "বাসটা বড়।"] },
      { en: "small", bn: "ছোট", say: "স্মল", icon: "arrows-minimize", ex: ["My bag is small.", "আমার ব্যাগটা ছোট।"] },
      { en: "new", bn: "নতুন", say: "নিউ", icon: "sparkles", ex: ["I have a new phone.", "আমার একটা নতুন ফোন আছে।"] },
      { en: "old", bn: "পুরনো", say: "ওল্ড", icon: "hourglass", ex: ["This car is old.", "এই গাড়িটা পুরনো।"] },
      { en: "red", bn: "লাল", say: "রেড", icon: "palette", ex: ["The bus is red.", "বাসটা লাল।"] },
      { en: "hot", bn: "গরম", say: "হট", icon: "flame", ex: ["The tea is hot.", "চা-টা গরম।"] }
    ],
    pattern: {
      rows: [
        { en: "The ___ is big", bn: "___টা বড়" },
        { en: "a big bus", bn: "একটা বড় বাস" }
      ],
      compare: { bn: [["বাসটা", "s"], ["বড়", "o"]], en: [["The bus", "s"], ["is", "v"], ["big", "o"]] },
      points: [
        "“বাসটা” বোঝাতে ইংরেজিতে আগে <b>the</b> বসে: <b>the bus</b>।",
        "সুখবর! “কেমন” শব্দটা বাংলার মতোই আগে বসে: <b>a big bus</b> = একটা বড় বাস।",
        "জিনিস বোঝাতে <b>It</b> = এটা: <b>It is red.</b>"
      ]
    },
    examples: [
      { en: "The bus is big.", bn: "বাসটা বড়।" },
      { en: "My phone is new.", bn: "আমার ফোনটা নতুন।" },
      { en: "This is a red car.", bn: "এটা একটা লাল গাড়ি।" },
      { en: "The tea is hot.", bn: "চা-টা গরম।" },
      { en: "That truck is old.", bn: "ওই ট্রাকটা পুরনো।" },
      { en: "I have a small bag.", bn: "আমার একটা ছোট ব্যাগ আছে।" },
      { en: "It is very hot today.", bn: "আজ খুব গরম।" },
      { en: "The water is cold.", bn: "পানিটা ঠান্ডা।" }
    ],
    fill: [
      { q: "The tea ___ hot.", a: "is", opts: ["is", "am", "are"], bn: "চা-টা গরম।" },
      { q: "I have a ___ phone.", a: "new", opts: ["new", "is", "am"], bn: "আমার একটা নতুন ফোন আছে।" }
    ],
    story: {
      title: "My New Phone", bn: "আমার নতুন ফোন",
      lines: [
        { en: "I have a new phone.", bn: "আমার একটা নতুন ফোন আছে।" },
        { en: "It is red.", bn: "এটা লাল।" },
        { en: "It is small.", bn: "এটা ছোট।" },
        { en: "My old phone is big.", bn: "আমার পুরনো ফোনটা বড়।" },
        { en: "I am happy.", bn: "আমি খুশি।" }
      ]
    },
    write: { prompt: "তোমার একটা জিনিস কেমন, লেখো", start: "My phone is ", hint: "My phone is new. / My bag is small." }
  },

  {
    id: 6, icon: "cup", title: "I want tea", bn: "আমি চা চাই",
    hl: ["want", "to", "please"],
    words: [
      { en: "want", bn: "চাই / চাওয়া", say: "ওয়ান্ট", icon: "heart", ex: ["I want water.", "আমি পানি চাই।"] },
      { en: "water", bn: "পানি", say: "ওয়াটার", icon: "droplet", ex: ["Water, please.", "পানি দিন, প্লিজ।"] },
      { en: "tea", bn: "চা", say: "টি", icon: "cup", ex: ["I want tea.", "আমি চা চাই।"] },
      { en: "rice", bn: "ভাত", say: "রাইস", icon: "bowl-chopsticks", ex: ["I want rice and fish.", "আমি ভাত আর মাছ চাই।"] },
      { en: "go", bn: "যাওয়া", say: "গো", icon: "walk", ex: ["I want to go.", "আমি যেতে চাই।"] },
      { en: "home", bn: "বাসা / বাড়ি", say: "হোম", icon: "home", ex: ["I want to go home.", "আমি বাসায় যেতে চাই।"] }
    ],
    pattern: {
      rows: [
        { en: "I want ___", bn: "আমি ___ চাই" },
        { en: "I want to go ___", bn: "আমি ___ যেতে চাই" }
      ],
      compare: { bn: [["আমি", "s"], ["পানি", "o"], ["চাই", "v"]], en: [["I", "s"], ["want", "v"], ["water", "o"]] },
      points: [
        "বাংলায় “চাই” শেষে বসে। ইংরেজিতে <b>want</b> বসে <b>I</b> এর ঠিক পরে।",
        "কিছু করতে চাইলে: <b>want to</b> + কাজ → <b>I want to go.</b>",
        "ভদ্রভাবে চাইতে শেষে বলো <b>please</b> (প্লিজ)।"
      ]
    },
    examples: [
      { en: "I want water.", bn: "আমি পানি চাই।" },
      { en: "Tea, please.", bn: "চা দিন, প্লিজ।" },
      { en: "I want rice.", bn: "আমি ভাত চাই।" },
      { en: "I want to go home.", bn: "আমি বাসায় যেতে চাই।" },
      { en: "We want water.", bn: "আমরা পানি চাই।" },
      { en: "I want a new phone.", bn: "আমি একটা নতুন ফোন চাই।" },
      { en: "I want to sleep.", bn: "আমি ঘুমাতে চাই।" },
      { en: "I want to learn English.", bn: "আমি ইংরেজি শিখতে চাই।" }
    ],
    fill: [
      { q: "I ___ water.", a: "want", opts: ["want", "am", "is"], bn: "আমি পানি চাই।" },
      { q: "I want to ___ home.", a: "go", opts: ["go", "have", "is"], bn: "আমি বাসায় যেতে চাই।" }
    ],
    story: {
      title: "At the Tea Stall", bn: "চায়ের দোকানে",
      lines: [
        { en: "It is hot today.", bn: "আজ অনেক গরম।" },
        { en: "I want water.", bn: "আমি পানি চাই।" },
        { en: "I want tea too.", bn: "আমি চা-ও চাই।" },
        { en: "Tea, please!", bn: "চা দিন, প্লিজ!" },
        { en: "Now I am happy.", bn: "এখন আমি খুশি।" }
      ]
    },
    write: { prompt: "তুমি এখন কী চাও? লেখো", start: "I want ", hint: "I want tea. / I want to go home." }
  },

  {
    id: 7, icon: "tools-kitchen-2", title: "I eat rice", bn: "আমি ভাত খাই",
    hl: ["eat", "drink", "work", "sleep", "read", "play", "go"],
    words: [
      { en: "eat", bn: "খাওয়া", say: "ইট", icon: "tools-kitchen-2", ex: ["I eat rice.", "আমি ভাত খাই।"] },
      { en: "drink", bn: "পান করা (চা, পানি)", say: "ড্রিংক", icon: "glass", ex: ["I drink water.", "আমি পানি খাই।"] },
      { en: "work", bn: "কাজ করা", say: "ওয়ার্ক", icon: "briefcase", ex: ["I work every day.", "আমি প্রতিদিন কাজ করি।"] },
      { en: "sleep", bn: "ঘুমানো", say: "স্লিপ", icon: "bed", ex: ["I sleep at night.", "আমি রাতে ঘুমাই।"] },
      { en: "read", bn: "পড়া", say: "রিড", icon: "book", ex: ["I read the news.", "আমি খবর পড়ি।"] },
      { en: "play", bn: "খেলা", say: "প্লে", icon: "ball-football", ex: ["We play football.", "আমরা ফুটবল খেলি।"] }
    ],
    pattern: {
      rows: [{ en: "I + কাজ + কী", bn: "আমি + কী + কাজ" }],
      compare: { bn: [["আমি", "s"], ["ভাত", "o"], ["খাই", "v"]], en: [["I", "s"], ["eat", "v"], ["rice", "o"]] },
      points: [
        "এটাই ইংরেজির সবচেয়ে বড় নিয়ম! বাংলায় কাজটা শেষে বসে, ইংরেজিতে <b>মাঝে</b>।",
        "মনে রাখো: <b>কে → কী করে → কী</b>। I → eat → rice।",
        "বাংলায় চা “খাই” বলি, কিন্তু ইংরেজিতে পানীয়র জন্য <b>drink</b>।"
      ]
    },
    examples: [
      { en: "I eat rice.", bn: "আমি ভাত খাই।" },
      { en: "I drink tea.", bn: "আমি চা খাই।" },
      { en: "I work every day.", bn: "আমি প্রতিদিন কাজ করি।" },
      { en: "We play football.", bn: "আমরা ফুটবল খেলি।" },
      { en: "I sleep at night.", bn: "আমি রাতে ঘুমাই।" },
      { en: "You read a book.", bn: "তুমি একটা বই পড়ো।" },
      { en: "I go to work.", bn: "আমি কাজে যাই।" },
      { en: "They eat fish.", bn: "তারা মাছ খায়।" }
    ],
    fill: [
      { q: "I ___ rice.", a: "eat", opts: ["eat", "drink", "sleep"], bn: "আমি ভাত খাই।" },
      { q: "I drink ___.", a: "tea", opts: ["tea", "rice", "bus"], bn: "আমি চা খাই।" }
    ],
    story: {
      title: "My Day", bn: "আমার দিন",
      lines: [
        { en: "I work every day.", bn: "আমি প্রতিদিন কাজ করি।" },
        { en: "I eat rice.", bn: "আমি ভাত খাই।" },
        { en: "I drink tea.", bn: "আমি চা খাই।" },
        { en: "I play football.", bn: "আমি ফুটবল খেলি।" },
        { en: "I sleep at night.", bn: "আমি রাতে ঘুমাই।" }
      ]
    },
    write: { prompt: "তুমি প্রতিদিন কী করো? লেখো", start: "I ", hint: "I eat rice. / I drink tea. / I work every day." }
  },

  {
    id: 8, icon: "chef-hat", title: "He eats rice", bn: "সে ভাত খায়",
    hl: ["eats", "cooks", "drives", "goes", "drinks", "plays", "sleeps", "works"],
    words: [
      { en: "every day", bn: "প্রতিদিন", say: "এভরি ডে", icon: "calendar", ex: ["She cooks every day.", "সে প্রতিদিন রান্না করে।"] },
      { en: "morning", bn: "সকাল", say: "মর্নিং", icon: "sunrise", ex: ["Good morning!", "শুভ সকাল!"] },
      { en: "night", bn: "রাত", say: "নাইট", icon: "moon", ex: ["Good night!", "শুভ রাত্রি!"] },
      { en: "office", bn: "অফিস", say: "অফিস", icon: "building", ex: ["He goes to the office.", "সে অফিসে যায়।"] },
      { en: "drive", bn: "গাড়ি চালানো", say: "ড্রাইভ", icon: "steering-wheel", ex: ["My father drives a bus.", "আমার বাবা বাস চালায়।"] },
      { en: "cook", bn: "রান্না করা", say: "কুক", icon: "chef-hat", ex: ["My mother cooks rice.", "আমার মা ভাত রান্না করে।"] }
    ],
    pattern: {
      rows: [
        { en: "I eat → He eats", bn: "আমি খাই → সে খায়" },
        { en: "I go → She goes", bn: "আমি যাই → সে যায়" }
      ],
      compare: { bn: [["সে", "s"], ["ভাত", "o"], ["খায়", "v"]], en: [["He", "s"], ["eats", "v"], ["rice", "o"]] },
      points: [
        "<b>He, She</b> বা একজনের নাম থাকলে কাজের শেষে <b>s</b> যোগ হয়: eat → <b>eats</b>।",
        "বাংলাতেও বদলায়: আমি খাই → সে খায়। ঠিক একই রকম!",
        "go → <b>goes</b> (গোজ)।"
      ]
    },
    examples: [
      { en: "He eats rice.", bn: "সে ভাত খায়।" },
      { en: "She cooks every day.", bn: "সে প্রতিদিন রান্না করে।" },
      { en: "My father drives a bus.", bn: "আমার বাবা বাস চালায়।" },
      { en: "He goes to the office.", bn: "সে অফিসে যায়।" },
      { en: "She drinks tea in the morning.", bn: "সে সকালে চা খায়।" },
      { en: "Rafi plays football.", bn: "রাফি ফুটবল খেলে।" },
      { en: "She works in an office.", bn: "সে একটা অফিসে কাজ করে।" },
      { en: "He sleeps at night.", bn: "সে রাতে ঘুমায়।" }
    ],
    fill: [
      { q: "He ___ rice.", a: "eats", opts: ["eat", "eats"], bn: "সে ভাত খায়।" },
      { q: "I ___ tea.", a: "drink", opts: ["drink", "drinks"], bn: "আমি চা খাই।" }
    ],
    story: {
      title: "Rafi's Day", bn: "রাফির দিন",
      lines: [
        { en: "Rafi is my brother.", bn: "রাফি আমার ভাই।" },
        { en: "He drives a truck.", bn: "সে ট্রাক চালায়।" },
        { en: "He goes to work in the morning.", bn: "সে সকালে কাজে যায়।" },
        { en: "He eats rice at night.", bn: "সে রাতে ভাত খায়।" },
        { en: "He sleeps at eleven.", bn: "সে এগারোটায় ঘুমায়।" }
      ]
    },
    write: { prompt: "পরিবারের কেউ প্রতিদিন কী করে? লেখো", start: "My mother ", hint: "My mother cooks rice. / My brother drives a car." }
  },

  {
    id: 9, icon: "ban", title: "I don't like milk", bn: "আমি দুধ পছন্দ করি না",
    hl: ["don't", "doesn't", "not"],
    words: [
      { en: "like", bn: "পছন্দ করা", say: "লাইক", icon: "thumb-up", ex: ["I like tea.", "আমি চা পছন্দ করি।"] },
      { en: "don't", bn: "না (I, you, we এর সাথে)", say: "ডোন্ট", icon: "ban", ex: ["I don't know.", "আমি জানি না।"] },
      { en: "doesn't", bn: "না (he, she এর সাথে)", say: "ডাজন্ট", icon: "circle-minus", ex: ["She doesn't eat fish.", "সে মাছ খায় না।"] },
      { en: "not", bn: "না", say: "নট", icon: "x", ex: ["I am not tired.", "আমি ক্লান্ত না।"] },
      { en: "milk", bn: "দুধ", say: "মিল্ক", icon: "milk", ex: ["I don't like milk.", "আমি দুধ পছন্দ করি না।"] },
      { en: "fish", bn: "মাছ", say: "ফিশ", icon: "fish", ex: ["I like fish.", "আমি মাছ পছন্দ করি।"] }
    ],
    pattern: {
      rows: [
        { en: "I don't + কাজ", bn: "আমি ... করি না" },
        { en: "He doesn't + কাজ", bn: "সে ... করে না" },
        { en: "I am not ___", bn: "আমি ___ না" }
      ],
      compare: { bn: [["আমি", "s"], ["দুধ", "o"], ["পছন্দ করি না", "v"]], en: [["I", "s"], ["don't like", "v"], ["milk", "o"]] },
      points: [
        "বাংলায় “না” শেষে বসে। ইংরেজিতে <b>don't</b> বসে কাজের আগে।",
        "<b>He / She</b> হলে <b>doesn't</b>। তখন কাজে আর s লাগে না: He doesn't <b>eat</b>।",
        "am / is / are থাকলে শুধু <b>not</b>: I am <b>not</b> tired।"
      ]
    },
    examples: [
      { en: "I like fish.", bn: "আমি মাছ পছন্দ করি।" },
      { en: "I don't like milk.", bn: "আমি দুধ পছন্দ করি না।" },
      { en: "He doesn't drink tea.", bn: "সে চা খায় না।" },
      { en: "She doesn't drive.", bn: "সে গাড়ি চালায় না।" },
      { en: "I am not tired.", bn: "আমি ক্লান্ত না।" },
      { en: "This is not my bag.", bn: "এটা আমার ব্যাগ না।" },
      { en: "I don't know.", bn: "আমি জানি না।" },
      { en: "We don't work on Friday.", bn: "আমরা শুক্রবারে কাজ করি না।" }
    ],
    fill: [
      { q: "I ___ like milk.", a: "don't", opts: ["don't", "doesn't", "not"], bn: "আমি দুধ পছন্দ করি না।" },
      { q: "He ___ drink tea.", a: "doesn't", opts: ["don't", "doesn't", "not"], bn: "সে চা খায় না।" }
    ],
    story: {
      title: "Food We Like", bn: "আমাদের পছন্দের খাবার",
      lines: [
        { en: "I like rice and fish.", bn: "আমি ভাত আর মাছ পছন্দ করি।" },
        { en: "I don't like milk.", bn: "আমি দুধ পছন্দ করি না।" },
        { en: "My sister likes milk.", bn: "আমার বোন দুধ পছন্দ করে।" },
        { en: "She doesn't like fish.", bn: "সে মাছ পছন্দ করে না।" },
        { en: "We all like tea!", bn: "আমরা সবাই চা পছন্দ করি!" }
      ]
    },
    write: { prompt: "তুমি কী পছন্দ করো না? লেখো", start: "I don't like ", hint: "I don't like milk. / I don't like hot tea." }
  },

  {
    id: 10, icon: "help-circle", title: "Do you like tea?", bn: "তুমি কি চা পছন্দ করো?",
    hl: ["Do", "Does", "Are", "Is", "Yes", "No"],
    words: [
      { en: "do", bn: "প্রশ্ন শুরু (I, you, we)", say: "ডু", icon: "question-mark", ex: ["Do you like tea?", "তুমি কি চা পছন্দ করো?"] },
      { en: "does", bn: "প্রশ্ন শুরু (he, she)", say: "ডাজ", icon: "help-circle", ex: ["Does he work here?", "সে কি এখানে কাজ করে?"] },
      { en: "yes", bn: "হ্যাঁ", say: "ইয়েস", icon: "circle-check", ex: ["Yes, I do.", "হ্যাঁ, করি।"] },
      { en: "no", bn: "না", say: "নো", icon: "circle-x", ex: ["No, I don't.", "না, করি না।"] },
      { en: "know", bn: "জানা / চেনা", say: "নো", icon: "brain", ex: ["Do you know him?", "তুমি কি তাকে চেনো?"] },
      { en: "understand", bn: "বোঝা", say: "আন্ডারস্ট্যান্ড", icon: "bulb", ex: ["I understand.", "আমি বুঝেছি।"] }
    ],
    pattern: {
      rows: [
        { en: "Do you ___?", bn: "তুমি কি ___?" },
        { en: "Yes, I do. / No, I don't.", bn: "হ্যাঁ। / না।" },
        { en: "Are you ___?", bn: "তুমি কি ___?" }
      ],
      compare: { bn: [["তুমি কি", "s"], ["চা", "o"], ["পছন্দ করো?", "v"]], en: [["Do", "q"], ["you", "s"], ["like", "v"], ["tea?", "o"]] },
      points: [
        "বাংলায় প্রশ্নে “কি” যোগ করি। ইংরেজিতে একদম শুরুতে <b>Do</b> বসাই।",
        "<b>He / She</b> হলে <b>Does</b>: Does he drive?",
        "am / is / are থাকলে শুধু জায়গা বদলাও: You are tired → <b>Are you tired?</b>"
      ]
    },
    examples: [
      { en: "Do you like tea?", bn: "তুমি কি চা পছন্দ করো?" },
      { en: "Yes, I do.", bn: "হ্যাঁ, করি।" },
      { en: "Do you understand?", bn: "তুমি কি বুঝতে পারছ?" },
      { en: "Do you know Rafi?", bn: "তুমি কি রাফিকে চেনো?" },
      { en: "Does he drive a bus?", bn: "সে কি বাস চালায়?" },
      { en: "Are you tired?", bn: "তুমি কি ক্লান্ত?" },
      { en: "Does she cook?", bn: "সে কি রান্না করে?" },
      { en: "Is he your brother?", bn: "সে কি তোমার ভাই?" }
    ],
    fill: [
      { q: "___ you like fish?", a: "Do", opts: ["Do", "Does", "Is"], bn: "তুমি কি মাছ পছন্দ করো?" },
      { q: "___ she cook?", a: "Does", opts: ["Do", "Does", "Are"], bn: "সে কি রান্না করে?" }
    ],
    story: {
      title: "Tea Stall Talk", bn: "চায়ের দোকানে কথা",
      lines: [
        { en: "Do you like tea?", bn: "তুমি কি চা পছন্দ করো?" },
        { en: "Yes, I do.", bn: "হ্যাঁ, করি।" },
        { en: "Do you like milk tea?", bn: "তুমি কি দুধ চা পছন্দ করো?" },
        { en: "No, I don't.", bn: "না, করি না।" },
        { en: "Okay! Tea, no milk.", bn: "ঠিক আছে! চা, দুধ ছাড়া।" }
      ]
    },
    write: { prompt: "বন্ধুকে একটা প্রশ্ন করো", start: "Do you ", hint: "Do you like tea? / Do you play football?" }
  },

  {
    id: 11, icon: "map-pin", title: "Where is the bus?", bn: "বাস কোথায়?",
    hl: ["What", "Where", "Who", "When"],
    words: [
      { en: "what", bn: "কী", say: "হোয়াট", icon: "message-circle-question", ex: ["What is this?", "এটা কী?"] },
      { en: "where", bn: "কোথায়", say: "হোয়্যার", icon: "map-pin", ex: ["Where is my phone?", "আমার ফোন কোথায়?"] },
      { en: "who", bn: "কে", say: "হু", icon: "user-question", ex: ["Who is she?", "সে কে?"] },
      { en: "when", bn: "কখন", say: "হোয়েন", icon: "clock", ex: ["When do you eat?", "তুমি কখন খাও?"] },
      { en: "here", bn: "এখানে", say: "হিয়ার", icon: "current-location", ex: ["I am here.", "আমি এখানে।"] },
      { en: "there", bn: "ওখানে", say: "দেয়ার", icon: "arrow-up-right", ex: ["The bus is there.", "বাস ওখানে।"] }
    ],
    pattern: {
      rows: [
        { en: "Where is ___?", bn: "___ কোথায়?" },
        { en: "What is ___?", bn: "___ কী?" },
        { en: "Where do you ___?", bn: "তুমি কোথায় ___?" }
      ],
      compare: { bn: [["বাস", "s"], ["কোথায়?", "q"]], en: [["Where", "q"], ["is", "v"], ["the bus?", "s"]] },
      points: [
        "প্রশ্নের শব্দ (<b>What, Where, Who, When</b>) সবসময় একদম শুরুতে বসে।",
        "বাংলায় এগুলো মাঝে বা শেষে বসে: বাস কোথায়? → <b>Where is the bus?</b>"
      ]
    },
    examples: [
      { en: "What is your name?", bn: "তোমার নাম কী?" },
      { en: "Where is the bus?", bn: "বাস কোথায়?" },
      { en: "The bus is there.", bn: "বাস ওখানে।" },
      { en: "Who is he?", bn: "সে কে?" },
      { en: "When do you go home?", bn: "তুমি কখন বাসায় যাও?" },
      { en: "Where do you work?", bn: "তুমি কোথায় কাজ করো?" },
      { en: "What is this?", bn: "এটা কী?" },
      { en: "What do you want?", bn: "তুমি কী চাও?" }
    ],
    fill: [
      { q: "___ is your name?", a: "What", opts: ["What", "Where", "Who"], bn: "তোমার নাম কী?" },
      { q: "___ is the bus? It is there.", a: "Where", opts: ["What", "Where", "Who"], bn: "বাস কোথায়? ওটা ওখানে।" }
    ],
    story: {
      title: "At the Bus Stand", bn: "বাস স্ট্যান্ডে",
      lines: [
        { en: "Where is the bus to Mirpur?", bn: "মিরপুরের বাস কোথায়?" },
        { en: "It is there.", bn: "ওটা ওখানে।" },
        { en: "When does it go?", bn: "এটা কখন ছাড়ে?" },
        { en: "At five o'clock.", bn: "পাঁচটায়।" },
        { en: "Thank you!", bn: "ধন্যবাদ!" }
      ]
    },
    write: { prompt: "কাউকে একটা প্রশ্ন করো", start: "Where is ", hint: "Where is the bus? / Where is my phone?" }
  },

  {
    id: 12, icon: "barbell", title: "I can speak English", bn: "আমি ইংরেজি বলতে পারি",
    hl: ["can", "can't", "Can"],
    words: [
      { en: "can", bn: "পারা", say: "ক্যান", icon: "barbell", ex: ["I can drive.", "আমি গাড়ি চালাতে পারি।"] },
      { en: "can't", bn: "পারি না", say: "ক্যান্ট", icon: "barbell-off", ex: ["I can't swim.", "আমি সাঁতার কাটতে পারি না।"] },
      { en: "help", bn: "সাহায্য করা", say: "হেল্প", icon: "heart-handshake", ex: ["Can you help me?", "তুমি কি আমাকে সাহায্য করতে পারো?"] },
      { en: "speak", bn: "বলা (ভাষা)", say: "স্পিক", icon: "speakerphone", ex: ["I can speak Bangla.", "আমি বাংলা বলতে পারি।"] },
      { en: "swim", bn: "সাঁতার কাটা", say: "সুইম", icon: "swimming", ex: ["He can swim.", "সে সাঁতার কাটতে পারে।"] },
      { en: "English", bn: "ইংরেজি", say: "ইংলিশ", icon: "language", ex: ["I am learning English.", "আমি ইংরেজি শিখছি।"] }
    ],
    pattern: {
      rows: [
        { en: "I can + কাজ", bn: "আমি ... পারি" },
        { en: "I can't + কাজ", bn: "আমি ... পারি না" },
        { en: "Can you ___?", bn: "তুমি কি ___ পারো?" }
      ],
      compare: { bn: [["আমি", "s"], ["গাড়ি", "o"], ["চালাতে পারি", "v"]], en: [["I", "s"], ["can drive", "v"], ["a car", "o"]] },
      points: [
        "<b>can</b> এর পরে কাজটা একদম সাধারণ থাকে। He can <b>drive</b> (drives নয়)।",
        "প্রশ্ন করতে <b>Can</b> শুরুতে আনো: <b>Can you help me?</b>"
      ]
    },
    examples: [
      { en: "I can drive a car.", bn: "আমি গাড়ি চালাতে পারি।" },
      { en: "I can speak English a little.", bn: "আমি একটু ইংরেজি বলতে পারি।" },
      { en: "He can swim.", bn: "সে সাঁতার কাটতে পারে।" },
      { en: "I can't swim.", bn: "আমি সাঁতার কাটতে পারি না।" },
      { en: "Can you help me?", bn: "তুমি কি আমাকে সাহায্য করতে পারো?" },
      { en: "Yes, I can.", bn: "হ্যাঁ, পারি।" },
      { en: "I can speak Bangla.", bn: "আমি বাংলা বলতে পারি।" },
      { en: "Can you speak slowly?", bn: "তুমি কি ধীরে বলতে পারো?" }
    ],
    fill: [
      { q: "He can ___ a car.", a: "drive", opts: ["drive", "drives"], bn: "সে গাড়ি চালাতে পারে।" },
      { q: "___ you help me?", a: "Can", opts: ["Can", "Is", "Does"], bn: "তুমি কি আমাকে সাহায্য করতে পারো?" }
    ],
    story: {
      title: "I Am Learning", bn: "আমি শিখছি",
      lines: [
        { en: "I am Sizan.", bn: "আমি সিজান।" },
        { en: "I can speak English a little.", bn: "আমি একটু ইংরেজি বলতে পারি।" },
        { en: "I can read small sentences.", bn: "আমি ছোট ছোট বাক্য পড়তে পারি।" },
        { en: "I learn every day.", bn: "আমি প্রতিদিন শিখি।" },
        { en: "I am happy!", bn: "আমি খুশি!" }
      ]
    },
    write: { prompt: "তুমি কী কী পারো? লেখো", start: "I can ", hint: "I can drive. / I can speak English a little." }
  }
];
