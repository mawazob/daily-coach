/* Rule-based prediction engine

Returns { hitGoal: bool, confidence: number (0-1), score: number } */

function predictGoal(sleep, water, steps) {
  // Weighted score (max 100)
  const sleepScore = Math.min(sleep / 8.0, 1.0) * 35;   // 35% weight
  const waterScore = Math.min(water / 10.0, 1.0) * 25;  // 25% weight
  const stepsScore = Math.min(steps / 12000, 1.0) * 40; // 40% weight

  const totalScore  = sleepScore + waterScore + stepsScore;
  const hitGoal     = totalScore >= 60;

  // Confidence: how far from the 60-point threshold (capped at 95%)
  const distance    = Math.abs(totalScore - 60);
  const confidence  = Math.min(0.50 + distance * 0.012, 0.95);

  return { hitGoal, confidence, score: Math.round(totalScore) };    
}

/* The Coaching Generator

The coaching function takes the prediction result and input values, then returns a two-sentence coaching message. 
This mirrors the pattern from Day 35 but runs entirely in JavaScript. 

*/

const COACHING = {
  // key: `${hitGoal ? 1 : 0}${sleep >= 7 ? 1 : 0}${water >= 8 ? 1 : 0}`
  "111": ["Strong inputs, strong output. Sleep and hydration are locked in.",
          "Keep this baseline and the steps will follow."],
  "110": ["Hit the goal despite low water. Sleep is the primary driver.",
          "Close the hydration gap tomorrow."],
  "101": ["Water carried today despite low sleep.",
          "Shore up sleep tonight. Hitting goals on low sleep has hidden costs."],
  "100": ["Goal hit but both inputs are below threshold. That is willpower, not system.",
          "Build the foundation: sleep first, water second."],
  "011": ["Inputs were solid but the goal was missed.",
          "Audit your schedule. Do not cut sleep or water."],
  "010": ["Sleep is solid, hydration is low, goal was missed.",
          "Add two glasses of water tomorrow. Hydration shifts output more than expected."],
  "001": ["Low sleep is the primary issue. Water is fine.",
          "Get to bed 45 minutes earlier. The effect shows within 72 hours."],
  "000": ["Both sleep and water are below threshold and the goal was missed.",
          "Reset tonight: 8 hours minimum sleep, 10 glasses of water tomorrow."],
};

const getCoaching = (sleep, water, hitGoal) => {
  const key = `${hitGoal ? 1 : 0}${sleep >= 7 ? 1 : 0}${water >= 8 ? 1 : 0}`;
  const [line1, line2] = COACHING[key];
  return `${line1} ${line2}`; // return COACHING[key].join(" ") can replace this line and the above one;
};

// Wire the form

const nameInput = document.querySelector('#nameInput');
const sleepInput = document.querySelector('#sleepInput');
const waterInput = document.querySelector('#waterInput');
const stepsInput = document.querySelector('#stepsInput');
const button = document.querySelector('#btn');
const outParagraph = document.querySelector('#outcome');
const msgParagraph = document.querySelector('#message');
const errorParagraph = document.querySelector('#error');
const helloParagraph = document.querySelector('#greet');

function clearResults() {
  errorParagraph.textContent = "";
  helloParagraph.textContent = "";
  outParagraph.textContent = "";
  msgParagraph.textContent = "";
  //document.querySelectorAll("h2").forEach(heading => heading.hidden = true);
}

function analyze() {
    clearResults();
    
    const name = nameInput.value.toUpperCase().trim();
    const sleep = Number(sleepInput.value);
    const water = Number(waterInput.value);
    const steps = Number(stepsInput.value);

    if (name === "") {
        errorParagraph.textContent = "Please enter your name.";
        return;
    }

    if (Number.isNaN(sleep) || Number.isNaN(water) || Number.isNaN(steps)) {
        errorParagraph.textContent = "Sleep, water, and steps must be numbers.";
        return;
    }

    if (sleep <= 0 || steps <= 0 || water <= 0) {
        errorParagraph.textContent = "Sleep, water, or steps cannot be zero or less. All values must be greater than 0.";
        return;
    }

    if (sleep >= 24) {
        errorParagraph.textContent = "Sleep cannot exceed 24 hours.";
        return;
    }

    if (steps < 100) {
        errorParagraph.textContent = "Minimum step count is 100.";
        return;
    }

    helloParagraph.textContent = `Hello ${name}, here is your daily coach results:`

    const result = predictGoal(sleep, water, steps);
    const outcome = getCoaching(sleep, water, result.hitGoal);
    
    let goal;
    if (result.hitGoal) {
        goal = "Hit goal";
    } else {
        goal = "Missed goal";
    }
    
    outParagraph.textContent = `[${goal.toUpperCase()}] (${(result.confidence * 100).toFixed(0)}% confidence • Score: ${result.score}/100)`;
    msgParagraph.textContent = outcome;

    document.querySelectorAll("h2[hidden]").forEach(heading => heading.hidden = false); 
    
}

button.addEventListener("click", analyze);

[nameInput, sleepInput, waterInput, stepsInput].forEach(function (box) {
  box.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      analyze();
    }
  })
});



