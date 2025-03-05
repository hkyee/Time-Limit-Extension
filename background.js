let sites = {}; // Creates an object called sites to store
// key: hostname value: time in hostname
let limits = {}; // Creates an object called limits to store
// key: hostname value: time limits
let activeTab = null;
let startTime = null;
let previousElapsedTime = null;

// Load saved limits from storage, which is saved using chrome.storage.sync.set()

function updateLimits() {
  chrome.storage.sync.get(["limits"], (data) => {
    // if data.limits exists, assign data.limits to "limits" object
    limits = data.limits || {};
  });
}

function updateSites() {
  chrome.storage.local.get(["sites"], (sitesData) => {
    sites = sitesData.sites || {};
  });
}

// updateLimits();
// updateSites();

// Listen for tab updates (to track active tab)
chrome.tabs.onActivated.addListener(({ tabId }) => {
  console.log("Switched to tab: ", tabId);
  activeTab = tabId; // Updates the activeTab
  startTime = Date.now(); // Set startTime to the current time after switching to a new tab
  // Resets previousElapsedTime
  previousElapsedTime = null;
  // trackTime();
});

// When updating an existing tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTab && changeInfo.status === "complete") {
    // Resets previousElapsedTime
    // This needs to be earlier because trackTime might run with previousElapsedTime not equals to null (writing the time spent on previous site onto new site, then refering it later, instead of refering then write)
    previousElapsedTime = null;
    console.log("Updated tab:", tab.url);
    startTime = Date.now();
    // trackTime();
  }
});

// Reset startTime when save is clicked in popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.message === "startTime") {
    startTime = Date.now();
    previousElapsedTime = null;
    console.log("StartTime reset");
  }
});

// Track time spent on active tab
function trackTime() {
  // Update the limits from chrome.storage everytime function is run
  updateLimits();
  updateSites();
  if (activeTab && startTime) {
    chrome.tabs.get(activeTab, (tab) => {
      if (tab && tab.url) {
        let hostname = new URL(tab.url).hostname;
        chrome.storage.local.get(["sites"], (data) => {
          sites = data.sites || {};
          // Should track time only for those sites that are in limits
          if (hostname in limits) {
            updateSites();
            if (previousElapsedTime == null) {
              // This line will only run once everytime you switch tabs or update a tab.
              // When a tab was never opened before, previousElapsedTime = 0
              previousElapsedTime = sites?.[hostname] || 0;
            }
            let elapsedTime = Math.floor((Date.now() - startTime) / 1000); // in seconds
            // We check if the hostname exist in the sites object
            if (isNaN(sites[hostname]) || Object.keys(sites).length === 0) {
              // if hostname was not in sites before, create it and assign it as 0
              sites[hostname] = 0;
            } else {
              sites[hostname] = previousElapsedTime + elapsedTime;
            }
            chrome.storage.local.set({ sites: sites });
            updateSites();

            console.log(`ElapsedTime : ${elapsedTime}`);
            console.log(`PreviousET : ${previousElapsedTime}`);

            // Must be called like this because asynchronus, the callback function executes after getting data
            // same as updateSites()
            // chrome.storage.local.get(["sites"], (data) => {
            //   sites = data.sites;
            //   chrome.storage.local.set({ sites: sites });
            // });
            // updateSites();
            // Check if hostname exist in site before setting it
            // if (hostname in sites) {
            //   chrome.storage.local.set({ sites: sites });
            // }
            // Prevents oscillating site times
            updateSites();

            // Block site if time exceeded
            if (limits[hostname] && sites[hostname] >= limits[hostname] * 60) {
              let blockedPage = chrome.runtime.getURL("blocked.html");
              chrome.tabs.update(activeTab, { url: blockedPage });
            }
          }
          console.log(
            `Time on ${hostname}: ${sites[hostname]} seconds, Limit: ${limits[hostname]} minute(s)`,
          );
          console.log(limits);
          console.log(sites);
        });
      }
    });
  }
}

// To reset sites object everyday at 12 am.
chrome.alarms.create("resetTime", {
  when: getNextMidnight(),
  periodInMinutes: 1440, // Repeat every day
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "resetTime") {
    resetSiteTimes();
  }
});

function getNextMidnight() {
  let midnight = new Date(); // Gets the current day and time
  midnight.setDate(midnight.getDate() + 1); // Moves to next day
  midnight.setHours(0, 0, 0, 0); // Set to 12 AM
}

function resetSiteTimes() {
  sites = {};
  chrome.storage.local.set({ sites });
}

// Runs trackTime every 10 seconds
setInterval(trackTime, 1000);
