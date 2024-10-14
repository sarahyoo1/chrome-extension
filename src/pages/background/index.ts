import { auth } from "@src/libs/firebase";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";


console.log('background script loaded');

export async function get_current_tab_id () {
  return new Promise<number|undefined>((resolve) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length == 0) {
            resolve(undefined);
        } else {
            resolve(tabs[0].id);
        }
    });
  });    
}

export function open_as_side_panel() {
  get_current_tab_id().then((tab_id) => {
    if (typeof tab_id != "number") return;
    chrome.sidePanel.open({windowId: tab_id});
  })
}

chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true});

export function getGoogleAuthCredential() {

  return new Promise<ReturnType<typeof GoogleAuthProvider.credential>>((resolve, reject) => {
    chrome.identity.getAuthToken({interactive: true}, (token) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      }
      const credential = GoogleAuthProvider.credential(null, token);
      resolve(credential);
    });
  });
}

export async function signIn() {
  try {
    const credential = await getGoogleAuthCredential();
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (e) {
    console.error(e);
    return null;
  }
}