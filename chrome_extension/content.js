// ----- MOCK BACKEND FUNCTION WITH FACE CHECK -----
async function mockBackend(frameBlob) {
    await new Promise(res => setTimeout(res, 500)); // simulate processing

    const hasFace = Math.random() < 0.8; // pretend 80% frames have faces

    if (!hasFace) {
        return { prediction: "NO FACE", confidence: 0 };
    }

    const isFake = Math.random() < 0.45;
    const confidence = (Math.random() * 35 + 65).toFixed(1);
    return { prediction: isFake ? "FAKE" : "REAL", confidence };
}

// ----- OVERLAY CREATION -----
function createOverlay(video) {
    let overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = "10px";
    overlay.style.left = "10px";
    overlay.style.padding = "6px 12px";
    overlay.style.borderRadius = "8px";
    overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
    overlay.style.color = "white";
    overlay.style.fontSize = "12px";
    overlay.style.fontWeight = "bold";
    overlay.style.zIndex = "9999";
    overlay.innerText = "Analyzing...";
    video.parentElement.style.position = "relative";
    video.parentElement.appendChild(overlay);
    return overlay;
}

// ----- CAPTURE VIDEO FRAME AS BLOB -----
function captureFrame(video) {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), "image/jpeg");
    });
}

// ----- PROCESS SINGLE VIDEO -----
async function processVideo(video) {
    if (video.dataset.deepfakeOverlay) return;
    const overlay = createOverlay(video);
    video.dataset.deepfakeOverlay = true;

    async function analyze() {
        if (video.paused || video.ended) return;
        const frameBlob = await captureFrame(video);
        const result = await mockBackend(frameBlob);

        if (result.prediction === "NO FACE") {
            overlay.innerText = "No face detected";
            overlay.style.backgroundColor = "rgba(107,114,128,0.7)"; // gray
        } else {
            overlay.innerText = `${result.prediction} (${result.confidence}%)`;
            overlay.style.backgroundColor =
                result.prediction === "FAKE" ? "rgba(220,38,38,0.7)" : "rgba(22,163,52,0.7)";
        }
    }

    // Analyze every 5 seconds while video is playing
    setInterval(analyze, 5000);
}

// ----- SCAN PAGE FOR VIDEOS -----
function scanVideos() {
    const videos = document.querySelectorAll("video");
    videos.forEach(video => processVideo(video));
}

// ----- INITIAL SCAN -----
scanVideos();

// ----- OBSERVE NEW VIDEOS (INFINITE SCROLL) -----
const observer = new MutationObserver(() => {
    scanVideos();
});
observer.observe(document.body, { childList: true, subtree: true });
