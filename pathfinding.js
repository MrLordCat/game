// pathfinding.js
function aStar(start, goal, mapData, overlayMapData, size = { width: 1, height: 1 }) {
    const openSet = new Set([JSON.stringify(start)]);
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(JSON.stringify(start), 0);
    fScore.set(JSON.stringify(start), heuristic(start, goal));

    while (openSet.size > 0) {
        let currentStr = getLowestFScore(openSet, fScore);
        if (!currentStr) {
            return []; // Путь не найден
        }

        let current = JSON.parse(currentStr);

        if (current.x === goal.x && current.y === goal.y) {
            return reconstructPath(cameFrom, current);
        }

        openSet.delete(currentStr);

        for (let neighbor of getNeighbors(current, mapData, overlayMapData, size)) {
            const tentativeGScore = gScore.get(currentStr) + 1;

            if (tentativeGScore < (gScore.get(JSON.stringify(neighbor)) || Infinity)) {
                if (!(neighbor.x === start.x && neighbor.y === start.y)) {
                    cameFrom.set(JSON.stringify(neighbor), current);
                }

                gScore.set(JSON.stringify(neighbor), tentativeGScore);
                fScore.set(JSON.stringify(neighbor), tentativeGScore + heuristic(neighbor, goal));

                if (!openSet.has(JSON.stringify(neighbor))) {
                    openSet.add(JSON.stringify(neighbor));
                }
            }
        }
    }
    return []; // Путь не найден
}



function heuristic(pos0, pos1) {
    const dx = Math.abs(pos0.x - pos1.x);
    const dy = Math.abs(pos0.y - pos1.y);
    return Math.max(dx, dy);
}

function getLowestFScore(openSet, fScore) {
    let lowestNode = null;
    let lowestScore = Infinity;

    for (let node of openSet) {
        const score = fScore.get(node) || Infinity;
        if (score < lowestScore) {
            lowestScore = score;
            lowestNode = node;
        }
    }
    return lowestNode;
}

function getNeighbors(node, mapData, overlayMapData, size) {
    const directions = [
        { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 1 }, { x: -1, y: -1 },
        { x: 1, y: -1 }, { x: -1, y: 1 }
    ];
    const neighbors = [];

    for (let dir of directions) {
        const neighbor = { x: node.x + dir.x, y: node.y + dir.y };

        if (!isWall(neighbor.x, neighbor.y, mapData, overlayMapData, size)) {
            neighbors.push(neighbor);
        }
    }
    return neighbors;
}

function isWall(x, y, mapData, overlayMapData = [], size = { width: 1, height: 1 }) {
    for (let dx = 0; dx < size.width; dx++) {
        for (let dy = 0; dy < size.height; dy++) {
            const checkX = x + dx;
            const checkY = y + dy;

            if (checkY < 0 || checkY >= mapData.length || checkX < 0 || checkX >= mapData[0].length) {
                return true; // Если за пределами карты, это стена
            }


            if (mapData[checkY][checkX]?.type === 'wall') {
                return true;
            }
            if (overlayMapData.some(building => (
                checkX >= building.x &&
                checkX < building.x + building.width &&
                checkY >= building.y &&
                checkY < building.y + building.height
            ))) {
                return true;
            }
        }
    }

    return false; 
}



function reconstructPath(cameFrom, current) {
    const path = [current];
    const visited = new Set(); 

    while (cameFrom.has(JSON.stringify(current))) {
        if (visited.has(JSON.stringify(current))) {
            console.error("Detected cycle in path reconstruction. Aborting.");
            break;
        }

        visited.add(JSON.stringify(current)); 
        current = cameFrom.get(JSON.stringify(current));
        path.unshift(current);
    }

    return path;
}
function heuristic(pos0, pos1) {
    const dx = Math.abs(pos0.x - pos1.x);
    const dy = Math.abs(pos0.y - pos1.y);
    return Math.max(dx, dy);
}
module.exports = { aStar };
