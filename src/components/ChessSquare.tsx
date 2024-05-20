import { Show, createSignal, onMount, Setter, Accessor } from "solid-js";
import { className } from "solid-js/web";
import { useDragDropContext } from "./DragDropContext";
import { updateMove } from "../Classes/Types";
import { Board } from "../Classes/chessClasses";

type Props = {
  className: string;
  board: Accessor<Board>;
  displayInlay: Accessor<boolean>;
  setDisplayInlay: Setter<boolean>;
  setDisplayInlayX: Setter<string>;
  inlaySelection: Accessor<string>;
  movePieceSound: any;
  capturePieceSound: any;
  index: number;
  id: string;
  color: string;
  setCrowningMove : any;
};

function ChessSquare({
  className,
  board,
  setDisplayInlay,
  setDisplayInlayX,
  displayInlay,
  movePieceSound,
  capturePieceSound,
  index,
  id,
  setCrowningMove,
  color,
}: Props) {
  onMount(() => {
    window.board = board;
  });

  const Droppable = ({ id, className, draggable, board }: any) => {
    const {
      onHoverOver,
      createDroppable,
      onHoverOut,
      onGlobalDragStart,
      onGlobalDragEnd,
    } = useDragDropContext();
    const droppable = createDroppable(id);

    onHoverOver((e: any) => {
      droppable.ref.classList.add("hovered");
    }, droppable);

    onHoverOut((e: any) => {
      droppable.ref.classList.remove("hovered");
    }, droppable);

    onGlobalDragStart((e: any) => {
      if(board().moveIndex != board().History.length-1) return;
      if (displayInlay()) {
        return;
      }
      if (e.data.legalPieceMoves.includes(droppable.id)) {
        if (
          droppable.ref.children.length === 0 ||
          droppable.ref.querySelector(".piece") == undefined
        ) {
          droppable.droppable = true;
          let newElement = document.createElement("section");
          newElement.classList.add("circle");
          droppable.ref.appendChild(newElement);
        } else if (
          droppable.ref.children.length > 0 &&
          droppable.ref.querySelector(".piece") != undefined
        ) {
          droppable.droppable = true;
          let piece;
          for (let i = 0; i < droppable.ref.children.length; i++) {
            if (droppable.ref.children[i].classList.contains("piece")) {
              piece = droppable.ref.children[i];
            }
          }
          piece.children[0]?.classList.add("circle");
        }
      } else {
        droppable.droppable = false;
      }
    });

    onGlobalDragEnd((e: any) => {
      // if(e.srcElement.classList?.contains("piece") || false){

      //   if(color !== board().currentTurnColor){
      //     return;
      //   }
      // }else{
      //   if (color == board().currentTurnColor) {
      //     return;
      //   }
      // }
      if(board().moveIndex != board().History.length-1) return;
      let circles = droppable.ref.querySelectorAll("section.circle");
      //removing  circle
      for (let i = 0; i < circles.length; i++) {
        circles[i].remove();
      }
      let pieceCircles = droppable.ref.querySelectorAll("div.circle");
      for (let i = 0; i < pieceCircles.length; i++) {
        pieceCircles[i].classList.remove("circle");
      }

      //loop over all droppables and if their id matches lastMove, add class lastMove
    });


    return (
      <div id={id} class={className} ref={droppable.ref}>
        <Show when={draggable != undefined}>{draggable}</Show>
        <Show
          when={
            (id[1] === "8" && color === "black") ||
            (id[1] === "1" && color === "white")
          }
        >
          <div class={"number-right"} style={"pointer-events: none;"}>
            {id[0]}
          </div>
        </Show>
        <Show
          when={
            (id[0] === "h" && color === "black") ||
            (id[0] === "a" && color === "white")
          }
        >
          <div class="number-left" style={"pointer-events: none;"}>
            {id[1]}
          </div>
        </Show>
      </div>
    );
  };

  const Draggable = ({ id, board }: any) => {
    const { onDragStart, onDragEnd, createDraggable } = useDragDropContext();
    const draggable = createDraggable(id);

    let from: string;
    let to: string;

    onDragStart(() => {
      if (displayInlay()) return;
      if(board().moveIndex != board().History.length-1) return;
      from = draggable.ref.parentElement.id;
      let legalMoves = board().findLegalMoves(board());
      if (legalMoves.length === 0) {
        board().checkMate = true;
      }
      let legalPieceMoves = [];
      for (let i = 0; i < legalMoves.length; i++) {
        if (legalMoves[i].start == from) {
          legalPieceMoves.push(legalMoves[i].end);
        }
      }
      draggable.data.legalPieceMoves = legalPieceMoves;
    }, draggable);

    onDragEnd(async (e: any) => {

      if(board().moveIndex != board().History.length-1) return;
      if(e == undefined) return;
      if (displayInlay()) return;
      let piece = board().getPieceByPosition(from);
      let UIPiece = piece.UIComponent;

      console.log("e is ", e);
      
      if (piece.type === "p" && piece.color === color) {
        if (piece.color === "white" && e?.id[1] === "8") {
          await delay(100);
          setDisplayInlay(true);
          let position = UIPiece.parentNode.id;
          position = position.charCodeAt(0) - 97;
          setDisplayInlayX(position);
          setCrowningMove({from: from, to: e.id});
          return
        } else if (piece.color === "black" && e.id[1] === "1") {
          await delay(100);
          setDisplayInlay(true);
          let position = UIPiece.parentNode.id;
          position = position.charCodeAt(0) - 97;
          setDisplayInlayX(position);
          setCrowningMove({from: from, to: e.id});
          return
        }
      }

      //if square does not have a circe, return
      if (draggable.droppable === false) {
        return;
      }



      to = e?.id;

      //here I perform most moves but not crowning moves
      board().moveLegally(from, to);
      //we want to send a legal move to the websockets



    }, draggable);

    let piece = board().getPieceByPosition(id);
    if (piece === undefined) {
      return <section ref={draggable.ref} class="noDrag"></section>;
    }

    piece = piece.UIComponent;
    draggable.ref = piece;
    piece.ref = draggable.ref;
    

    return piece;
  };

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  return (
    <Droppable
      className={className}
      id={id}
      board={board}
      draggable={<Draggable board={board} id={id} />}
    />
  );
}

export default ChessSquare;
