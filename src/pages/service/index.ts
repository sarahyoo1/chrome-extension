import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@src/libs/firebase";
import { Actions } from "../enums";

const domain = import.meta.env.VITE_WEBAPP_ORIGIN;
const keys = {
  storageToken : 'authCustomToken',
}

export function authHandler() {
    chrome.runtime.sendMessage({action: Actions.handleAuth});
  }
  
export async function triggerLoginAction() {
    initAuth();
}
  
export async function signOut() {
    await removeItemFromStorage(keys.storageToken);
    await auth.signOut();
}

async function initAuth() {
  const token = await getItemFromStorage(keys.storageToken);
  if (!token) {
    await auth.signOut();
  } else {
    const user = auth.currentUser;
    if (!user) {
      try {
        await signInWithCustomToken(auth, token);
      } catch (e) {
        if (e && e.code === "auth/invalid-custom-token") {
          await removeItemFromStorage(keys.storageToken);
        }
      }
    }
  }
}

export async function parseCustomToken (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
  if (tab.status === "complete") {
    if (!tab.url) return;
    const url = new URL(tab.url);
    
    if (url.origin === domain) {
      const params = new URL(url.href).searchParams;
      const customToken = params.get("custom_token");
      if (customToken) {
        console.log("custom token found", customToken);
        await chrome.storage.sync.set({
          [keys.storageToken]: customToken
        });

        chrome.tabs.onUpdated.removeListener(parseCustomToken);
      }
    }
  }
}

async function getItemFromStorage(key: string) : Promise<string|null> {
  const response = await chrome.storage.sync.get(key);
  if (response[key]) {
    return response[key];
  }
  return null;
}

async function removeItemFromStorage(key: string) : Promise<void> {
  await chrome.storage.sync.remove(key);
}