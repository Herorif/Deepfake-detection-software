const fileInput = document.getElementById("fileInput");
const scanBtn = document.getElementById("scanBtn");
const resultCard = document.getElementById("resultCard");
const resultLabel = document.getElementById("resultLabel");
const confidenceText = document.getElementById("confidenceText");
const reasonText = document.getElementById("reasonText");

let selectedFile = null;

fileInput.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];
    scanBtn.disabled = !selectedFile;
});

// Mock deepfake analysis
function mockAnalysis() {
    const isFake = Math.random() < 0.45;
    const confidence = (Math.random() * 35 + 65).toFixed(2); // 65%–100%

    const reasonsReal = [
        "No detectable artifacts in facial regions.",
        "Lighting and shading consistent across frames.",
        "No abnormal pixel-level inconsistencies found."
    ];
    const reasonsFake = [
        "Detected warping around eyes and mouth.",
        "Inconsistent face boundary and blending artifacts.",
        "Abnormal frequency-domain patterns detected."
    ];

    return {
        result: isFake ? "FAKE" : "REAL",
        confidence,
        reason: isFake 
            ? reasonsFake[Math.floor(Math.random() * reasonsFake.length)]
            : reasonsReal[Math.floor(Math.random() * reasonsReal.length)]
    };
}

scanBtn.addEventListener("click", () => {
    if (!selectedFile) return;

    const analysis = mockAnalysis();

    // Set colors for result UI
    const color = analysis.result === "FAKE" ? "#dc2626" : "#16a34a";

    resultLabel.style.color = color;
    resultLabel.textContent = `Result: ${analysis.result}`;
    confidenceText.textContent = `Confidence: ${analysis.confidence}%`;
    reasonText.textContent = `Reason: ${analysis.reason}`;

    resultCard.classList.remove("hidden");
});
