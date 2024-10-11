// Constants
let SIZE_X = 7;
let SIZE_Y = 5;
let CELL_SIZE = 100;
let SCREEN_WIDTH = SIZE_X * CELL_SIZE;
let SCREEN_HEIGHT = SIZE_Y * CELL_SIZE;

// List of every Splatoon 3 splatfest ink color combinations
const splatfestColors = [
    ['#413bba', '#beb013', '#c03e3e'], // Rock vs. Paper vs. Scissors
    ['#8a19f7', '#be7118', '#28c05e'], // Gear vs. Grub vs. Fun
    ['#1ba974', '#da4514', '#002aff'], // Grass vs. Fire vs. Water
    ['#ad5438', '#9a6fcc', '#a5b533'], // Spicy vs. Sweet vs. Sour
    ['#3d1f7a', '#995935', '#d6bf8f'], // Dark Chocolate vs. Milk Chocolate vs. White Chocolate
    ['#118F32', '#793199', '#A1482B'], // Nessie vs. Aliens vs. Bigfoot
    ['#ab2a5c', '#488db5', '#03a65f'], // Power vs. Wisdom vs. Courage
    ['#cca770', '#bc6d75', '#2ac29e'], // Vanilla vs. Strawberry vs. Mint Chip
    ['#c8752d', '#73bd49', '#bb497b'], // Money vs. Fame vs. Love
    ['#3834b5', '#cfc235', '#bd3e33'], // Shiver vs. Frye vs. Big Man
    ['#0ca34b', '#b04f23', '#964996'], // Zombie vs. Skeleton vs. Ghost
    ['#b02a57', '#c58650', '#97c22a'], // Handshake vs. Fist Bump vs. Hug
    ['#5378de', '#cb8719', '#d9bba9'], // Friends vs. Family vs. Solo
    ['#ab0072', '#b66400', '#c1ae88'], // Red Bean Paste vs. Custard vs. Whipped Cream
    ['#b49109', '#284ca7', '#ab3e28'], // Friday vs. Saturday vs. Sunday
    ['#384db0', '#ad3d2e', '#15b169'], // Lightly Salted vs. Consommé vs. Salted Seaweed
    ['#b12b56', '#19b44a', '#7e27ab'], // Drums vs. Guitar vs. Keyboard
    ['#a1cc41', '#eb759c', '#51d1c8'], // Baby Chicks vs. Li'l Bunnies vs. Bear Cubs
    ['#2fb48e', '#304199', '#a34534'], // Same Ol' vs. Bucket List vs. Save the Day
    ['#b3b82c', '#728eb9', '#a63faf'], // Palace vs. Theme Park vs. Beach
    ['#ab3316', '#b7a98a', '#43b030'], // Bread vs. Rice vs. Pasta
    ['#bb355f', '#6b4bcc', '#85d135'], // Past vs. Present vs. Future
];

const query = window.matchMedia("(prefers-contrast: more)"); // Check if user prefers more contrast

let PRIMARY_COLOR, SECONDARY_COLOR, TERTIARY_COLOR;

function generateColors() {
    let colors;
    if (!query.matches) {
        colors = splatfestColors[Math.floor(Math.random() * splatfestColors.length)];
    } else {
        colors = ['#000000', '#ffffff', '#808080']; // Black, White, Gray for high-contrast mode
    }
    // Assign colors to the primary, secondary, and tertiary variables
    [PRIMARY_COLOR, SECONDARY_COLOR, TERTIARY_COLOR] = colors;
}

// Initialize the canvas
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
context.font = '36px Monospace';
context.textAlign = 'center';

let matrix;

function generateMatrix() {
    return Array.from({ length: SIZE_X }, () => Array(SIZE_Y).fill(0));
}

let scrambleSequence = [];

function resetMatrix() {
    matrix = generateMatrix();
    scrambleSequence = []; // Reset the scramble sequence
    generateColors(); // Generate a new color scheme
    let steps = SIZE_X * SIZE_Y;
    let i = 0;
    function scrambleStep() {
        if (i < steps) {
            const x = Math.floor(Math.random() * SIZE_X);
            const y = Math.floor(Math.random() * SIZE_Y);
            action(x, y);
            scrambleSequence.push({ x, y }); // Record the step in the sequence
            drawMatrix();  // Update the matrix display after each step
            i++;
            setTimeout(scrambleStep, 100);  // Adjust the delay as needed (100 ms here)
        }
    }
    scrambleStep();
}

function action(x, y) { // select coordinates, flip the value of the cell and its neighbors
    if (x < 0 || x >= SIZE_X || y < 0 || y >= SIZE_Y) {
        return -1;
    } else {
        matrix[x][y] = flip(flip(matrix[x][y]));
        if (x > 0) {
            matrix[x - 1][y] = flip(matrix[x - 1][y]);
        }
        if (x < SIZE_X - 1) {
            matrix[x + 1][y] = flip(matrix[x + 1][y]);
        }
        if (y > 0) {
            matrix[x][y - 1] = flip(matrix[x][y - 1]);
        }
        if (y < SIZE_Y - 1) {
            matrix[x][y + 1] = flip(matrix[x][y + 1]);
        }
        return 0;
    }
}

function flip(num) { // flip the value of a cell in the cycle: 0 -> 1 -> 2 -> 0
    return (num + 1) % 3;
}

function drawMatrix() {
    for (let i = 0; i < SIZE_X; i++) {
        for (let j = 0; j < SIZE_Y; j++) {
            const rectX = i * CELL_SIZE;
            const rectY = j * CELL_SIZE;
            let color;
            switch (matrix[i][j]) {
                case 0:
                    color = PRIMARY_COLOR;
                    break;
                case 1:
                    color = SECONDARY_COLOR;
                    break;
                case 2:
                    color = TERTIARY_COLOR;
                    break;
            }
            context.fillStyle = color;
            context.fillRect(rectX, rectY, CELL_SIZE, CELL_SIZE);
        }
    }
}

function checkWin() {
    const targetColor = matrix[0][0];
    return matrix.every(col => col.every(row => row === targetColor));
}

function resizeCanvas() {
    const availableWidth = canvas.parentElement.clientWidth;
    const availableHeight = canvas.parentElement.clientHeight;
    const cellSizeX = Math.floor(availableWidth / SIZE_X);
    const cellSizeY = Math.floor(availableHeight / SIZE_Y);
    CELL_SIZE = Math.min(cellSizeX, cellSizeY);
    SCREEN_WIDTH = SIZE_X * CELL_SIZE;
    SCREEN_HEIGHT = SIZE_Y * CELL_SIZE;
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    context.font = `${CELL_SIZE / 2}px Monospace`;
    context.textAlign = 'center';
}

// Generate initial scramble and colors
resetMatrix();

// Call resizeCanvas once to initialize the canvas size
resizeCanvas();

// Add event listener to resize the canvas when the window size changes
window.addEventListener('resize', resizeCanvas);

// Main game loop
function gameLoop() {
    // Clear the screen
    context.fillStyle = 'rgb(0, 0, 0)';
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Draw the matrix
    drawMatrix();

    // Check if all lights are off
    if (checkWin()) {
        // Display "You won!" message
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fillText('You won!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
    }

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

// Handle mouse clicks
canvas.addEventListener('mousedown', event => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX / CELL_SIZE);
    const y = Math.floor((event.clientY - rect.top) * scaleY / CELL_SIZE);

    if (0 <= x && x < SIZE_X && 0 <= y && y < SIZE_Y) {
        // Flip the cell and its neighbors
        action(x, y);
    }
});

// Handle key presses
document.addEventListener('keydown', event => {
    if (event.key === 'r') {
        // Generate new scramble on "R" key press
        resetMatrix();
    } else if (event.key === 'i') {
        // Reset canvas and matrix on "I" key press
        const newX = parseInt(prompt('Enter new width:'));
        const newY = parseInt(prompt('Enter new height:'));
        if (!isNaN(newX) && !isNaN(newY) && newX > 0 && newY > 0) {
            SIZE_X = newX;
            SIZE_Y = newY;
            CELL_SIZE = Math.min(SCREEN_WIDTH / SIZE_X, SCREEN_HEIGHT / SIZE_Y);
            resetMatrix();
            resizeCanvas();
        } else {
            alert('Invalid input. Please enter valid numbers.');
        }
    }
});
