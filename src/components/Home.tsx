import {
  createReaction,
  createResource,
  createSignal,
  onMount,
  Show,
  createEffect,
  onCleanup,
  from,
} from "solid-js";
import WhiteChessboard from "./WhiteChessboard";
import BlackChessboard from "./BlackChessboard";
import GlassOverlay from "./GlassOverlay";
import UsersList from "./UsersList";
import { Board, Move } from "../Classes/chessClasses";
import axios, { all } from "axios";
import MoveSound from "../Soundfiles/move-self.mp3";
import CaptureSound from "../Soundfiles/capture.mp3";
import BallsBackground from "./BallsBackground";
import { User, CreateGameNotification } from "../Classes/Types";
import { ChessWebSocket } from "../Classes/ChessWebSockets";
import { VirtualMouse } from "../Classes/VirtualMouse";
import { updateMove } from "../Classes/Types";

type Props = {};

//here I choose the color of board, but this is too soon, I need to create a pop up screen to choose a username
//that also checks for a username, in both session, and local storage. And, then requests the graphql to see if the user exisits,
//and if there are any active games, and if so, it will load the game. Otherwise, it will create the user, in the graphl, or update it.

function Home({}: Props) {
  const movePieceSound = new Audio(MoveSound);
  const capturePieceSound = new Audio(CaptureSound);
  const [board, setBoard] = createSignal<Board>(new Board());
  const [inGame, setInGame] = createSignal<boolean>(false);
  const [inGameColor, setInGameColor] = createSignal<string>("");
  const [allPieces, setAllPieces] = createSignal<HTMLElement[]>([]);
  const [everyPiece, setEveryPiece] = createSignal<HTMLElement[]>([]);
  const [lastMove, setLastMove] = createSignal<Move>();
  const [checkmate, setCheckmate] = createSignal<boolean>(false);
  const [moves, setMoves] = createSignal<updateMove[]>([]);

  const [user, setUser] = createSignal<User>();
  const [opponent, setOpponent] = createSignal<User>();
  const [users, setUsers] = createSignal<User[]>([]);
  const [inSession, setInSession] = createSignal<boolean>(false);
  const [notificationUser, setNotificationUser] = createSignal<
    User | undefined
  >();
  const [notificationData, setNotificationData] = createSignal(null);

  const chessWebSocket = new ChessWebSocket(
    board,
    setBoard,
    user,
    setUser,
    moves,
    setMoves
  );

  onCleanup(() => {
    if (chessWebSocket.ws()) {
      chessWebSocket.close();
    }
  });

  onMount(async () => {
    window.users = users;
    checkforUser();
    listenForUserUpdates();
    document.addEventListener("mousedown", (e) => onMouseDown(e));
    document.ws = chessWebSocket.ws();
  });

  function listenForUserUpdates() {
    document.addEventListener("usersUpdated", (event) => {
      let newUsers = event.data.filter((dataUser) => user().id != dataUser.id);
      setUsers([...newUsers]);
    });
    document.addEventListener("notification", (event) => {
      onNotificationReceived(event.data);
    });
    document.addEventListener("updateUser", (event) => {
      // console.log("update user event received", event.data.CatUrl);
      let mainUser = document.querySelector("#mainUser");
      // console.log(mainUser.querySelector(".catLogo"));

      mainUser.querySelector(".catLogo").style.backgroundImage = "nothing";
      // mainUser.querySelector(".catLogo").style.backgroundImage = `url("${event.data.CatUrl}");`;
    });
    document.addEventListener("updateBoard", (event) => {
      updateAllBoards(event.data);
    });
    document.addEventListener("crowned", (event) => {
      console.log("listened to crowned event");
      console.log("event data", event.data);
      crown(event.data);
    });
    document.addEventListener("forceBoardUpdate", (event) => {
      updateBoard();
      movePieceSound.play();
    });

    document.addEventListener("move", (event) => {
      console.log("move event received", event);
     chessWebSocket.sendChessUpdate(board(), user()!, opponent()!, board().History)
    });
  }

  //here I send the position info
  function crown(newBoard: Board) {
    console.log("crowned event received", newBoard);
    let pawnIndex = chessWebSocket.crownedIndex;
    console.log("crowned index", pawnIndex);
    let pawn = board().getPieceAtBoardIndex(pawnIndex);
    console.log("crowned pawn", pawn);
    let previousType = pawn.type;
    console.log("previous type", previousType);
    let newPieceType = newBoard.board[pawnIndex];
    console.log("new piece type", newPieceType);
    let newLowerCasePieceType = newPieceType.toLowerCase();
    pawn.type = newLowerCasePieceType;
    board().board[pawnIndex] = newPieceType;

    let UIPiece = document.getElementById(pawn.position.position)?.children[0];
    UIPiece?.classList.remove(previousType);
    UIPiece?.classList.add(newPieceType);
    let newLastMove = moves()[moves().length - 1];
    newLastMove.crownedTo = newPieceType;
    newLastMove.crowning = true;
    let newMoves = moves().splice(0, moves().length - 1);
    newMoves.push(newLastMove);
    setMoves(newMoves);

    updateBoard();
  }

  //prevent double click from selecting text
  function onMouseDown(mouseEvent: any) {
    // Check if the event is a double click
    if (mouseEvent.detail > 1) {
      mouseEvent.preventDefault(); // Prevent text selection for double clicks
    }
  }

  //get user from local storage
  async function checkforUser() {
    //check for user in local storage
    //check for user in session storage
    //check for user in graphql
    let chessData = sessionStorage.getItem("gabrielmalek/chess.data");
    let chessDataJson = JSON.parse(chessData!);
    if (chessData == null) {
      console.log("session storage null");
    } else {
      console.log("session storage not null");
      let stringUser = new User(
        chessDataJson.id,
        chessDataJson.username,
        chessDataJson.CatUrl
      );
      setUser(stringUser);
      setInSession(true);
      chessWebSocket.beginPinging(user);

      console.log("should be pinging");
      return;
    }
    chessData = localStorage.getItem("gabrielmalek/chess.data");
    chessDataJson = JSON.parse(chessData!);
    if (chessData == null) {
      console.log("local storage null");
    } else {
      let newUser = new User(
        chessDataJson.id,
        chessDataJson.username,
        chessDataJson.CatUrl
      );
      if (newUser.username == "" || newUser.username == undefined) {
        return;
      }
      setUser(newUser);
      setInSession(false);
    }
  }



 



  //revise
  async function updateAllBoards(result: any) {
    // console.log(result);
    if (result === undefined) {
      console.log("DATA", result);
      await updateBoard();
      chessWebSocket.sendChessUpdate(board(), user(), opponent(), moves());
      return;
    }
  }

  //syncs board with give fen
  function syncFens(newFen: string) {
    let newBoard = new Board(undefined, newFen);
    board().board = newBoard.board;
    board().fen = newBoard.fen;
    board().Pieces = newBoard.Pieces;
    return;
  }

  //receive notification and fire off event
  function onNotificationReceived(notification: any) {
    setNotificationData(notification);
    //I need to either start a game or join a game
    if (notification.type == "promptForGame") {
      setNotificationData(notification);
      // console.log("prompt for game");
      let button = document.querySelector("#notificationButton");
      button.click();
    } else if (notification.type == "createGame") {
      // console.log("received create game notification", notification);
      setNotificationData(notification);
      //game has already been created and we are already in it,
      //what we need to do it make sure to ping the server to let it know we are alive
      setInGameColor(notification.fromUserColor);
      setEveryPiece(document.querySelectorAll("section.piece"));
      setOpponent(notification.to);
      setInGame(true);

      let virtualMouse = new VirtualMouse(
        chessWebSocket.ws,
        user(),
        notification.to,
        board
      );
      virtualMouse.init();
      removeBackDrop();
      board().Pieces.forEach((e)=> e.syncUIPosition())
    }
  }

  //creates a new game after accepting a notification
  async function createAndJoinGame(notification: any) {
    console.log("we must create a game");
    //we are the receiving(to) user, we create the game
    let createGameNotif = new CreateGameNotification(
      notification.from,
      notification.to
    );
    //send websocket notification
    try {
      chessWebSocket.ws().send(JSON.stringify(createGameNotif));
      setInGameColor(
        createGameNotif.fromUserColor === "white" ? "black" : "white"
      );
      console.log("oppoent", notification.from);
      let OpponentUser = new User(
        notification.from.id,
        notification.from.username,
        notification.from.CatUrl
      );
      setOpponent(notification.from);
      setInGame(true);
      setEveryPiece(document.querySelectorAll("section.piece"));

      let virtualMouse = new VirtualMouse(
        chessWebSocket.ws,
        user(),
        notification.from,
        board
      );
      virtualMouse.init();
      // console.log(virtualMouse);
      removeBackDrop();
      board().Pieces.forEach((e)=> e.syncUIPosition());
    } catch (error) {
      console.log("error: ", error);
    }
  }

  //removes modal backdrop after solid js removes the modal
  function removeBackDrop() {
    let backDrop = document.querySelector(".modal-backdrop ");
    if (backDrop != null) {
      backDrop.remove();
    }
  }

  //need to highlight the squares that are the last move

  return (
    <>
      <BallsBackground />
      <Show when={!inSession() && inGame() == false}>
        <GlassOverlay
          user={user}
          setUser={setUser}
          setInSession={setInSession}
          chessWebSocket={chessWebSocket}
        />
      </Show>
      <Show when={inSession() && inGame() == false}>
        <UsersList
          users={users}
          user={user}
          setNotificationUser={setNotificationUser}
          onNotificationReceived={onNotificationReceived}
          chessWebSocket={chessWebSocket}
        />
      </Show>

      <Show when={inGameColor() == "white" && inGame() == true}> 
        <WhiteChessboard
          board={board}
          updateBoard={updateAllBoards}
          setLastMove={setLastMove}
          lastMove={lastMove}
          movePieceSound={movePieceSound}
          capturePieceSound={capturePieceSound}
          setMoves={setMoves}
          moves={moves}
          user={user}
          opponent={opponent}
          inGame={inGame}
          allPieces={allPieces}
          setAllPieces={setAllPieces}
        />
      </Show>
      <Show
        when={
          inGame() == false || (inGameColor() == "black" && inGame() == true)
        }
      >
        <BlackChessboard
          board={board}
          updateBlackBoard={updateAllBoards}
          setLastMove={setLastMove}
          lastMove={lastMove}
          movePieceSound={movePieceSound}
          capturePieceSound={capturePieceSound}
          setMoves={setMoves}
          moves={moves}
          user={user}
          opponent={opponent}
          inGame={inGame}
          allPieces={allPieces}
          setAllPieces={setAllPieces}
        />
      </Show>

      <Show when={inGame() == false}>
        <div
          id="notificationButton"
          data-bs-toggle="modal"
          data-bs-target={"#notificationModal"}
        ></div>

        <div
          class="modal fade "
          id="notificationModal"
          style={{ display: "none" }}
          tabindex="-1"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog absolute top-[39vh] left-1/ ">
            <div class="modal-content w-[50px] ">
              <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel">
                  Play Chess with "{notificationUser()?.username}"
                </h1>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                You've recieved a notification from "
                {notificationUser()?.username}" to play chess. Do you accept?
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  class="btn btn-primary"
                  onClick={() => {
                    //
                    createAndJoinGame(notificationData());
                  }}
                >
                  Play Chess
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}

export default Home;
