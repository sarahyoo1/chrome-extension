
console.log('background script loaded');

export async function get_current_tab_id () : Promise<number|undefined> {
  return new Promise((resolve) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs.length == 0) {
            resolve(undefined);
        } else {
            resolve(tabs[0].id);
        }
    });
  });    
}
