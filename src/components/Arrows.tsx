import { Accessor, createSignal, onMount, Setter } from "solid-js";
import { updateMove } from "../Classes/Types";
import MoveSound from "../Soundfiles/move-self.mp3";
import { Board, Move } from "../Classes/chessClasses";


type Props = {
  board: Accessor<Board>;
};


function Arrows({ board }: Props) {

  let possiblePieces: HTMLElement[] = []

  function positionArrows() {
    let windowHeight = window.innerHeight;
    let arrows = document.querySelector(".arrows");
    // let arrowsRect = arrows.getBoundingClientRect();
    let board = document.querySelector(".chessBoard");
    let boardRect = board.getBoundingClientRect();
    let boardHeight = boardRect.height;
    let userNameWidget = document.querySelector(".userNameWidgetHolder");
    let userNameWidgetRect = userNameWidget.getBoundingClientRect();
    let userHeight = userNameWidgetRect.height;
    let z = boardHeight + userHeight * 2;
    let x = (windowHeight - z) / 2 + z;
    arrows.style.top = `${x}px`;
  }

  const moveSound = new Audio(MoveSound);
  let forwardClick = false;
  let block = false;

  onMount(() => {
    positionArrows();
    window.addEventListener("resize", () => {
      positionArrows();
    });
  
  });





 

  async function goBackToFirstMove(instant: boolean = true) {
    for (let i = board().moveIndex; i > -1; i--) {
      await goBackOneMove(instant);
    }
    board().inLastMove = false;
    moveSound.play();
  }
  async function goBackOneMove(instant: boolean = false) {
    console.log(board().History[board().moveIndex])
    block = true;
    if (board().History.length === 0) {
      block = false;
      return;
    }
    board().inLastMove = false;
    if (board().moveIndex === -1) {
      block = false;
      return;
    }
    //first thing we do is we undo a move;
    //then we set the move index to the previous move
    await board().executeUIMoveReverse(board().History[board().moveIndex], instant);
    board().moveIndex--;
    board().setLastMoveUIIndicator(board().History[board().moveIndex]);
    block = false;
  }
  async function goForwardOneMove(instant: boolean = false) {
    console.log(board().History.length);
    console.log(board().moveIndex);
    block = true;
    if (board().History.length === 0) {
      block = false;
      return;
    }
    if(board().moveIndex === 0){
      board().inLastMove = true;
    }
    if (board().moveIndex === board().History.length - 1) {
      board().inLastMove = true;
      block = false;
      return;
    }
    await board().executeUIMove(board().History[board().moveIndex + 1], instant);
    board().moveIndex++;
    board().setLastMoveUIIndicator(board().History[board().moveIndex]);
    block = false;
  }
  async function goForwardToLastMove(instant: boolean = true) {
    for (let i = board().moveIndex; i < board().History.length - 1; i++) {
      await goForwardOneMove(instant);
    }
    moveSound.play();
    board().inLastMove = true;
  }
  return (
    <div class="arrows">
      <div
        onClick={async () => {
          block === false ? goBackToFirstMove() : null;
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-7 h-7"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
          />
        </svg>
      </div>
      <div
        onClick={async () => {
          block === false ? goBackOneMove() : null;
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-7 h-7"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </div>
      <div
        onClick={async () => {
          block === false ? goForwardOneMove() : null;
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-7 h-7"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
      <div
        onClick={async () => {
          block === false ? goForwardToLastMove() : null;
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="w-7 h-7"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
    </div>
  );
}

export default Arrows;
