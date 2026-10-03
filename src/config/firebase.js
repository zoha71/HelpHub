import fs from "fs";
import path from "path";

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Local development:
//   src/config/helphub-71.json
//
// Render deployment:
//   helphub-71.json
const localPath = path.join(
    process.cwd(),
    "src",
    "config",
    "helphub-71.json"
);

const renderPath = path.join(
    process.cwd(),
    "helphub-71.json"
);

const serviceAccountPath = fs.existsSync(localPath)
    ? localPath
    : renderPath;

const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
);

const firebaseApp = initializeApp({
    credential: cert(serviceAccount)
});

const auth = getAuth(firebaseApp);

export default auth;