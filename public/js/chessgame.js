const socket = io(); //ye automatic dusare connection se backend me connetct kar leta hai ye line ye server se real time me connection banata hai

//So this is the basic to know about the sockets-->
// socket.emit("churan")       // emit ka mtlb bhejana kuchh bhi ye ham frontend se backend par bhej rahe hai
// socket.on("churan papadi", function(){
//     console.log("churan paapadi received")
// })                  // data ko frontend par bhejane ke liye

const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHtml = ""; // ye hamare bors ko khali karega
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add(
        "square",
        (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
      );

      squareElement.dataset.row = rowindex;
      squareElement.dataset.column = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "white" : "black"
        );
        pieceElement.innerHTML = getPieceUnicode(square);
        pieceElement.draggable = playerRole === square.color;

        pieceElement.addEventListener("dragstart", () => {
            if(pieceElement.draggable){
                draggedPiece = pieceElement;
                sourceSquare = {row: rowindex, col: squareindex};
                e.dataTransfer.setData("text/plains", "");
            }
        });
        pieceElement.addEventListener("dragged", (e) => {
            draggedPiece = null;
            sourceSquare = null;
        });

        squareElement.appendChild(pieceElement);
      }
      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if(draggedPiece){
            const targetSource = {
                row: parseInt(squareElement.dataset.row),
                col: parseInt(squareElement.dataset.col),
            };
            handleMove(sourceSquare, targetSource); // esame ham ek square se dusare square me move kar sakenge
        }
      });
    boardElement.appendChild(squareElement);
    });
  });

  if(playerRole === 'b') {
    boardElement.classList.add("flipped");
  }
  else{
    boardElement.classList.remove("flipped");
  }
};
const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };
  socket.emit("move", move);
};
const getPieceUnicode = (piece) => {
  const unicodePieces = {
    p: "♟",
    r: "♜",
    n: "♞",
    b: "♝",
    q: "♛",
    k: "♚",
    
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",

  };
  return unicodePieces[piece.type] || "";
};
socket.on("playerRole", function (role) {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", function () {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderBoard();
});

socket.on("move", function (move) {
  chess.move(move);
  renderBoard();
});

renderBoard();
