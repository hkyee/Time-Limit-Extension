document.getElementById("save").addEventListener("click", () => {
  let site = document.getElementById("site").value;
  let minutes = parseInt(document.getElementById("minutes").value);

  chrome.runtime.sendMessage({ message: "startTime" });

  // This block sets limits in chrome.storage
  if (site && minutes > 0) {
    chrome.storage.sync.get(["limits"], (data) => {
      let limits = data.limits || {};
      limits[site] = minutes;
      chrome.storage.sync.set({ limits });
      // Updates the list seen in the popup window
      updateList();
    });
  }
});

// Chrome does not allow onclick()
// function toggleColor() {
//   document.getElementById("save").classList.toggle("save-active");
// }

document.getElementById("save").addEventListener("mousedown", (event) => {
  event.target.style.backgroundColor = "#8ec07c";
});

document.getElementById("save").addEventListener("mouseup", (event) => {
  event.target.style.backgroundColor = "";
});

function updateList() {
  chrome.storage.sync.get(["limits"], (data) => {
    chrome.storage.local.get(["sites"], (sitesData) => {
      let limitList = document.getElementById("limitList");
      limitList.innerHTML = "";
      for (let site in data.limits) {
        let removeBtn = document.createElement("button");
        let img = document.createElement("img");
        img.src = "static/minus-button.png";
        img.alt = "Remove";
        img.height = 15;
        img.width = 15;
        img.classList.add("minus-btn");

        removeBtn.appendChild(img);

        let li = document.createElement("li");
        let span = document.createElement("span");
        span.textContent = `${site}: ${data.limits[site]} minutes`;
        span.style.flex = "1"; // Makes the text take available space
        span.style.textAlign = "center";

        li.appendChild(removeBtn);
        li.appendChild(span);
        li.style.width = "100%";
        li.style.display = "flex";
        li.style.alignItems = "center";
        li.style.justifyContent = "center";

        li.style.height = "30px";
        li.classList.add("limit-lists");
        limitList.appendChild(li);

        // Removes item when clicked minus button
        removeBtn.addEventListener("click", () => {
          li.remove();
          delete sitesData.sites[site];
          delete data.limits[site];
          // Update the sites in chrome storage
          chrome.storage.local.set({ sites: sitesData.sites }, () => {
            console.log("Updated sites with deleted sites");
          });
          // Update the limits in chrome storage
          chrome.storage.sync.set({ limits: data.limits });
        });
      }
    });
  });
}

// This function ensures that the list is updated with chrome.storage
updateList();
