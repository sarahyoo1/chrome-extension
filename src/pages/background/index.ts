import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { Actions } from "../enums";
import { parseCustomToken } from "../service";
import { auth } from "@src/libs/firebase";

const domain = import.meta.env.VITE_WEBAPP_ORIGIN;

console.log('background script loaded');

chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true});

//communicate within the extension
// chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
//   const action = req.action;
//   switch (action) {
//     case Actions.handleAuth: 
//       chrome.tabs.onUpdated.removeListener(parseCustomToken);
//       chrome.tabs.create({
//         url: `${domain}/signup?via_extension`,
//         active: true
//       })
//       .then((tab) => {
//         chrome.tabs.onUpdated.addListener(parseCustomToken);
//         sendRes(req.action + " excuted.");
//       });
//       break;
//   }
// });

//gets log in request from web app
chrome.runtime.onMessageExternal.addListener((token, sender, sendRes) => {
  signInWithCustomToken(auth, token)
  .catch((e) => {
    console.error(e);
  })
  return true;
});

//detects user state change
onAuthStateChanged(auth, (user) => {
  console.log(`User state changed ${user}`);
});

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
  });
}