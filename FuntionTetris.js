// Selecciona el canvas del documento HTML con el ID "tetris" y "next"
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

// Escala el contexto de dibujo para hacer los elementos más grandes
const scale = 20;
context.scale(scale, scale);
nextContext.scale(scale, scale);

// Crea una matriz de 12x20 para representar el campo de juego
const arena = createMatrix(12, 20);

// Objeto que representa al jugador
const player = {
    pos: { x: 0, y: 0 }, // Posición actual del jugador
    matrix: null, // Matriz que representa la pieza que el jugador controla
    score: 0 // Puntuación del jugador
};

// Matrices que representan las diferentes formas de las piezas de Tetris
const tetrominoes = [
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]], // O
    [[1, 1, 1], [1, 0, 0]], // L
    [[1, 1, 1], [0, 0, 1]], // J
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 1, 0], [0, 1, 1]], // Z
    [[1, 1, 1, 1]] // I
];

// Función para crear una matriz con las dimensiones dadas e inicializarla con ceros
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    
    return matrix;
}

// Función para dibujar una matriz en el canvas
// Función para dibujar una matriz en el canvas
function drawMatrix(matrix, offset, ctx = context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                switch(value) {
                    case 1:
                        ctx.fillStyle = '#FF0000'; // Rojo para la pieza T
                        break;
                    case 2:
                        ctx.fillStyle = '#FFFF00'; // Amarillo para la pieza O
                        break;
                    case 3:
                        ctx.fillStyle = '#FFA500'; // Naranja para la pieza L
                        break;
                    case 4:
                        ctx.fillStyle = '#0000FF'; // Azul para la pieza J
                        break;
                    case 5:
                        ctx.fillStyle = '#00FF00'; // Verde para la pieza S
                        break;
                    case 6:
                        ctx.fillStyle = '#00FFFF'; // Cian para la pieza Z
                        break;
                    case 7:
                        ctx.fillStyle = '#800080'; // Morado para la pieza I
                        break;
                    default:
                        ctx.fillStyle = 'gray'; // Color predeterminado para otros valores
                }
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1); // Dibuja un cuadrado en las coordenadas dadas
            }
        });
    });
}

// Función para dibujar el campo de juego y la pieza del jugador
function draw() {
    context.fillStyle = '#1D082A'; // Color del campo de juego
    context.fillRect(0, 0, canvas.width / scale, canvas.height / scale); // Borra el canvas

    drawMatrix(arena, { x: 0, y: 0 }); // Dibuja el campo de juego
    drawMatrix(player.matrix, player.pos); // Dibuja la pieza del jugador
}

// Función para fusionar la pieza del jugador con el campo de juego cuando toca el fondo o una pieza existente
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value; // Fusiona la pieza con el campo de juego
            }
        });
    });
}

// Función para hacer caer la pieza del jugador una fila hacia abajo
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) { // Si la pieza toca el fondo o una pieza existente
        player.pos.y--;
        merge(arena, player); // Fusiona la pieza con el campo de juego
        playerReset(); // Resetea la posición de la pieza del jugador
        arenaSweep(); // Realiza una limpieza de líneas completadas
        updateScore(); // Actualiza la puntuación del jugador
    }
    dropCounter = 0;
}

// Función para mover la pieza del jugador hacia la izquierda o la derecha
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) { // Si la pieza toca los límites laterales o una pieza existente
        player.pos.x -= dir; // Revierte el movimiento
    }
}

// Función para rotar una matriz 2D en 90 grados en sentido horario o antihorario
function rotate(matrix, reverse) {
    const result = matrix.map((_, index) => matrix.map(row => row[index])); // Transpone la matriz
    if (reverse) {
        return result.map(row => row.reverse()); // Invierte cada fila si es en sentido antihorario
    }
    return result.reverse(); // Invierte el orden de las filas si es en sentido horario
}

// Función para rotar la pieza del jugador en sentido horario o antihorario
function playerRotate(reverse = false) {
    const pos = player.pos.x;
    let offset = 1;
    player.matrix = rotate(player.matrix, reverse); // Rota la matriz de la pieza del jugador

    // Mientras la pieza del jugador colisione con el campo de juego
    while (collide(arena, player)) {
        player.pos.x += offset; // Aplica un desplazamiento horizontal
        offset = -(offset + (offset > 0 ? 1 : -1)); // Calcula el próximo desplazamiento
        if (offset > player.matrix[0].length) {
            player.matrix = rotate(player.matrix, !reverse); // Rota en sentido opuesto para evitar la colisión
            player.pos.x = pos; // Restaura la posición original del jugador
            return; // Sale de la función
        }
    }
}

// Función para crear una pieza de Tetris aleatoria
function createPiece(type) {
    switch (type) {
        case 'T':
            return [[0, 1, 0], [2, 1, 2], [0, 0, 0]]; // T: Amarillo
        case 'O':
            return [[3, 3], [3, 3]]; // O: Naranja
        case 'L':
            return [[0, 0, 4], [4, 4, 4], [0, 0, 0]]; // L: Azul
        case 'J':
            return [[5, 0, 0], [5, 5, 5], [0, 0, 0]]; // J: Verde
        case 'S':
            return [[0, 6, 6], [6, 6, 0], [0, 0, 0]]; // S: Cian
        case 'Z':
            return [[7, 7, 0], [0, 7, 7], [0, 0, 0]]; // Z: Morado
        case 'I':
            return [[0, 0, 0, 0], [8, 8, 8, 8], [0, 0, 0, 0], [0, 0, 0, 0]]; // I: Rojo oscuro
        default:
            throw new Error('Invalid piece type');
    }
}

// Variable para la siguiente pieza
let nextPiece = createPiece('T'); // Inicializa la siguiente pieza

// Función para resetear la posición de la pieza del jugador
function playerReset() {
    const pieces = 'TOLJZSI';
    player.matrix = nextPiece; // Usa la siguiente pieza como la pieza actual
    player.pos.y = 0; // Coloca la pieza en la parte superior del campo de juego
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0); // Centra la pieza horizontalmente
    if (collide(arena, player)) { // Si la pieza nueva colisiona con algo
        arena.forEach(row => row.fill(0)); // Limpia el campo de juego
        player.score = 0; // Reinicia la puntuación del jugador
        updateScore(); // Actualiza la puntuación en la interfaz
    }
    // Genera una nueva siguiente pieza
    nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]);
    drawNext(); // Dibuja la siguiente pieza en el canvas "next"
}

// Función para verificar si una pieza colisiona con el campo de juego o con otras piezas
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && 
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true; // Hay una colisión
            }
        }
    }
    return false; // No hay colisión
}

// Función para eliminar líneas completas del campo de juego
function arenaSweep() {
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0); // Elimina la línea completa
        arena.unshift(row); // Añade una nueva fila vacía en la parte superior
        ++y; // Ajusta el índice de la fila
        player.score += 10; // Incrementa la puntuación del jugador
    }
}

// Función para actualizar la puntuación mostrada en la interfaz
function updateScore() {
    document.getElementById('score').innerText = `Puntuación: ${player.score}`;
}

// Variables para controlar el tiempo y la caída automática de la pieza
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Función principal del juego que se ejecuta repetidamente para actualizar el estado y renderizar el juego
function update(time = 0) {
    const deltaTime = time - lastTime; // Calcula la diferencia de tiempo desde la última actualización
    lastTime = time; // Actualiza el tiempo de la última actualización

    dropCounter += deltaTime; // Incrementa el contador de tiempo de caída
    if (dropCounter > dropInterval) { // Si ha pasado el intervalo de tiempo para la caída
        playerDrop(); // Hace caer la pieza del jugador
    }

    draw(); // Renderiza el juego
    requestAnimationFrame(update); // Solicita el siguiente cuadro de animación
}

// Manejador de eventos para las teclas presionadas
document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1); // Mueve la pieza del jugador hacia la izquierda
    } else if (event.key === 'ArrowRight') {
        playerMove(1); // Mueve la pieza del jugador hacia la derecha
    } else if (event.key === 'ArrowDown') {
        playerDrop(); // Hace caer la pieza del jugador rápidamente
    } else if (event.key === 'Q' || event.key === 'q') {
        playerRotate(); // Rota la pieza del jugador en sentido horario
    } else if (event.key === 'W' || event.key === 'w') {
        playerRotate(true); // Rota la pieza del jugador en sentido antihorario
    }
});

// Función para dibujar la siguiente pieza en el canvas "next"
function drawNext() {
    nextContext.fillStyle = '#1D082A'; // Color del campo de juego
    nextContext.fillRect(0, 0, nextCanvas.width / scale, nextCanvas.height / scale); // Borra el canvas
    drawMatrix(nextPiece, { x: 1, y: 1 }, nextContext); // Dibuja la siguiente pieza
}

// Inicializa el juego
playerReset(); // Prepara la primera pieza del jugador
updateScore(); // Inicializa la puntuación
update(); // Comienza el bucle principal del juego
