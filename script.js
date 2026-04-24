const conditionCatalog = [
    {
        name: "Iron Deficiency",
        keywords: ["tired", "weak", "dizzy", "pale skin", "shortness of breath", "hair fall", "fatigue"],
        foods: ["Spinach", "Dates", "Jaggery", "Beetroot", "Lentils"],
        summary: "This pattern often shows up with tiredness, dizziness, and low energy."
    },
    {
        name: "Vitamin D Deficiency",
        keywords: ["bone pain", "back pain", "no sunlight", "not getting much sunlight", "fatigue", "low mood"],
        foods: ["Milk", "Eggs", "Fortified foods", "Mushrooms", "Safe sunlight exposure"],
        summary: "Low sunlight exposure with body aches can point toward low vitamin D."
    },
    {
        name: "Vitamin B12 Deficiency",
        keywords: ["tingling", "numbness", "memory issues", "fatigue", "weak", "brain fog"],
        foods: ["Eggs", "Dairy", "Fortified cereals", "Curd", "Paneer"],
        summary: "Nerve-related symptoms like tingling or numbness may overlap with low B12."
    },
    {
        name: "Protein Deficiency",
        keywords: ["muscle loss", "hair fall", "weak", "slow growth", "poor recovery"],
        foods: ["Paneer", "Dal", "Soybean", "Greek yogurt", "Peanuts"],
        summary: "Weakness, slow growth, or poor recovery can align with low protein intake."
    },
    {
        name: "Dehydration",
        keywords: ["dry mouth", "headache", "dark urine", "dizziness", "thirsty"],
        foods: ["Water", "Coconut water", "Water-rich fruits", "Buttermilk", "ORS if needed"],
        summary: "Dry mouth, headache, and dark urine are common dehydration clues."
    },
    {
        name: "Calcium Deficiency",
        keywords: ["muscle cramps", "weak bones", "tooth issues", "joint weakness"],
        foods: ["Milk", "Curd", "Cheese", "Tofu", "Sesame seeds"],
        summary: "Bone, teeth, or cramp-related discomfort can connect with low calcium intake."
    }
];

const symptomsInput = document.getElementById("symptoms");
const resultPanel = document.getElementById("result");
const analyzeButton = document.getElementById("analyzeButton");
const clearButton = document.getElementById("clearButton");
const exampleButtons = document.querySelectorAll("[data-example]");

function normalizeText(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9,\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function splitIntoSegments(input) {
    return input
        .split(/[,\n.]/)
        .map((segment) => segment.trim())
        .filter(Boolean);
}

function keywordMatchesInput(normalizedInput, segments, keyword) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) {
        return false;
    }

    if (normalizedInput.includes(normalizedKeyword)) {
        return true;
    }

    return segments.some((segment) => segment.includes(normalizedKeyword));
}

function buildResults(input) {
    const normalizedInput = normalizeText(input);
    const segments = splitIntoSegments(normalizedInput);

    return conditionCatalog
        .map((condition) => {
            const matchedKeywords = condition.keywords.filter((keyword) =>
                keywordMatchesInput(normalizedInput, segments, keyword)
            );
            const confidence = Math.round((matchedKeywords.length / condition.keywords.length) * 100);

            return {
                ...condition,
                matchedKeywords,
                score: matchedKeywords.length,
                confidence
            };
        })
        .filter((condition) => condition.score > 0)
        .sort((first, second) => {
            if (second.score !== first.score) {
                return second.score - first.score;
            }

            return second.confidence - first.confidence;
        });
}

function renderEmptyState(title, message) {
    resultPanel.className = "result-panel empty";
    resultPanel.innerHTML = `
        <div class="empty-state">
            <h2>${title}</h2>
            <p>${message}</p>
        </div>
    `;
}

function renderResults(results) {
    const bestMatch = results[0];
    const resultCards = results.slice(0, 3).map((condition) => {
        const keywords = condition.matchedKeywords.map((keyword) => `<span class="food-tag">${keyword}</span>`).join("");
        const foods = condition.foods.map((food) => `<span class="food-tag">${food}</span>`).join("");

        return `
            <article class="result-card">
                <div class="result-card-header">
                    <h3>${condition.name}</h3>
                    <span class="match-badge">${condition.score} symptom match${condition.score > 1 ? "es" : ""}</span>
                </div>
                <p class="match-copy">${condition.summary}</p>
                <div class="food-tags">${keywords}</div>
                <p class="match-copy"><strong>Food ideas:</strong></p>
                <div class="food-tags">${foods}</div>
            </article>
        `;
    }).join("");

    resultPanel.className = "result-panel";
    resultPanel.innerHTML = `
        <div class="results-header">
            <div>
                <h2>Closest nutrition patterns</h2>
                <p>${bestMatch.name} is the strongest match based on the symptoms you entered.</p>
            </div>
            <div class="score-pill">
                <span class="score-value">${bestMatch.confidence}%</span>
                <span class="score-label">Best-fit confidence</span>
            </div>
        </div>
        <div class="result-grid">${resultCards}</div>
        <p class="result-note"><strong>Important:</strong> This is a wellness guide, not a diagnosis. If symptoms are strong, persistent, or worsening, please talk to a doctor or dietitian.</p>
    `;
}

function analyzeSymptoms() {
    const input = symptomsInput.value.trim();

    if (!input) {
        renderEmptyState("Add a few symptoms first", "Type how you feel, such as tired, dizzy, dry mouth, or bone pain.");
        symptomsInput.focus();
        return;
    }

    const results = buildResults(input);

    if (!results.length) {
        renderEmptyState(
            "No close match yet",
            "Try clearer symptom phrases like tired, pale skin, low mood, dry mouth, or muscle cramps."
        );
        return;
    }

    renderResults(results);
}

function clearSymptoms() {
    symptomsInput.value = "";
    renderEmptyState(
        "Ready when you are",
        "We will highlight the closest nutrition patterns and food suggestions here."
    );
    symptomsInput.focus();
}

analyzeButton.addEventListener("click", analyzeSymptoms);
clearButton.addEventListener("click", clearSymptoms);

exampleButtons.forEach((button) => {
    button.addEventListener("click", () => {
        symptomsInput.value = button.dataset.example || "";
        analyzeSymptoms();
    });
});

symptomsInput.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        analyzeSymptoms();
    }
});
