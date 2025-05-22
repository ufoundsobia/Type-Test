// Fallback quotes in case API fails
const fallbackQuotes = [
    "The quick brown fox jumps over the lazy dog.",
    "Programming is not about what you know, it's about what you can figure out.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Innovation distinguishes between a leader and a follower.",
    "The best way to predict the future is to create it.",
    "Life is what happens to you while you're busy making other plans.",
    "The only way to do great work is to love what you do.",
    "In the middle of difficulty lies opportunity."
];

// DOM Elements
const quoteDisplay = document.getElementById('quote');
const inputArea = document.getElementById('input');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const restartButton = document.getElementById('restart');
const newQuoteButton = document.getElementById('newQuote');

// Game State
let startTime, currentQuote, isTestActive = false;

// Fetch quote from API
async function fetchQuote() {
    try {
        const response = await fetch('http://api.quotable.io/random');
        if (!response.ok) throw new Error('API response was not ok');
        const data = await response.json();
        return data.content; // removing author name cause why not(i don't like it)
    } catch (error) {
        console.error('Error fetching quote:', error);
        // Use a random fallback quote IN CASE MY PRECIOUS API FAILS TT(these are already without authors)
        const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
        return fallbackQuotes[randomIndex];
    }
}

// Show loading state cz i like making ppl wait
function showLoadingState() {
    quoteDisplay.innerHTML = `
        <div class="flex items-center justify-center space-x-2 text-gray-500">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>Loading new quote...</span>
        </div>
    `;
}

// Start or restart the test
async function startTest() {
    try {
        restartButton.disabled = true;
        newQuoteButton.disabled = true;

        currentQuote = await fetchQuote();
        quoteDisplay.textContent = currentQuote;

        // Reset input and focus
        inputArea.value = '';
        inputArea.disabled = false;
        inputArea.focus();

        // Reset stats
        startTime = null;
        isTestActive = false;
        wpmDisplay.textContent = '0';
        accuracyDisplay.textContent = '0%';

        // Re-enable buttons
        restartButton.disabled = false;
        newQuoteButton.disabled = false;

        // Add some visual feedback
        inputArea.classList.add('animate-pulse-slow');
        setTimeout(() => {
            inputArea.classList.remove('animate-pulse-slow');
        }, 1000);

    } catch (error) {
        console.error('Error starting test:', error);
        quoteDisplay.textContent = 'Error loading quote. Please try again.';
        restartButton.disabled = false;
        newQuoteButton.disabled = false;
    }
}

// Calculate and display results to the losers
function calculateResults() {
    const typedText = inputArea.value;

    // Start timer on first keystroke and my tummy hurts ouh
    if (!isTestActive && typedText.length > 0) {
        startTime = new Date();
        isTestActive = true;
    }

    if (!startTime) return;

    // Calculate WPM that is words per minutes
    const timeTaken = (new Date() - startTime) / 60000; // in minutes
    const wordCount = typedText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const wpm = timeTaken > 0 ? Math.round(wordCount / timeTaken) : 0;

    // Calculate accuracy cz we don't play
    const accuracy = calculateAccuracy(typedText, currentQuote);

    // Update display with animation
    updateDisplay(wpm, accuracy);

    // Check if test is complete???
    if (typedText.trim() === currentQuote.trim()) {
        completeTest();
    }
}

// Calculate accuracy percentage
function calculateAccuracy(typed, original) {
    if (!typed || !original) return 0;

    let correctChars = 0;
    const minLength = Math.min(typed.length, original.length);

    for (let i = 0; i < minLength; i++) {
        if (typed[i] === original[i]) {
            correctChars++;
        }
    }

    // Penalize for extra characters MUahahahaah
    const totalChars = Math.max(typed.length, original.length);
    const accuracy = Math.round((correctChars / totalChars) * 100);
    return Math.max(0, accuracy);
}

// Update display with smooth transitions
function updateDisplay(wpm, accuracy) {
    // Animate WPM change
    if (wpmDisplay.textContent !== wpm.toString()) {
        wpmDisplay.textContent = wpm;
        wpmDisplay.parentElement.classList.add('animate-bounce-subtle');
        setTimeout(() => {
            wpmDisplay.parentElement.classList.remove('animate-bounce-subtle');
        }, 1000);
    }

    // Animate accuracy change
    const accuracyText = `${accuracy}%`;
    if (accuracyDisplay.textContent !== accuracyText) {
        accuracyDisplay.textContent = accuracyText;

        // Color coding for accuracy
        const parent = accuracyDisplay.parentElement;
        parent.classList.remove('from-green-500', 'to-green-600', 'from-yellow-500', 'to-yellow-600', 'from-red-500', 'to-red-600');

        if (accuracy >= 95) {
            parent.classList.add('from-green-500', 'to-green-600');
        } else if (accuracy >= 80) {
            parent.classList.add('from-yellow-500', 'to-yellow-600');
        } else {
            parent.classList.add('from-red-500', 'to-red-600');
        }
    }
}

// Handle test completion
function completeTest() {
    isTestActive = false;
    inputArea.disabled = true;

    // Show completion message
    setTimeout(() => {
        const wpm = parseInt(wpmDisplay.textContent);
        const accuracy = parseInt(accuracyDisplay.textContent);

        let message = "🎉 Test completed! ";
        if (wpm >= 60 && accuracy >= 95) {
            message += "Excellent work! 🏆";
        } else if (wpm >= 40 && accuracy >= 90) {
            message += "Great job! 👏";
        } else if (wpm >= 25) {
            message += "Good effort! Keep practicing! 💪";
        } else {
            message += "Keep practicing, you'll improve! 📈";
        }

        // can show this in a toast notification or modal
        console.log(message);
    }, 500);
}

// Highlight typing errors (optional enhancement)
function highlightErrors() {
    const typed = inputArea.value;
    const original = currentQuote;

    // This could be enhanced to show real-time error highlighting
    // For now, we'll use border color changes
    let hasErrors = false;

    for (let i = 0; i < Math.min(typed.length, original.length); i++) {
        if (typed[i] !== original[i]) {
            hasErrors = true;
            break;
        }
    }

    if (hasErrors) {
        inputArea.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
        inputArea.classList.remove('border-gray-200', 'focus:border-blue-500', 'focus:ring-blue-500/20');
    } else {
        inputArea.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500/20');
        inputArea.classList.add('border-gray-200', 'focus:border-blue-500', 'focus:ring-blue-500/20');
    }
}

// Event Listeners
inputArea.addEventListener('input', () => {
    calculateResults();
    highlightErrors();
});

inputArea.addEventListener('paste', (e) => {
    // Prevent pasting to maintain test integrity
    e.preventDefault();
    console.log('Pasting is disabled to maintain test integrity');
});

restartButton.addEventListener('click', startTest);
newQuoteButton.addEventListener('click', startTest);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R for restart
    if ((e.ctrlKey || e.metaKey) && e.key === 'r' && !inputArea.disabled) {
        e.preventDefault();
        startTest();
    }

    // Ctrl/Cmd + N for new quote
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !inputArea.disabled) {
        e.preventDefault();
        startTest();
    }
});

// Initialize the test when page loads
document.addEventListener('DOMContentLoaded', () => {
    startTest();
});

// Optional: Add window focus/blur handling
window.addEventListener('blur', () => {
    if (isTestActive) {
        console.log('Window lost focus - timer paused');
        // You could pause the timer here if desired
    }
});

window.addEventListener('focus', () => {
    if (isTestActive) {
        console.log('Window regained focus - timer resumed');
        // You could resume the timer here if desired
    }
});