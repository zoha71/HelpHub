import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "./helphub-71.json" with { type: "json" };

const firebaseApp = initializeApp({
    credential: cert(serviceAccount)
});

const auth = getAuth(firebaseApp);

export default auth;