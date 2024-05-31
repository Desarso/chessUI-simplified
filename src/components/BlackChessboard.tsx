// type Props = {};
import { Move, TEST, Board } from "../Classes/chessClasses";
import { createSignal, For, Show, Setter, Accessor, onMount } from "solid-js";
import { DragDropContextProvider } from "./DragDropContext";
import board from "./WhiteChessboard";
import { User, updateMove } from "../Classes/Types";
import ChessSquare from "./ChessSquare";
import OpponentName from "./OpponentName";
import UserName from "./UserName";
// let mainTest = new TEST();
// mainTest.runAllTests();

type Props = {
  board: any;
  updateBlackBoard: any;
  setLastMove: any;
  lastMove: any;
  movePieceSound: any;
  capturePieceSound: any;
  setMoves: Setter<updateMove[]>;
  moves: Accessor<updateMove[]>;
  user: Accessor<User>;
  opponent: Accessor<User>;
  inGame: Accessor<boolean>;
  allPieces: Accessor<HTMLElement[]>;
  setAllPieces: Setter<HTMLElement[]>;
};

// board.movePiece("e2", "e2");

let id = 0;

function BlackChessboard({
  board,
  movePieceSound,
  capturePieceSound,
  moves,
  user,
  opponent,
  inGame,
  allPieces,
  setAllPieces
}: Props) {

  let boardIds = getBoardIds();

  //this gets the white board IDs
  //black board ID's are the same array but reversed
  function getBoardIds() {
    let boardIds = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        boardIds.push(`${String.fromCharCode(97 + j)}${8 - i}`);
      }
    }
    return boardIds;
  }

  onMount(() => {
    setTimeout(() => {
      let pieces = board().Pieces
      pieces.forEach((e)=> e.syncUIClass())
      
    }, 700);
  });

  //need to keep track of board more dynamically so that it updates better
  let eatenPieces: any = [];

  //this is the inlay responsible for pawn promotion
  const [displayInlay, setDisplayInlay] = createSignal(false);
  const [displayInlayX, setDisplayInlayX] = createSignal("00");
  const [inlaySelection, setInlaySelection] = createSignal("");
  const [crowningMove, setCrowningMove] = createSignal();



  //here I need to mount an event listener or alternatively I can just have

  //need to modify this to work with black board
  //basically
  async function handleSelection(selection: string) {
    setInlaySelection(selection);
    setDisplayInlay(false);
    let move = crowningMove();
    board().moveLegally(move.from, move.to, selection.toLowerCase());
    // let move = {start: lastMove().from, end: lastMove().to};
  }



  //later I will make a black board, and white board component and just change all the settings accordingly
  return (
    <>
      <Show when={inGame()}>
        <OpponentName opponent={opponent} color="white" board={board} />
      </Show>
      <div class="chessBoard">
        <DragDropContextProvider>
          <Show when={displayInlay()}>
            <div class={`chessInlay ml-[${7 - parseInt(displayInlayX())}]`}>
              <div
                class="chessInlaySquare"
                id="queenSelection"
                onClick={() => handleSelection("q")}
              >
                <div class="piece q"></div>
              </div>
              <div
                class="chessInlaySquare"
                id="knightSelection"
                onClick={() => handleSelection("n")}
              >
                <div class="piece n"></div>
              </div>
              <div
                class="chessInlaySquare"
                id="rookSelection"
                onClick={() => handleSelection("r")}
              >
                <div class="piece r"></div>
              </div>
              <div
                class="chessInlaySquare"
                id="bishopSelection"
                onClick={() => handleSelection("b")}
              >
                <div class="piece b"></div>
              </div>
            </div>
          </Show>

          <For each={board().board}>
            {(square, index) => (
              <ChessSquare
                // style={index()}
                // className={
                //   board().board[board().board.length - 1 - index()]
                // }
                className={`chessSquare ${
                  (board().board.length - 1 - index()) % 16 < 8
                    ? (board().board.length - 1 - index()) % 2 == 0
                      ? "lighterBackground"
                      : ""
                    : (board().board.length - 1 - index()) % 2 == 0
                    ? ""
                    : "lighterBackground"
                }`}
                id={boardIds[board().board.length - 1 - index()]}
                index = {board().board.length - 1 - index()}
                board={board}
                setDisplayInlay={setDisplayInlay}
                setDisplayInlayX={setDisplayInlayX}
                inlaySelection={inlaySelection}
                displayInlay={displayInlay}
                color="black"
                movePieceSound={movePieceSound}
                capturePieceSound={capturePieceSound}
                setCrowningMove={setCrowningMove}
    
              />
            )}
          </For>
        </DragDropContextProvider>
      </div>
      <Show when={inGame()}>
        <UserName user={user} color="black" board={board} moves={moves} allPieces={allPieces} setAllPieces={setAllPieces}/>
      </Show>
    </>
  );
}

export default BlackChessboard;

