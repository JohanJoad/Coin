class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentLevel = 0;
        this.moves = 0;
        this.cellSize = 60;
        this.coins = [];
        this.targets = [];
        this.draggedCoin = null;
        this.map = [];
        this.highestUnlockedLevel = 0;
        this.customLevels = [];
        this.hasLevelDir = false;
        this.movesPerLevel = {}; // För kampanjnivåer
        this.customMovesPerLevel = {}; // Separata rekord för custom nivåer
        this.isPlayingCustomLevel = false; // Flag för att hålla koll på om vi spelar en custom nivå
        this.currentCustomLevel = ''; // Namn på nuvarande custom nivå

        // Start the game loop first
        this.gameLoop();

        // Load saved game state
        this.loadGameState();

        // Setup level selectors
        this.setupLevelSelectors();

        // Setup other event listeners
        this.setupEvents();
    }

    async setupLevelSelectors() {

        // Campaign level selector
        const campaignSelect = document.getElementById('campaignSelect');
        this.updateCampaignLevels(campaignSelect);

        const customSelect = document.getElementById('customSelect');

        // if (window.location.protocol.startsWith("http")) {
        try {
            const response = await fetch('/list-levels');
            if (response.ok) {
                const data = await response.json();
                this.customLevels = data.customLevels;
                this.hasLevelDir = data.hasLevelDir;

                if (this.hasLevelDir) {
                    this.updateCustomLevels(customSelect);
                }
            }

        } catch (error) {
            console.error('Kunde inte hämta custom levels:', error);
        }
        // }

        // Event listeners för level-väljare
        campaignSelect.addEventListener('change', () => {
            const levelIndex = parseInt(campaignSelect.value);
            console.log("Kampanjnivå vald:", levelIndex);
            this.loadCampaignLevel(levelIndex);
        });

        document.getElementById('Clear Scores').addEventListener('click', function () {
            console.log('Knappen Clear har klickats!');
            localStorage.removeItem('coinsGameState');

        });




        if (this.hasLevelDir) {
            customSelect.addEventListener('change', async () => {
                const levelName = customSelect.value;
                if (levelName) {
                    await this.loadCustomLevel(levelName);
                }
            });
        }
    }

    updateCampaignLevels(select) {

        select.innerHTML = '';
        // Visa alla nivåer upp till och med den högsta upplåsta nivån
        for (let i = 0; i < LEVELS.length; i++) {
            console.log("highestUnlockedLevel:", this.highestUnlockedLevel);
            console.log("i:", i);
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Level ${i + 1}`;
            select.appendChild(option);
            console.log(`Lägger till nivå: ${i + 1}`);

        }
        select.value = this.currentLevel;
    }

    updateCustomLevels(select) {
        select.innerHTML = '<option value="">Välj custom nivå...</option>';
        for (const levelName of this.customLevels) {
            const option = document.createElement('option');
            option.value = levelName;
            option.textContent = levelName;
            select.appendChild(option);
        }
    }

    async loadCustomLevel(levelName) {
        try {
            const response = await fetch(`/load-level?name=${encodeURIComponent(levelName)}`);
            if (response.ok) {
                const levelData = await response.json();
                this.map = levelData.map;
                this.coins = levelData.coins;
                this.targets = levelData.targets;
                this.moves = 0;
                this.isPlayingCustomLevel = true;
                this.currentCustomLevel = levelName;
                this.resizeCanvas();
                this.updateUI();
                this.draw();
            }
        } catch (error) {
            console.error('Kunde inte ladda custom level:', error);
        }
    }

    loadCampaignLevel(levelIndex) {
        if (levelIndex <= levelIndex <= LEVELS.length) {
            const level = LEVELS[levelIndex];
            this.currentLevel = levelIndex;
            this.map = level.map;
            this.coins = JSON.parse(JSON.stringify(level.coins));
            this.targets = JSON.parse(JSON.stringify(level.targets));
            this.moves = 0;
            this.isPlayingCustomLevel = false;
            this.currentCustomLevel = '';            
            this.resizeCanvas();
            this.updateUI();
            this.draw();
            // this.saveGameState();
        }
    }

    setupEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleMouseDown(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMouseMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleMouseUp();
        });
    }

    resizeCanvas() {
        const maxSize = Math.min(window.innerWidth - 40, window.innerHeight-60   ,800);
        this.canvas.width = maxSize * 1;
        this.canvas.height = maxSize * 0.75;

        // Säkerställ att this.map finns och har innehåll
        if (this.map && this.map.length > 0 && this.map[0]) {
            this.cellSize = Math.floor(maxSize / Math.max(this.map.length, this.map[0].length));
        } else {
            this.cellSize = Math.floor(maxSize / 8); // Default size if no map is loaded
        }

        this.draw();
    }

    loadLevel(levelIndex) {
        console.log('Laddar nivå:', levelIndex);
        console.log(LEVELS);
        const level = LEVELS[levelIndex];
        this.map = level.map;
        this.coins = JSON.parse(JSON.stringify(level.coins));
        this.targets = JSON.parse(JSON.stringify(level.targets));
        this.moves = 0;
        this.updateUI();
        this.resizeCanvas();
    }

    loadGameState() {
        const savedState = localStorage.getItem('coinsGameState');

        if (savedState) {
            console.log("Sparad data:", JSON.parse(savedState));
        } else {
            console.log("Ingen data hittades i localStorage.");
        }

        if (savedState) {
            const state = JSON.parse(savedState);
            this.currentLevel = state.currentLevel;
            this.highestUnlockedLevel = state.highestUnlockedLevel || 0;
            this.moves = state.moves;
            this.movesPerLevel = state.movesPerLevel || {}; // Load records
            this.customMovesPerLevel = state.customMovesPerLevel || {}; // Load custom level records
        }
        this.loadCampaignLevel(this.currentLevel);
    }

    saveGameState() {
        const state = {
            currentLevel: this.currentLevel,
            highestUnlockedLevel: this.highestUnlockedLevel,
            moves: this.moves,
            movesPerLevel: this.movesPerLevel, // Save records
            customMovesPerLevel: this.customMovesPerLevel // Save custom level records
        };
        console.log("Sparar data:", state)
        localStorage.setItem('coinsGameState', JSON.stringify(state));
    }

    getGridPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((clientX - rect.left) / this.cellSize);
        const y = Math.floor((clientY - rect.top) / this.cellSize);
        return { x, y };
    }

    findCoinAt(pos) {
        return this.coins.find(coin => coin.x === pos.x && coin.y === pos.y);
    }

    isValidPosition(x, y) {
        return this.map[y]?.[x] === 0;
    }

    // Breadth-first search to find valid path
    findPath(start, end) {
        const queue = [[start]];
        const visited = new Set();

        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];
            const key = `${current.x},${current.y}`;

            if (current.x === end.x && current.y === end.y) {
                return path;
            }

            if (!visited.has(key)) {
                visited.add(key);
                const moves = [
                    { x: 0, y: -1 }, { x: 1, y: 0 },
                    { x: 0, y: 1 }, { x: -1, y: 0 }
                ];

                for (const move of moves) {
                    const newX = current.x + move.x;
                    const newY = current.y + move.y;

                    if (this.isValidPosition(newX, newY) &&
                        !this.findCoinAt({ x: newX, y: newY })) {
                        queue.push([...path, { x: newX, y: newY }]);
                    }
                }
            }
        }
        return null;
    }

    handleMouseDown(e) {
        const pos = this.getGridPosition(e.clientX, e.clientY);
        this.draggedCoin = this.findCoinAt(pos);
        if (this.draggedCoin) {
            this.draggedCoin.dragging = true;
            this.draggedCoin.dragX = e.clientX;
            this.draggedCoin.dragY = e.clientY;
        }
    }

    handleMouseMove(e) {
        if (this.draggedCoin && this.draggedCoin.dragging) {
            this.draggedCoin.dragX = e.clientX;
            this.draggedCoin.dragY = e.clientY;
            this.draw();
        }
    }

    handleMouseUp() {
        if (this.draggedCoin) {
            const rect = this.canvas.getBoundingClientRect();
            const endPos = this.getGridPosition(
                this.draggedCoin.dragX,
                this.draggedCoin.dragY
            );

            const path = this.findPath(
                { x: this.draggedCoin.x, y: this.draggedCoin.y },
                endPos
            );

            if (path && this.isValidPosition(endPos.x, endPos.y)) {
                this.draggedCoin.x = endPos.x;
                this.draggedCoin.y = endPos.y;
                this.moves++;
                this.updateUI();
                this.checkWinCondition();
            }

            this.draggedCoin.dragging = false;
            this.draggedCoin = null;
            this.draw();
        }
    }

    checkWinCondition() {
        const won = this.coins.every(coin => {
            return this.targets.some(target =>
                target.x === coin.x &&
                target.y === coin.y &&
                target.color === coin.color
            );
        });

        if (won) {
            setTimeout(() => {
                if (this.isPlayingCustomLevel) {
                    // Uppdatera rekord för custom nivå
                    const currentRecord = this.customMovesPerLevel[this.currentCustomLevel];
                    if (!currentRecord || this.moves < currentRecord) {
                        this.customMovesPerLevel[this.currentCustomLevel] = this.moves;
                    }
                } else {
                    // Uppdatera rekord för kampanjnivå
                    const currentRecord = this.movesPerLevel[this.currentLevel];
                    if (!currentRecord || this.moves < currentRecord) {
                        this.movesPerLevel[this.currentLevel] = this.moves;
                    }

                    // Lås upp nästa nivå om det är en kampanjnivå
                    console.log("currentLevel:", this.currentLevel);
                    console.log("highestUnlockedLevel:", this.highestUnlockedLevel);
                    if (this.currentLevel === this.highestUnlockedLevel) {
                        this.highestUnlockedLevel = Math.min(this.currentLevel + 1, LEVELS.length - 1);
                        console.log("currentLevel:", this.currentLevel);
                        console.log("LEVELS.length:", LEVELS.length);
                        console.log("highestUnlockedLevel:", this.highestUnlockedLevel);
                        this.updateCampaignLevels(document.getElementById('campaignSelect'));
                    }
                }

                alert(`Nivå klar! Antal drag: ${this.moves}`);
                this.saveGameState();
                this.updateUI();
            }, 100);
        }
    }

    updateUI() {
        if (this.isPlayingCustomLevel) {
            document.getElementById('level').textContent = `Custom: ${this.currentCustomLevel}`;
            const record = this.customMovesPerLevel[this.currentCustomLevel] || '-';
            document.getElementById('rekord').textContent = `Rekord: ${record}`;
        } else {
            document.getElementById('level').textContent = `Nivå: ${this.currentLevel + 1}`;
            const record = this.movesPerLevel[this.currentLevel] || '-';
            document.getElementById('rekord').textContent = `Rekord: ${record}`;
        }
        document.getElementById('moves').textContent = `Drag: ${this.moves}`;
    }

    drawCoin(coin, x, y) {
        
        this.ctx.fillStyle = coin.color 
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.cellSize * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
    
        // Svart kantlinje
        this.ctx.strokeStyle = "black";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
    }
        

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw maze
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === 1) {
                    this.ctx.fillStyle = '#111';
                    this.ctx.fillRect(
                        x * this.cellSize,
                        y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }
        const borderWidth = 3; // Mindre kanttjocklek

        for (const target of this.targets) {
            // Fyllningsfärg med transparens

            this.ctx.globalAlpha = .65;
            this.ctx.fillStyle = target.color;

            this.ctx.fillRect(
                target.x * this.cellSize,
                target.y * this.cellSize,
                this.cellSize,
                this.cellSize
            );
            this.ctx.globalAlpha = 1; // Återställ alpha till 1

            // Kantlinje
            this.ctx.strokeStyle = target.color;
            this.ctx.lineWidth = borderWidth;
            this.ctx.strokeRect(
                target.x * this.cellSize + borderWidth / 2,
                target.y * this.cellSize + borderWidth / 2,
                this.cellSize - borderWidth,
                this.cellSize - borderWidth
            );
        }


        // Draw coins
        for (const coin of this.coins) {
            if (coin === this.draggedCoin && coin.dragging) {
                this.drawCoin(
                    coin,
                    coin.dragX - this.canvas.getBoundingClientRect().left,
                    coin.dragY - this.canvas.getBoundingClientRect().top
                );
            } else {
                this.drawCoin(
                    coin,
                    (coin.x + 0.5) * this.cellSize,
                    (coin.y + 0.5) * this.cellSize
                );
            }
        }
        
    }

    gameLoop() {
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    resetGameData() {
        localStorage.clear();
    }
}



// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});

