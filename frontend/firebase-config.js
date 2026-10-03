import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import { getAuth } from
    "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCbtaU1VXtu6bptYNYCD7GGIVrcksFRKos",
  authDomain: "helphub-71.firebaseapp.com",
  projectId: "helphub-71",
  storageBucket: "helphub-71.firebasestorage.app",
  messagingSenderId: "491260122300",
  appId: "1:491260122300:web:ea1b67b13690b1269facb9",

};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };