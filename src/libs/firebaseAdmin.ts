import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { adminCredentials } from "./firebase-config";
import { getAuth } from "firebase-admin/auth";

const adminApp = getApps().length === 0 ? initializeApp(adminCredentials) : getApp();
export const authAdmin = getAuth(adminApp);