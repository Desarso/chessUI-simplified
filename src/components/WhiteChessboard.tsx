// type Props = {};
import { Board, Move, TEST } from "../Classes/chessClasses";
import { User, updateMove } from "../Classes/Types";
import { createSignal, For, Show, Setter, Accessor, onMount } from "solid-js";
import { DragDropContextProvider } from "./DragDropContext";
import ChessSquare from "./ChessSquare";
import UserName from "./UserName";
import OpponentName from "./OpponentName";
// let mainTest = new TEST();
// mainTest.runAllTests();

type Props = {
  board: Accessor<Board>;
  updateBoard: any;
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

function WhiteChessboard({
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

  onMount(() => {
    setTimeout(() => {
      let pieces = board().Pieces
      pieces.forEach((e)=> e.syncUIClass())
      
    }, 700);
  });



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
  //need to keep track of board more dynamically so that it updates better
  let eatenPieces: any = [];

  //this is the inlay responsible for pawn promotion
  const [displayInlay, setDisplayInlay] = createSignal(false);
  const [displayInlayX, setDisplayInlayX] = createSignal("00");
  const [inlaySelection, setInlaySelection] = createSignal("");
  const [crowningMove, setCrowningMove] = createSignal();

  //here I need to mount an event listener or alternatively I can just have


  async function handleSelection(selection: string) {
    setInlaySelection(selection);
    setDisplayInlay(false);
    let move = crowningMove();
    board().moveLegally(move.from, move.to, selection.toLowerCase());
    //we want to send a legal move to the websockets
  }


  //later I will make a black board, and white board component and just change all the settings accordingly
  return (
    <>
      <Show when={inGame()}>
        <OpponentName opponent={opponent} color="black" board={board} />
      </Show>
      <div class="chessBoard">
        <DragDropContextProvider>
          <Show when={displayInlay()}>
            <div class={`chessInlay ml-[${displayInlayX()}]`}>
              <div
                class="chessInlaySquare"
                id="queenSelection"
                onClick={() => handleSelection("Q")}
              >
                <div class="piece Q"></div>
              </div>
              <div
                class="chessInlaySquare"
                id="knightSelection"
                onClick={() => handleSelection("N")}
              >
                <div class="piece N"></div>
              </div>
              <div
                class="chessInlaySquare"
                id="rookSelection"
                onClick={() => handleSelection("R")}
              >
                <div class="piece R"></div>
              </div>
              <div
                class="chessInlaySquare"
                id="bishopSelection"
                onClick={() => handleSelection("B")}
              >
                <div class="piece B"></div>
              </div>
            </div>
          </Show>

          <For each={board().board}>
            {(square, index) => (
              <ChessSquare
                className={`chessSquare ${
                  index() % 16 < 8
                    ? index() % 2 == 0
                      ? "lighterBackground"
                      : ""
                    : index() % 2 == 0
                    ? ""
                    : "lighterBackground"
                }`}
                id={boardIds[index()]}
                index={index()}
                board={board}
                setDisplayInlay={setDisplayInlay}
                setDisplayInlayX={setDisplayInlayX}
                inlaySelection={inlaySelection}
                displayInlay={displayInlay}
                color="white"
                movePieceSound={movePieceSound}
                capturePieceSound={capturePieceSound}
                setCrowningMove={setCrowningMove}
              />
            )}
          </For>
        </DragDropContextProvider>
      </div>
      <Show when={inGame()}>
        <UserName user={user} color="white" board={board} moves={moves} allPieces={allPieces} setAllPieces={setAllPieces} />
      </Show>
    </>
  );
}

export default WhiteChessboard;

function generateRandomID() {
  return Math.random().toString(36).substr(2, 9);
}

//all board positions will be represented using a number and a letter in the standard chess notations
//all moves will be a string of two positions or 4 if its castling
//pieces will be classes, they will be represented by a char, but will be set as a constant.
//I should do the game at a high leve logic since, the board must keep game state.
//The entire board logic should be done from high up. Then certain states that get passed down will be modified.
//Remeber to make the API clean and easy to use.
