import { getRandomAtmosphere } from "./atmosphere.js";
import { Companion } from "./companion.js";

const companion = new Companion();

const btnWalk = document.getElementById("btn-walk");
const btnRun = document.getElementById("btn-run");
const atmosphereIcon = document.getElementById("atmosphere-icon");
const atmosphereLabel = document.getElementById("atmosphere-label");
const statusText = document.getElementById("status-text");
const paceEl = document.getElementById("pace");

let currentAtmosphere = getRandomAtmosphere();
updateAtmosphereDisplay(currentAtmosphere);

function updateAtmosphereDisplay(atm) {
  atmosphereIcon.textContent = atm.icon;
  atmosphereLabel.textContent = atm.name;
}

function updateStatus() {
  const status = companion.getStatus();
  if (status.mode === "idle") {
    statusText.textContent = "Ready to explore";
    paceEl.textContent = "";
  } else {
    statusText.textContent = `${status.mode === "walking" ? "Walking" : "Running"} for ${status.duration}s`;
    paceEl.textContent = `Pace: ${status.pace}`;
  }
}

function toggleMode(mode) {
  if (companion.mode === mode) {
    companion.stop();
    btnWalk.classList.remove("active");
    btnRun.classList.remove("active");
    currentAtmosphere = getRandomAtmosphere();
    updateAtmosphereDisplay(currentAtmosphere);
  } else {
    if (mode === "walking") {
      companion.startWalk(currentAtmosphere);
      btnWalk.classList.add("active");
      btnRun.classList.remove("active");
    } else {
      companion.startRun(currentAtmosphere);
      btnRun.classList.add("active");
      btnWalk.classList.remove("active");
    }
  }
  updateStatus();
}

btnWalk.addEventListener("click", () => toggleMode("walking"));
btnRun.addEventListener("click", () => toggleMode("running"));

setInterval(updateStatus, 1000);
