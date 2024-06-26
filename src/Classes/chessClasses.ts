import { updateMove } from "./Types";
import { searchForWorkspaceRoot } from "vite";

const bishop = "b";
const king = "k";
const knight = "n";
const pawn = "p";
const queen = "q";
const rook = "r";

import MoveSound from "../Soundfiles/move-self.mp3";
import { create } from "domain";
import { createSign } from "crypto";
import { Accessor, Setter, Signal, createSignal } from "solid-js";
const moveSound = new Audio(MoveSound);

// this.board().capturedPieces = newBoard.capturedPieces;
// this.board().Pieces = newBoard.Pieces; // this.board().capturedPieces = newBoard.capturedPieces;
// this.board().Pieces = newBoard.Pieces;
export class V2D {
  x: number;
  y: number;
  state = true;
  magnitude: number = 0;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Move {
  start: string;
  end: string;
  boardStartIndex: number;
  boardEndIndex: number;

  constructor(start2D?: V2D, end2D?: V2D, start?: string, end?: string) {
    if (start) this.start = start;
    if (end) this.end = end;
    if (start && end) {
      this.boardStartIndex = this.convertToBoardIndex(start);
      this.boardEndIndex = this.convertToBoardIndex(end);
      return;
    }
    if (start2D && end2D) {
      this.boardStartIndex = start2D.x + start2D.y * 8;
      this.boardEndIndex = end2D.x + end2D.y * 8;
      this.start = this.convertToBoardPosition(this.boardStartIndex);
      // console.log("endindex",this.boardEndIndex);
      this.end = this.convertToBoardPosition(this.boardEndIndex);
    } else {
      this.start = "a8";
      this.end = "a8";
      this.boardStartIndex = 0;
      this.boardEndIndex = 0;
    }
  }

  public toString(): string {
    return this.start + "-" + this.end;
  }

  private convertToBoardIndex(position: string): number {
    //converts a string to a board index
    if (position.length != 2) {
      throw new Error("Invalid position");
    }
    let letter = position[0];
    let number = position[1];
    let letterIndex = letter.charCodeAt(0) - 97;
    //
    // let numberIndex = parseInt(number) - 1
    let numberIndex = 8 - parseInt(number);

    return letterIndex + numberIndex * 8;
  }

  private convertToBoardPosition(index: number): string {
    //converts a board index to a string
    if (index < 0 || index > 63) {
      throw new Error("Invalid index: " + index);
    }
    let letterIndex = index % 8;
    let numberIndex = Math.floor(index / 8);
    let letter = String.fromCharCode(letterIndex + 97);
    let number = 8 - numberIndex;
    return letter + number;
  }

  private testConverToBoardIndex() {
    let tests = [];
    tests.push(this.convertToBoardIndex("a8") == 0);
    tests.push(this.convertToBoardIndex("b8") == 1);
    tests.push(this.convertToBoardIndex("c8") == 2);
    tests.push(this.convertToBoardIndex("d8") == 3);
    tests.push(this.convertToBoardIndex("e8") == 4);
    tests.push(this.convertToBoardIndex("f8") == 5);
    tests.push(this.convertToBoardIndex("g8") == 6);
    tests.push(this.convertToBoardIndex("h8") == 7);
    tests.push(this.convertToBoardIndex("a7") == 8);
    tests.push(this.convertToBoardIndex("b7") == 9);
    tests.push(this.convertToBoardIndex("c7") == 10);
    tests.push(this.convertToBoardIndex("d7") == 11);
    tests.push(this.convertToBoardIndex("e7") == 12);
    tests.push(this.convertToBoardIndex("f7") == 13);
    tests.push(this.convertToBoardIndex("g7") == 14);
    tests.push(this.convertToBoardIndex("h7") == 15);
    tests.push(this.convertToBoardIndex("a6") == 16);
    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Convert to board Index failed failed");
      }
    }
  }

  runAllTests() {
    this.testConverToBoardIndex();

    console.log("All tests ran for move class");
  }
  //move here consists of two string, problem is that I need to convert the string to a board index for it to be useful
}

export class Position {
  position: string;
  pos: V2D;
  boardIndex: number;
  constructor(position?: string, boardIndex?: number) {
    if (position) {
      this.position = position;
      this.boardIndex = this.convertToBoardIndex(position);
      // console.log("constructor board index", this.boardIndex);
      this.pos = new V2D(
        this.convertToBoardIndex(position) % 8,
        Math.floor(this.convertToBoardIndex(position) / 8)
      );
    } else if (boardIndex) {
      this.boardIndex = boardIndex;
      this.position = this.convertToBoardPosition(boardIndex);
      this.pos = new V2D(boardIndex % 8, Math.floor(boardIndex / 8));
    } else {
      this.position = "a8";
      this.boardIndex = 0;
      this.pos = new V2D(0, 0);
    }
  }
  moveTo(position: string) {
    this.position = position;
    this.boardIndex = this.convertToBoardIndex(position);
    this.pos = new V2D(this.boardIndex % 8, Math.floor(this.boardIndex / 8));
  }

  getPosition() {
    return this.position;
  }
  getIndex() {
    return this.boardIndex;
  }

  private convertToBoardIndex(position: string): number {
    //converts a string to a board index
    if (position.length != 2) {
      throw new Error("Invalid position");
    }
    let letter = position[0];
    let number = position[1];
    let letterIndex = letter.charCodeAt(0) - 97;
    //
    // let numberIndex = parseInt(number) - 1
    let numberIndex = 8 - parseInt(number);

    return letterIndex + numberIndex * 8;
  }

  private testConvertToBoardIndex(): void {
    let tests = [];
    tests.push(this.convertToBoardIndex("a8") == 0);
    tests.push(this.convertToBoardIndex("b8") == 1);
    tests.push(this.convertToBoardIndex("c8") == 2);
    tests.push(this.convertToBoardIndex("d8") == 3);
    tests.push(this.convertToBoardIndex("e8") == 4);
    tests.push(this.convertToBoardIndex("f8") == 5);
    tests.push(this.convertToBoardIndex("g8") == 6);
    tests.push(this.convertToBoardIndex("h8") == 7);
    tests.push(this.convertToBoardIndex("a7") == 8);
    tests.push(this.convertToBoardIndex("b7") == 9);
    tests.push(this.convertToBoardIndex("c7") == 10);
    tests.push(this.convertToBoardIndex("d7") == 11);
    tests.push(this.convertToBoardIndex("e7") == 12);
    tests.push(this.convertToBoardIndex("f7") == 13);
    tests.push(this.convertToBoardIndex("g7") == 14);
    tests.push(this.convertToBoardIndex("h7") == 15);
    tests.push(this.convertToBoardIndex("a6") == 16);
    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Convert to board Index failed failed");
      }
    }
  }

  private convertToBoardPosition(boardIndex: number): string {
    //converts a string to a board index
    let letterIndex = boardIndex % 8;
    let numberIndex = Math.floor(boardIndex / 8);
    let letter = String.fromCharCode(letterIndex + 97);
    let number = 8 - numberIndex;
    return letter + number;
  }

  private testConvertToPosition() {
    let tests = [];
    tests.push(this.convertToBoardPosition(0) == "a8");
    tests.push(this.convertToBoardPosition(0) == "a8");
    tests.push(this.convertToBoardPosition(0) == "a8");
    tests.push(this.convertToBoardPosition(1) == "b8");
    tests.push(this.convertToBoardPosition(2) == "c8");
    tests.push(this.convertToBoardPosition(3) == "d8");
    tests.push(this.convertToBoardPosition(4) == "e8");
    tests.push(this.convertToBoardPosition(5) == "f8");
    tests.push(this.convertToBoardPosition(6) == "g8");
    tests.push(this.convertToBoardPosition(7) == "h8");
    tests.push(this.convertToBoardPosition(8) == "a7");
    tests.push(this.convertToBoardPosition(9) == "b7");
    tests.push(this.convertToBoardPosition(10) == "c7");
    tests.push(this.convertToBoardPosition(11) == "d7");
    tests.push(this.convertToBoardPosition(12) == "e7");
    tests.push(this.convertToBoardPosition(13) == "f7");
    tests.push(this.convertToBoardPosition(14) == "g7");
    tests.push(this.convertToBoardPosition(15) == "h7");
    tests.push(this.convertToBoardPosition(16) == "a6");
    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Convert to position failed");
      }
    }
  }

  runAllTests() {
    this.testConvertToBoardIndex();
    this.testConvertToPosition();
    console.log("All tests ran for position class");
  }
}

export class Piece {
  private position: Position;
  color: string;
  type: string;
  noDrag: boolean = false;
  UIComponent: any = null;
  appended: boolean = true;

  constructor(position: string, color: string, type: string) {
    this.position = new Position(position);
    this.color = color;
    this.type = type;
  }

  public removeUIComponent() {
    this.UIComponent.remove();
    this.appended = false;
  }

  public syncUIClass() {
    if (this.UIComponent) {
      this.UIComponent.classList = [];
      this.UIComponent.classList.add("piece");
      this.UIComponent.classList.add(
        this.color === "white"
          ? this.type.toUpperCase()
          : this.type.toLowerCase()
      );
      if (this.noDrag) {
        this.UIComponent.classList.add("noDrag");
      }
    }
  }

  public syncUIPosition() {
    let UISquare = document.getElementById(this.position.getPosition());
    if (UISquare) {
      UISquare.appendChild(this.UIComponent);
    }
  }

  public move(end: string) {
    //moves the piece
    this.position.moveTo(end);
  }

  public getPosition(): string {
    return this.position.getPosition();
  }

  public getIndex(): number {
    return this.position.getIndex();
  }

  public getPos(): Position {
    return this.position;
  }

  private convertToBoardIndex(position: string): number {
    //converts a string to a board index
    if (position.length != 2) {
      throw new Error("Invalid position");
    }
    let letter = position[0];
    let number = position[1];
    let letterIndex = letter.charCodeAt(0) - 97;
    //
    // let numberIndex = parseInt(number) - 1
    let numberIndex = 8 - parseInt(number);

    return letterIndex + numberIndex * 8;
  }

  private testConverToBoardIndex() {
    let tests = [];
    tests.push(this.convertToBoardIndex("a8") == 0);
    tests.push(this.convertToBoardIndex("b8") == 1);
    tests.push(this.convertToBoardIndex("c8") == 2);
    tests.push(this.convertToBoardIndex("d8") == 3);
    tests.push(this.convertToBoardIndex("e8") == 4);
    tests.push(this.convertToBoardIndex("f8") == 5);
    tests.push(this.convertToBoardIndex("g8") == 6);
    tests.push(this.convertToBoardIndex("h8") == 7);
    tests.push(this.convertToBoardIndex("a7") == 8);
    tests.push(this.convertToBoardIndex("b7") == 9);
    tests.push(this.convertToBoardIndex("c7") == 10);
    tests.push(this.convertToBoardIndex("d7") == 11);
    tests.push(this.convertToBoardIndex("e7") == 12);
    tests.push(this.convertToBoardIndex("f7") == 13);
    tests.push(this.convertToBoardIndex("g7") == 14);
    tests.push(this.convertToBoardIndex("h7") == 15);
    tests.push(this.convertToBoardIndex("a6") == 16);
    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Convert to board Index failed failed");
      }
    }
  }

  runAllTests() {
    this.testConverToBoardIndex();
    console.log("All tests ran for piece class");
  }
}

export class Board {
  Pieces: Piece[];
  currentTurnColor: string = "white";
  fen: string = "";
  board: string[] = [];
  halfMoveClock: number = 0;
  fullMoveNumber: number = 1;
  castlingRights: string = "KQkq";
  enPassantTargetSquare: string = "-";
  legalMoves: Move[] = [];
  inCheck = false;
  checkMateSignal: Signal<boolean> = createSignal(false);
  checkmate: Accessor<boolean> = this.checkMateSignal[0];
  setCheckmate: Setter<boolean> = this.checkMateSignal[1];
  capturedPieces: Piece[] = [];
  premove: updateMove | null = null;
  // this.board().capturedPieces = newBoard.capturedPieces; // this.board().capturedPieces = newBoard.capturedPieces;
  // this.board().Pieces = newBoard.Pieces;
  // this.board().Pieces = newBoard.Pieces;: HTMLElement[] = [];
  History: updateMove[] = [];
  moveIndex: number = -1;
  inLastMove: boolean = true;

  //constructor creates a board with all the pieces in their starting positions
  constructor(board?: string[], fen?: string) {
    if (!board) {
      board = [
        "r",
        "n",
        "b",
        "q",
        "k",
        "b",
        "n",
        "r",
        "p",
        "p",
        "p",
        "p",
        "p",
        "p",
        "p",
        "p",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
        "R",
        "N",
        "B",
        "Q",
        "K",
        "B",
        "N",
        "R",
      ];
    }
    //I will create 32 UI pieces upon initializing the board

    const fenregex =
      /^([rnbqkpRNBQKP1-8]+\/){7}([rnbqkpRNBQKP1-8]+)\s[bw]\s(-|K?Q?k?q?)\s(-|[a-h][36])\s(0|[1-9][0-9]*)\s([1-9][0-9]*)/;

    if (fen != undefined && fen.match(fenregex)) {
      let parts = fen.split(" ");
      board = this.fenToBoard(fen);
      this.castlingRights = parts[2];
      this.enPassantTargetSquare = parts[3];
      parts[1] === "w"
        ? (this.currentTurnColor = "white")
        : (this.currentTurnColor = "black");
      this.halfMoveClock = parseInt(parts[4]);
      this.fullMoveNumber = parseInt(parts[5]);
    } else if (fen != undefined) {
      if (!fen.match(fenregex)) {
        throw new Error("Invalid fen: " + fen);
      }
    }

    let UIPieces: HTMLElement[] = [];
    for (let i = 0; i < 64; i++) {
      if (board[i] != " " && board[i] != undefined) {
        let newSection = document.createElement("section");
        newSection.classList.add("piece");
        // console.log(board[i])
        newSection.classList.add(board[i]);
        newSection.id = this.generateRandomId(20);
        let newDiv = document.createElement("div");
        newSection.appendChild(newDiv);
        newSection.dataset.position = this.convertToPosition(i);
        UIPieces.push(newSection);
      }

      this.Pieces = [];
      for (let i = 0; i < board.length; i++) {
        let piece = board[i];
        if (piece != " ") {
          let color = piece == piece.toUpperCase() ? "white" : "black";
          let type = piece.toLowerCase();
          let position = this.convertToPosition(i);
          let newPiece = new Piece(position, color, type);
          this.Pieces.push(newPiece);
        }
      }

      for (let i = 0; i < this.Pieces.length; i++) {
        this.Pieces[i].UIComponent = UIPieces[i];
      }
    }
    this.UIPieces = UIPieces;
    this.board = board;
    fen != undefined ? (this.fen = fen) : (this.fen = this.boardToFen());
  }

  public getUIPieceByPosition(position: string) {
    let parentelement = document.getElementById(position);
    if (parentelement) {
      let piece = parentelement.querySelector(".piece");
      if (piece) {
        return piece;
      }
    }
  }

  public getPieceByPosition(position: string) {
    for (let i = 0; i < this.Pieces.length; i++) {
      if (this.Pieces[i].getPosition() === position) {
        return this.Pieces[i];
      }
    }
  }

  private convertToPosition(boardIndex: number): string {
    //converts index to position
    let letter = String.fromCharCode(97 + (boardIndex % 8));
    let number = 8 - Math.floor(boardIndex / 8);
    return letter + number;
  }

  public displayBoard() {
    let line = "";
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        line +=
          this.Piece(new V2D(j, i)) === " "
            ? " - "
            : " " +
              (this.Piece(new V2D(j, i)).color === "black"
                ? this.Piece(new V2D(j, i)).type
                : this.Piece(new V2D(j, i)).type.toUpperCase()) +
              " ";
      }

      if (line != undefined) console.log(`${8 - i}| ` + line);
      line = "";
    }
    console.log("    _  _  _  _  _  _  _  _");
    console.log("    A  B  C  D  E  F  G  H");
  }

  public fenToBoard(fen: string): string[] {
    let board = [];
    let fenArray = fen.split(" ");
    let fenBoard = fenArray[0];
    //contains the board in fen notation
    let fenBoardArray = fenBoard.split("/");

    for (let i = 0; i < fenBoardArray.length; i++) {
      let row = fenBoardArray[i];
      let rowArray = row.split("");
      for (let j = 0; j < rowArray.length; j++) {
        let piece = rowArray[j];
        if (piece.match(/[1-8]/)) {
          for (let k = 0; k < parseInt(piece); k++) {
            board.push(" ");
          }
        } else {
          board.push(piece);
        }
      }
    }
    if (board.length === 63) {
      board.push(" ");
    }

    return board;
  }

  public boardToFen(): string {
    let fen = "";
    let emptySpaces = 0;
    //write a a loop that converst my array of pieces into
    //a fen string);
    //I am not addind the necesary spacing after moving the rook. on the bttom corner
    //I am looping 64 times.

    for (let i = 0; i < 64; i++) {
      let Piece = this.getPieceAtBoardIndex(i);
      if (Piece === "") {
        emptySpaces++;
        if (emptySpaces === 8) {
          fen += emptySpaces;
          if (i != 63) {
            fen += "/";
          }
          emptySpaces = 0;
        } else if (i % 8 === 7) {
          fen += emptySpaces;
          if (i != 63) {
            fen += "/";
          }
          emptySpaces = 0;
        }
      } else {
        if (emptySpaces !== 0) {
          fen += emptySpaces;
          emptySpaces = 0;
        }
        fen +=
          Piece.color === "white"
            ? Piece.type.toUpperCase()
            : Piece.type.toLowerCase();
        if (Piece.getIndex() % 8 === 7 && i !== 63) {
          fen += "/";
          emptySpaces = 0;
        }
      }
    }

    fen += " " + this.currentTurnColor[0] + " ";
    fen += this.castlingRights + " ";
    fen += this.enPassantTargetSquare + " ";
    fen += this.halfMoveClock + " ";
    fen += this.fullMoveNumber;
    return fen;
  }

  public getPieceAtBoardIndex(index: number): any {
    for (let j = 0; j < this.Pieces.length; j++) {
      if (this.Pieces[j].getIndex() === index) {
        return this.Pieces[j];
      }
    }
    return "";
  }

  private async movePiece(start: string, end: string) {
    //all this function does is change the position of the piece independent of the board.
    let newMove = new Move(undefined, undefined, start, end);
    newMove.boardEndIndex;
    //so move first gets the current piece index
    let pieceIndex = this.getPieceIndex(start);
    //then it gets the piece at that index
    let piece = this.Pieces[pieceIndex];

    if (piece?.type === undefined) {
      throw new Error("Invalid move");
    }

    if (piece.type != "p") {
      this.halfMoveClock++;
    } else {
      this.halfMoveClock = 0;
    }

    //checking if en-passant is possible and if the current move is a pawn
    if (this.enPassantTargetSquare != "-" && piece.type === "p") {
      let startPos = new Position(start);
      let endPos = new Position(end);

      if (
        piece.color === "white" &&
        startPos.pos.y === 3 &&
        endPos.position === end
      ) {
        //all I need to do here is remove the old piece from it's current spot.
        //so what we need to do is target the square that is 8 spaces away from the en-peasant square
        //since the piece is white, then it would be +8;
        let pieceToRemoveIndex = endPos.boardIndex + 8;
        let pieceToRemove = this.getPieceAtBoardIndex(pieceToRemoveIndex);
        this.board[pieceToRemoveIndex] = " ";
        this.Pieces.splice(this.Pieces.indexOf(pieceToRemove), 1);
      }
      if (
        piece.color === "black" &&
        startPos.pos.y === 4 &&
        endPos.position === end
      ) {
        //all I need to do here is remove the old piece from it's current spot.
        //so what we need to do is target the square that is 8 spaces away from the en-peasant square
        //since the piece is black, then it would be -8;
        let pieceToRemoveIndex = endPos.boardIndex - 8;
        let pieceToRemove = this.getPieceAtBoardIndex(pieceToRemoveIndex);
        this.board[pieceToRemoveIndex] = " ";
        this.Pieces.splice(this.Pieces.indexOf(pieceToRemove), 1);
      }

      // this.inCheck = this.isInCheck(this);
    }

    //set en-passant target square on pawn double move
    if (
      piece.type == "p" &&
      Math.abs(piece.getIndex() - newMove.boardEndIndex) == 16
    ) {
      let enPassant = "-";
      if (piece.color === "white") {
        enPassant = this.convertToPosition(newMove.boardEndIndex + 8);
      } else {
        enPassant = this.convertToPosition(newMove.boardEndIndex - 8);
      }
      this.enPassantTargetSquare = enPassant;
    } else {
      this.enPassantTargetSquare = "-";
    }

    if (piece.type === "k") {
      if (piece.color === "white") {
        let startPos = new Position(start);
        let endPos = new Position(end);
        if (
          startPos.pos.x - endPos.pos.x === 2 &&
          this.castlingRights.includes("Q")
        ) {
          let rookStart = this.convertToPosition(startPos.boardIndex - 4);
          let rookEnd = this.convertToPosition(startPos.boardIndex - 1);
          //the problem here is that the king and rook move are just one move not two and so the whole thing is wrong.
          //instead of calling move piece I need to call the inner piece function.
          let rook = this.getPieceAtBoardIndex(startPos.boardIndex - 4);
          this.castlingRights = this.castlingRights.replace("KQ", "");
          if (rook.color != undefined) {
            rook.move(rookEnd);
          }
        }
        if (
          startPos.pos.x - endPos.pos.x === -2 &&
          this.castlingRights.includes("K")
        ) {
          let rookStart = this.convertToPosition(startPos.boardIndex + 3);
          let rookEnd = this.convertToPosition(startPos.boardIndex + 1);
          let rook = this.getPieceAtBoardIndex(startPos.boardIndex + 3);
          // console.log(rookEnd);
          // console.log(rook);
          this.castlingRights = this.castlingRights.replace("KQ", "");
          if (rook.color != undefined) {
            rook.move(rookEnd);
          }
        }
        this.castlingRights = this.castlingRights.replace("KQ", "");
      } else {
        let startPos = new Position(start);
        let endPos = new Position(end);
        if (
          startPos.pos.x - endPos.pos.x === 2 &&
          this.castlingRights.includes("q")
        ) {
          let rookStart = this.convertToPosition(startPos.boardIndex - 4);
          let rookEnd = this.convertToPosition(startPos.boardIndex - 1);
          let rook = this.getPieceAtBoardIndex(startPos.boardIndex - 4);
          this.castlingRights = this.castlingRights.replace("kq", "");
          if (rook.color != undefined) {
            rook.move(rookEnd);
          }
        }
        if (
          startPos.pos.x - endPos.pos.x === -2 &&
          this.castlingRights.includes("k")
        ) {
          let rookStart = this.convertToPosition(startPos.boardIndex + 3);
          let rookEnd = this.convertToPosition(startPos.boardIndex + 1);
          let rook = this.getPieceAtBoardIndex(startPos.boardIndex + 3);
          this.castlingRights = this.castlingRights.replace("kq", "");
          // console.log(rookEnd);
          // console.log("start pos", startPos);
          // console.log(rook.color);
          if (rook.color != undefined) {
            rook.move(rookEnd);
          }
        }
        this.castlingRights = this.castlingRights.replace("kq", "");
      }
      if (this.castlingRights === "") this.castlingRights = "-";
    }

    if (this.currentTurnColor === "black") {
      this.fullMoveNumber++;
    }

    if (piece.type === "r") {
      if (piece.color === "white") {
        if (piece.getIndex() === 0) {
          this.castlingRights = this.castlingRights.replace("Q", "");
        } else if (piece.getIndex() === 7) {
          this.castlingRights = this.castlingRights.replace("K", "");
        }
      } else {
        if (piece.getIndex() === 56) {
          this.castlingRights = this.castlingRights.replace("q", "");
        } else if (piece.getIndex() === 63) {
          this.castlingRights = this.castlingRights.replace("k", "");
        }
      }
    }

    //then it sets the piece's position to  end position
    //for some reason I am calling move piece, on dragStart
    if (this.getPieceIndex(end) !== -1) {
      //logs whenever piece capture is possible
      let capturedPieceIndex = this.getPieceIndex(end);
      let capturedPiece = this.Pieces[capturedPieceIndex];
      if (capturedPiece.type === "r") {
        if (capturedPiece.color === "white") {
          if (capturedPiece.getIndex() === 56) {
            this.castlingRights = this.castlingRights.replace("Q", "");
          } else if (capturedPiece.getIndex() === 63) {
            this.castlingRights = this.castlingRights.replace("K", "");
          }
        } else {
          if (capturedPiece.getIndex() === 0) {
            this.castlingRights = this.castlingRights.replace("q", "");
          } else if (capturedPiece.getIndex() === 7) {
            this.castlingRights = this.castlingRights.replace("k", "");
          }
        }
      }
      capturedPiece.appended = false;
      this.capturedPieces.push(capturedPiece);
      this.Pieces.splice(capturedPieceIndex, 1);
      this.halfMoveClock = 0;
    }
    piece.move(end);

    this.currentTurnColor =
      this.currentTurnColor === "white" ? "black" : "white";

    //then it sets the fen to the new fen
    //this is wrong, can't simply convert board to fen.
    this.fen = this.boardToFen();
    this.board = this.fenToBoard(this.fen);
    this.inCheck = this.isInCheck(this);
    // console.log("inside",this.isInCheck(this));
  }

  public async moveLegally(start: string, end: string, prompotion: string) {
    //first get list of current legal moves
    let legalMoves = this.findLegalMoves(this);
    let isMoveCastling = this.isMoveCastling(start, end);
    let isMoveEnPassant = this.isMoveEnPassant(start, end);
    let possibleEatenPiece = this.getPieceAtPosition(end);
    let targetPawn;
    let piece = this.getPieceAtPosition(start);
    await this.goForwardToLastMove(true);
    // console.log(isMoveEnPassant);
    // console.log(this.enPassantTargetSquare)

    if (this.enPassantTargetSquare != "-") {
      let enPassantPosition = new Position(this.enPassantTargetSquare);

      if (isMoveEnPassant) {
        if (this.currentTurnColor === "white") {
          targetPawn = this.getPieceAtPosition(
            this.convertToPosition(enPassantPosition.boardIndex + 8)
          );
        } else {
          targetPawn = this.getPieceAtPosition(
            this.convertToPosition(enPassantPosition.boardIndex - 8)
          );
        }
      } else {
        targetPawn = "";
      }
    }

    //then check if the move is in the list of legal moves
    let legal = false;
    for (let i = 0; i < legalMoves.length; i++) {
      if (legalMoves[i].start === start && legalMoves[i].end === end) {
        legal = true;
      }
    }
    if (!legal) {
      console.error("Illegal move");
      //if the piece moved is the current turn color we dont want to remove the premove indicator

      if (piece.color != this.currentTurnColor) {
        this.removePremoveIndicator();
        if (this.premove) {
          this.premove = null;
        }
        this.preMove(start, end, prompotion);
      }
      return;
    }
    //then check if I am promoting a pawn, if so. I must pass a promotion type
    if (
      this.getPieceAtPosition(start).type === "p" &&
      this.getPieceAtPosition(start).color === "white" &&
      end[1] === "8"
    ) {
      if (prompotion === undefined) {
        console.error("Illegal move");
        if (piece.color != this.currentTurnColor) {
          this.removePremoveIndicator();
          if (this.premove) {
            this.premove = null;
          }
          this.preMove(start, end, prompotion);
        }
        return;
      } else {
        let piece = this.getPieceAtPosition(start);
        piece.type = prompotion;
        piece.syncUIClass();

        this.movePiece(start, end);
        let newMove = new updateMove(start, end, this.fen);
        newMove.turnColor =
          this.currentTurnColor === "white" ? "black" : "white";
        newMove.crowning = true;
        newMove.crownedTo = prompotion;
        newMove.castle = isMoveCastling;
        if (possibleEatenPiece != "") {
          newMove.capturePiece = possibleEatenPiece.type;
          newMove.eating = true;
          this.capturedPieces.push(possibleEatenPiece);
          possibleEatenPiece.appended = false;
          possibleEatenPiece.removeUIComponent();
        }
        this.History.push(newMove);
        this.setLastMoveUIIndicator(newMove);
        this.moveIndex++;
        await moveSound.play();
        //create a move event
        const event = new CustomEvent("move", {
          detail: {
            start: start,
            end: end,
            promotion: prompotion,
          },
        });
        document.dispatchEvent(event);
        if (this.premove) {
          await this.moveLegally(
            this.premove.from,
            this.premove.to,
            this.premove.crownedTo
          );
          this.premove = null;
          this.removePremoveIndicator();
        }
        //check if in checkmate
        legalMoves = this.findLegalMoves(this);
        if (legalMoves.length === 0) {
          this.setCheckmate(true);
        }

        return;
      }
    } else if (
      this.getPieceAtPosition(start).type === "p" &&
      this.getPieceAtPosition(start).color === "black" &&
      end[1] === "1"
    ) {
      if (prompotion === undefined) {
        console.error(
          "need to pass promotion string when moving pawn to end of board"
        );
        return;
      } else {
        let piece = this.getPieceAtPosition(start);
        piece.type = prompotion;
        piece.syncUIClass();
        this.movePiece(start, end);
        let newMove = new updateMove(start, end, this.fen);
        newMove.turnColor =
          this.currentTurnColor === "white" ? "black" : "white";
        newMove.crowning = true;
        newMove.crownedTo = prompotion;
        newMove.castle = isMoveCastling;
        if (possibleEatenPiece != "") {
          newMove.capturePiece = possibleEatenPiece.type;
          newMove.eating = true;
          possibleEatenPiece.appended = false;
          this.capturedPieces.push(possibleEatenPiece);
          possibleEatenPiece.removeUIComponent();
        }
        this.History.push(newMove);
        this.setLastMoveUIIndicator(newMove);
        this.moveIndex++;
        await moveSound.play();
        //create a move event
        const event = new CustomEvent("move", {
          detail: {
            start: start,
            end: end,
            promotion: prompotion,
          },
        });
        document.dispatchEvent(event);
        if (this.premove) {
          await this.moveLegally(
            this.premove.from,
            this.premove.to,
            this.premove.crownedTo
          );
          this.premove = null;
          this.removePremoveIndicator();
        }
        legalMoves = this.findLegalMoves(this);
        if (legalMoves.length === 0) {
          this.setCheckmate(true);
        }

        return;
      }
    }
    this.movePiece(start, end);
    let newMove = new updateMove(start, end, this.fen);
    newMove.turnColor = this.currentTurnColor === "white" ? "black" : "white";
    newMove.castle = isMoveCastling;
    // console.log(possibleEatenPiece);
    if (possibleEatenPiece != "") {
      newMove.capturePiece = possibleEatenPiece.type;
      newMove.eating = true;
      possibleEatenPiece.removeUIComponent();
    }
    if (isMoveEnPassant) {
      newMove.enPassant = true;
      newMove.enPassantSquare = targetPawn.getPosition();
      targetPawn.removeUIComponent();
    }
    this.History.push(newMove);

    await delay(1);

    for (let i = 0; i < this.Pieces.length; i++) {
      this.Pieces[i].syncUIPosition();
    }
    this.setLastMoveUIIndicator(newMove);
    await moveSound.play();
    await moveSound.play();
    //create a move event
    const event = new CustomEvent("move", {
      detail: {
        start: start,
        end: end,
        promotion: prompotion,
      },
    });
    document.dispatchEvent(event);
    await delay(10);
    this.Pieces.forEach((e) => e.syncUIClass());
    this.Pieces.forEach((e) => e.syncUIPosition());

    this.moveIndex++;

    //if there is a premove, then we want to execute it
    if (this.premove) {
      await this.moveLegally(
        this.premove.from,
        this.premove.to,
        this.premove.crownedTo
      );
      this.premove = null;
      this.removePremoveIndicator();
    }
    legalMoves = this.findLegalMoves(this);
    if (legalMoves.length === 0) {
      this.setCheckmate(true);
    }
  }

  public async preMove(start: string, end: string, promotion: string) {
    //check if the piece is opposite color
    let piece = this.getPieceAtPosition(start);
    if (piece === "") {
      console.error("No piece at start position");
      return;
    }
    if (piece.color == this.currentTurnColor) {
      return;
    }
    //we simply check if the move is legal and then add it to the premove
    //next turn we will move the piece if it is legal with the moveLegally function
    let board = new Board(undefined, this.fen);
    board.currentTurnColor =
      board.currentTurnColor === "white" ? "black" : "white";
    console.log(board.currentTurnColor);
    let legalMoves = this.findPseudoLegalMoves(board);
    console.log(board);
    console.log(legalMoves);
    let legal = false;
    for (let i = 0; i < legalMoves.length; i++) {
      if (legalMoves[i].start === start && legalMoves[i].end === end) {
        legal = true;
      }
    }
    if (!legal) {
      console.error("Illegal move");
      return;
    }
    start = start;
    this.premove = new updateMove(start, end, this.fen);
    this.premove.crownedTo = promotion;
    //we also want to set the premove indicator on the UI
    this.setPremoveIndicator(start, end);
  }

  public async setPremoveIndicator(start: string, end: string) {
    let startUI = document.getElementById(start);
    let endUI = document.getElementById(end);
    startUI.classList.add("premove");
    endUI.classList.add("premove");
  }

  public async removePremoveIndicator() {
    let allSquare = document.querySelectorAll(".chessSquare");
    for (let i = 0; i < allSquare.length; i++) {
      allSquare[i].classList.remove("premove");
    }
  }

  public setLastMoveUIIndicator(move: updateMove) {
    let allSquare = document.querySelectorAll(".chessSquare");
    for (let i = 0; i < allSquare.length; i++) {
      allSquare[i].classList.remove("lastMove");
    }
    if (move === undefined) return;
    let lastMove = move;
    let start = lastMove.from;
    let end = lastMove.to;
    let startUI = document.getElementById(start);
    let endUI = document.getElementById(end);
    startUI.classList.add("lastMove");
    endUI.classList.add("lastMove");
  }

  public async getCapturedPieceFromElement(UIPiece: Element) {
    for (let i = 0; i < this.capturedPieces.length; i++) {
      if (this.capturedPieces[i].UIComponent.id === UIPiece.id) {
        console.log(this.capturedPieces[i].UIComponent.id, UIPiece.id);
        return this.capturedPieces[i];
      }
    }
  }

  private async goForwardOneMove(instant: boolean = false) {
    console.log(this.History[this.moveIndex + 1]);
    if (this.History.length === 0) {
      return;
    }
    if (this.moveIndex === this.History.length - 1) {
      return;
    }
    await this.executeUIMove(this.History[this.moveIndex + 1], instant);
    this.moveIndex++;
    this.setLastMoveUIIndicator(this.History[this.moveIndex]);
  }

  private async goForwardToLastMove(instant: boolean = true) {
    for (let i = this.moveIndex; i < this.History.length - 1; i++) {
      await this.goForwardOneMove(instant);
    }
  }

  public async executeUIMove(move: updateMove, instant: boolean = false) {
    if (move === undefined) return;
    let piece = this.getUIPieceByPosition(move.from);
    let possibleCapturedPiece = this.getUIPieceByPosition(move.to);
    let normalized = await this.getNormalizedVectorFromMove(move.from, move.to);
    let toSquare = document.getElementById(move.to);
    //no do the move, making sure to do the hardest things first
    if (move.castle) {
      //first move kings the rook
      switch (move.to) {
        case "g1":
          let rookNormalized = await this.getNormalizedVectorFromMove(
            "h1",
            "f1"
          );
          let rook = this.getUIPieceByPosition("h1");
          await this.moveUIPiece(rookNormalized, rook, instant);
          let rookTo = document.getElementById("f1");
          rookTo.appendChild(rook);
          await this.setUIPositionToZero(rook);

          break;
        case "c1":
          let rookNormalized2 = await this.getNormalizedVectorFromMove(
            "a1",
            "d1"
          );
          let rook2 = this.getUIPieceByPosition("a1");
          await this.moveUIPiece(rookNormalized2, rook2, instant);
          let rookTo2 = document.getElementById("d1");
          rookTo2.appendChild(rook2);
          await this.setUIPositionToZero(rook2);
          break;
        case "g8":
          let rookNormalized3 = await this.getNormalizedVectorFromMove(
            "h8",
            "f8"
          );
          let rook3 = this.getUIPieceByPosition("h8");
          await this.moveUIPiece(rookNormalized3, rook3, instant);
          let rookTo3 = document.getElementById("f8");
          rookTo3.appendChild(rook3);
          await this.setUIPositionToZero(rook3);
          break;
        case "c8":
          let rookNormalized4 = await this.getNormalizedVectorFromMove(
            "a8",
            "d8"
          );
          let rook4 = this.getUIPieceByPosition("a8");
          await this.moveUIPiece(rookNormalized4, rook4, instant);
          let rookTo4 = document.getElementById("d8");
          rookTo4.appendChild(rook4);
          await this.setUIPositionToZero(rook4);
          break;
      }
    }
    if (move.capturePiece) {
      //then remove the piece
      let captured = await this.getCapturedPieceFromElement(
        possibleCapturedPiece
      );
      captured?.removeUIComponent();
    }
    if (move.crowning) {
      //we take the UI piece and change it's class
      if (move.turnColor === "white") {
        piece?.classList.remove("P");
        piece?.classList.add(move.crownedTo.toUpperCase());
      } else {
        piece?.classList.remove("p");
        piece?.classList.add(move.crownedTo.toLowerCase());
      }
    }

    await this.moveUIPiece(normalized, piece, instant);
    toSquare?.appendChild(piece);
    await this.setUIPositionToZero(piece);
    !instant ? await moveSound.play() : null;
  }

  public async executeUIMoveReverse(
    move: updateMove,
    instant: boolean = false
  ) {
    let piece = this.getUIPieceByPosition(move.to);
    let normalized = await this.getNormalizedVectorFromMove(move.to, move.from);
    let fromSquare = document.getElementById(move.from);
    let toSquare = document.getElementById(move.to);
    //no do the move, making sure to do the hardest things first
    if (move.castle) {
      //first move kings the rook
      switch (move.to) {
        case "g1":
          let rookNormalized = await this.getNormalizedVectorFromMove(
            "f1",
            "h1"
          );
          let rook = this.getUIPieceByPosition("f1");
          await this.moveUIPiece(rookNormalized, rook, instant);
          let rookTo = document.getElementById("h1");
          rookTo.appendChild(rook);
          await this.setUIPositionToZero(rook);
          break;
        case "c1":
          let rookNormalized2 = await this.getNormalizedVectorFromMove(
            "d1",
            "a1"
          );
          let rook2 = this.getUIPieceByPosition("d1");
          await this.moveUIPiece(rookNormalized2, rook2, instant);
          let rookTo2 = document.getElementById("a1");
          rookTo2.appendChild(rook2);
          await this.setUIPositionToZero(rook2);
          break;
        case "g8":
          let rookNormalized3 = await this.getNormalizedVectorFromMove(
            "f8",
            "h8"
          );
          let rook3 = this.getUIPieceByPosition("f8");
          await this.moveUIPiece(rookNormalized3, rook3, instant);
          let rookTo3 = document.getElementById("h8");
          rookTo3.appendChild(rook3);
          await this.setUIPositionToZero(rook3);
          break;
        case "c8":
          let rookNormalized4 = await this.getNormalizedVectorFromMove(
            "d8",
            "a8"
          );
          let rook4 = this.getUIPieceByPosition("d8");
          await this.moveUIPiece(rookNormalized4, rook4, instant);
          let rookTo4 = document.getElementById("a8");
          rookTo4.appendChild(rook4);
          await this.setUIPositionToZero(rook4);
          break;
      }
    }
    if (move.capturePiece) {
      //then remove the piece
      console.log("need to add piece back");
      for (let i = 0; i < this.capturedPieces.length; i++) {
        if (
          this.capturedPieces[i].type === move.capturePiece &&
          this.capturedPieces[i].color != move.turnColor &&
          this.capturedPieces[i].appended === false
        ) {
          let captured = this.capturedPieces[i];
          toSquare?.appendChild(captured.UIComponent);
          captured.appended = true;
          break;
        }
      }
    }
    if (move.crowning) {
      //we take the UI piece and change it's class
      if (move.turnColor === "white") {
        piece?.classList.remove(move.crownedTo.toUpperCase());
        piece?.classList.add("P");
      } else {
        piece?.classList.remove(move.crownedTo.toLowerCase());
        piece?.classList.add("p");
      }
    }
    await this.moveUIPiece(normalized, piece, instant);
    fromSquare?.appendChild(piece);
    await this.setUIPositionToZero(piece);
    !instant ? await moveSound.play() : null;
  }

  public async setUIPositionToZero(piece: HTMLElement) {
    piece.style.transform = `translate(0.1px, 0.1px)`;
  }

  public async moveUIPiece(
    normalizedVector: V2D,
    UIPiece: HTMLElement,
    instant: boolean = false
  ) {
    for (let i = 0; i < normalizedVector.magnitude; i++) {
      UIPiece.style.transform = `translate(${normalizedVector.x * i}px, ${
        normalizedVector.y * i
      }px)`;
      if (i % 15 === 0 && !instant) {
        await this.sleep(1);
      }
    }
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async getNormalizedVectorFromMove(
    from: string,
    to: string
  ): Promise<V2D> {
    let currentSquare = document.getElementById(from);
    let targetSquare = document.getElementById(to);
    let currentSquareRect = currentSquare.getBoundingClientRect();
    let currentCords = {
      x: currentSquareRect?.x + currentSquareRect?.width / 2,
      y: currentSquareRect?.y + currentSquareRect?.height / 2,
    };
    let targetSquareRect = targetSquare?.getBoundingClientRect();
    let prevCords = {
      x: targetSquareRect?.x + targetSquareRect?.width / 2,
      y: targetSquareRect?.y + targetSquareRect?.height / 2,
    };
    let vector = {
      x: prevCords.x - currentCords.x,
      y: prevCords.y - currentCords.y,
    };
    let magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
    let normalized = { x: vector.x / magnitude, y: vector.y / magnitude };
    let normalizedVector = new V2D(normalized.x, normalized.y);
    normalizedVector.magnitude = magnitude;

    return normalizedVector;
  }

  private isMoveCastling(from: string, to: string): boolean {
    let fromPos = new Position(from);
    let toPos = new Position(to);
    let piece = this.getPieceAtPosition(from);
    if (piece.type === "k" && Math.abs(fromPos.pos.x - toPos.pos.x) === 2) {
      return true;
    }
    return false;
  }

  private isMoveEnPassant(from: string, to: string): boolean {
    let fromPos = new Position(from);
    let toPos = new Position(to);
    let piece = this.getPieceAtPosition(from);
    if (
      piece.type === "p" &&
      Math.abs(fromPos.pos.x - toPos.pos.x) === 1 &&
      this.getPieceAtPosition(to) === ""
    ) {
      return true;
    }
    return false;
  }

  private getPieceIndex(position: string): number {
    let index = -1;
    for (let i = 0; i < this.Pieces.length; i++) {
      let piece = this.Pieces[i];
      if (piece.getPosition() == position) {
        index = i;
        break;
      }
    }
    return index;
  }

  public getPieceAtPosition(position: string): any {
    let piece = "";
    for (let i = 0; i < this.Pieces.length; i++) {
      let piece = this.Pieces[i];
      if (piece.getPosition() == position) {
        return piece;
      }
    }
    return piece;
  }

  private testConvertToPosition() {
    let tests = [];
    tests.push(this.convertToPosition(0) == "a8");
    tests.push(this.convertToPosition(1) == "b8");
    tests.push(this.convertToPosition(2) == "c8");
    tests.push(this.convertToPosition(3) == "d8");
    tests.push(this.convertToPosition(4) == "e8");
    tests.push(this.convertToPosition(5) == "f8");
    tests.push(this.convertToPosition(6) == "g8");
    tests.push(this.convertToPosition(7) == "h8");
    tests.push(this.convertToPosition(8) == "a7");
    tests.push(this.convertToPosition(9) == "b7");
    tests.push(this.convertToPosition(10) == "c7");
    tests.push(this.convertToPosition(11) == "d7");
    tests.push(this.convertToPosition(12) == "e7");
    tests.push(this.convertToPosition(13) == "f7");
    tests.push(this.convertToPosition(14) == "g7");
    tests.push(this.convertToPosition(15) == "h7");
    tests.push(this.convertToPosition(16) == "a6");
    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Convert to position failed");
      }
    }
  }

  private testFenToBoard() {
    let tests = [];
    tests.push(
      this.fenToBoard(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      )
    );
    tests.push(
      this.fenToBoard(
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
      )
    );

    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Fen to board failed");
      }
    }
    ASSERT(tests[0], [
      "r",
      "n",
      "b",
      "q",
      "k",
      "b",
      "n",
      "r",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "P",
      "P",
      "P",
      "P",
      "P",
      "P",
      "P",
      "P",
      "R",
      "N",
      "B",
      "Q",
      "K",
      "B",
      "N",
      "R",
    ]);
    ASSERT(tests[1], [
      "r",
      "n",
      "b",
      "q",
      "k",
      "b",
      "n",
      "r",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      "p",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "P",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      " ",
      "P",
      "P",
      "P",
      "P",
      " ",
      "P",
      "P",
      "P",
      "R",
      "N",
      "B",
      "Q",
      "K",
      "B",
      "N",
      "R",
    ]);

    function ASSERT(test: any, expected: any) {
      if (test === expected) return true;
      if (test == null || expected == null) {
        console.log(test, expected);
        throw new Error("Fen to board failed");
      }
      if (test.length !== expected.length) {
        console.log(test, expected);
        throw new Error("Fen to board failed");
      }

      for (var i = 0; i < test.length; ++i) {
        if (test[i] !== expected[i]) {
          console.log(test, expected);
          throw new Error("Fen to board failed");
        }
      }
      return true;
    }

    // console.log("Fen to board passed");
  }

  private generateRandomId(length: number): string {
    let id = "";
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
      id += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return id;
  }

  private testBoardToFen() {
    let tests = [];
    let board = new Board();
    // console.log("Pieces",this.Pieces);
    tests.push(
      board.boardToFen() ==
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    //move piece must change turn, and also I must track the square
    //if a pawn moves two squares, then I must track the square
    board.movePiece("e2", "e4");
    tests.push(
      board.boardToFen() ==
        "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
    );

    // console.log(board.boardToFen());
    // console.log("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1")
    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error(
          "Board to fen failed, test " +
            (i + 1) +
            " failed" +
            board.boardToFen()
        );
      }
    }
    // console.log("Board to fen passed");
  }

  private testConstructors() {
    let board: Board = new Board();
    let tests = [];
    tests.push(board.Pieces[0]?.getPosition() == "a8");
    tests.push(board.Pieces[0].color == "black");
    tests.push(board.Pieces[0].type == "r");
    tests.push(board.Pieces[1]?.getPosition() == "b8");
    tests.push(board.Pieces[1].color == "black");
    tests.push(board.Pieces[1].type == "n");
    tests.push(board.Pieces[2]?.getPosition() == "c8");
    tests.push(board.Pieces[2].color == "black");
    tests.push(board.Pieces[2].type == "b");
    tests.push(board.Pieces[3]?.getPosition() == "d8");

    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Board constructor 1 failed " + i);
      }
    }

    let newBoard = new Board(
      [],
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    tests = [];
    tests.push(newBoard.Pieces[0]?.getPosition() == "a8");
    tests.push(newBoard.Pieces[0].color == "black");
    tests.push(newBoard.Pieces[0].type == "r");
    tests.push(newBoard.Pieces[1]?.getPosition() == "b8");
    tests.push(newBoard.Pieces[1].color == "black");
    tests.push(newBoard.Pieces[1].type == "n");
    tests.push(newBoard.Pieces[2]?.getPosition() == "c8");
    tests.push(newBoard.Pieces[2].color == "black");
    tests.push(newBoard.Pieces[2].type == "b");
    tests.push(newBoard.Pieces[3]?.getPosition() == "d8");

    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Board constructor 2 failed" + i);
      }
    }

    let newBoard2 = new Board(
      [],
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
    );

    tests = [];
    tests.push(newBoard2.Pieces[0]?.getPosition() == "a8");
    tests.push(newBoard2.Pieces[0].color == "black");
    tests.push(newBoard2.Pieces[0].type == "r");
    tests.push(newBoard2.currentTurnColor == "black");

    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Board constructor 3 failed" + i);
      }
    }

    // let boards = [];
    // for(let i = 0; i < 100; i++) {
    //   boards.push(new Board());
    // }

    // for(let i = 0; i < boards.length; i++) {
    //   for(let j = 0; j < 100; j++) {
    //     boards[i].move(this.generateRandomMoves(boards[i]));
    //   }
    // }
  }

  private findPseudoLegalMoves(board: Board): any[] {
    let moves = [];
    //right now I am finding moves that are pseudolegal based on turns
    //I need to add en passant, castling, and promotion
    //also need to add checks and checkmates
    for (let i = 0; i < board.Pieces.length; i++) {
      let currentPiece = board.Pieces[i];
      if (board.currentTurnColor === currentPiece.color) {
        switch (currentPiece.type) {
          case "p":
            moves.push(...this.findPawnMoves(currentPiece, board));
            break;
          case "r":
            moves.push(...this.findRookMoves(currentPiece, board));
            break;
          case "n":
            moves.push(...this.findKnightMoves(currentPiece, board));
            break;
          case "b":
            moves.push(...this.findBishopMoves(currentPiece, board));
            break;
          case "q":
            moves.push(...this.findQueenMoves(currentPiece, board));
            break;
          case "k":
            moves.push(...this.findKingMoves(currentPiece, board));
            break;
        }
      }
      //for each move I must check first if I am in check from board.
      // I can keep track of this since I start out of check
      //then whenever I move I check if I am putting my opponent in check.
      // I am then I set the board to in check.
      //also if I input a fen string or board state from the board, I need to check if I am in check.
    }

    //here I must check if I am in check and if I am I only return moves that get me out of check
    // let amIInCheck = this.isInCheck(board);
    return moves;
  }

  private testFindPseudoLegalMoves() {
    let board = new Board();
    let moves = this.findPseudoLegalMoves(board);
    let tests = [];
    tests.push(moves.length == 20);
    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Find legal moves failed, test " + (i + 1) + " failed");
      }
    }

    //check en-passant
    board = new Board(
      [], //pieces
      "rnbqkbnr/1ppp1ppp/8/p3pP2/4P3/8/PPPP2PP/RNBQKBNR w KQkq e6 0 4"
    );
    moves = this.findPseudoLegalMoves(board);
    tests = [];
    tests.push(moves.length == 30);
    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Find legal moves failed, test " + (i + 1) + " failed");
      }
    }
  }

  public findLegalMoves(board: Board): any[] {
    let moves = board.findPseudoLegalMoves(board);
    // board.displayBoard();
    // console.log(board.fen);
    // for(let i = 0; i < moves.length; i++) {
    //   let piece = this.getPieceAtPosition(moves[i].start);
    //   console.log("piece at index", i ,"is", piece)
    // }
    // console.log(board.Pieces)
    let legalMoves = [];
    for (let i = 0; i < moves.length; i++) {
      //I create an identical board
      let newBoard = new Board([], board.boardToFen());

      //I perform one of the pseudomoves in the clone board
      newBoard.movePiece(moves[i].start, moves[i].end);

      //board is in white's turn, when I clone the board, and perform move that is already blacks turn
      //if black can do anything to eat my king it is not allowed
      //but for some reason I swithc the turn back to white, to check if white is in check.
      newBoard.currentTurnColor =
        newBoard.currentTurnColor === "white" ? "black" : "white";
      if (!this.isInCheck(newBoard)) {
        // newBoard.displayBoard()
        // console.log(newBoard.fen)
        legalMoves.push(moves[i]);
      }
    }
    // console.log(legalMoves)
    board.legalMoves = legalMoves;
    return legalMoves;
  }

  private testFindLegalMoves() {
    let board = new Board();
    let moves = this.findLegalMoves(board);
    let tests = [];
    tests.push(moves.length == 20);

    board = new Board(
      [],
      "rnb1k1nr/pppp1ppp/8/2b1p3/P3q3/8/1PPP1PPP/RNBQKB1R w KQkq - 0 6"
    );
    moves = this.findLegalMoves(board);
    tests.push(moves.length == 2);

    board = new Board(
      [],
      "rnbqkbnr/1ppp1ppp/8/p3Q3/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 0 3"
    );
    moves = this.findLegalMoves(board);
    tests.push(moves.length == 3);

    board = new Board(
      [],
      "rnbqkbnr/p1p1pppp/1p6/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3"
    );
    moves = this.findLegalMoves(board);
    tests.push(moves.length == 31);

    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Find legal moves failed, test " + (i + 1) + " failed");
      }
    }
  }

  public isInCheck(board: Board): boolean {
    //we first copy the board, and change the turn to the opposite color
    // console.log(board);

    //I clone the board yet again, this time as white's turn after having already made a move
    let boardToSeeIfInCheck = new Board([], board.boardToFen());

    //I create a new identical board
    let empty = true;
    for (let i = 0; i < boardToSeeIfInCheck.board.length; i++) {
      if (boardToSeeIfInCheck.board[i] != "-") {
        empty = false;
      }
    }
    if (empty) {
      console.log("empty board");
      console.log(board.boardToFen());
    }

    //I change the turn back to black even though I did not move, so I went back and forth
    boardToSeeIfInCheck.currentTurnColor =
      boardToSeeIfInCheck.currentTurnColor == "white" ? "black" : "white";

    //I think find the oppoinsing moves for black
    let opponentMoves =
      boardToSeeIfInCheck.findPseudoLegalMoves(boardToSeeIfInCheck);
    let currentKingIndex;
    for (let i = 0; i < board.Pieces.length; i++) {
      if (
        board.Pieces[i].type == "k" &&
        board.Pieces[i].color == board.currentTurnColor
      ) {
        currentKingIndex = board.Pieces[i].getIndex();
      }
    }

    if (opponentMoves.length == 0) {
      Error("No opponent moves found, this should not happen");
      console.log("main board");
      board.displayBoard();
      console.log(board.fen);
      console.log("thingy");
      boardToSeeIfInCheck.displayBoard();
      console.log(boardToSeeIfInCheck.fen);
    }

    //now we check if any of the opponent moves can eat the king
    //then we run all of the opponent moves, and if the moves eat the king then we don't return true.
    //this is odd, becasue basically, we look at the move towards pawn, we do it in clone board, we switch turn back and forth
    //so it is back to the opposite color
    //then we check if any of it's pseudomoves eat the king.
    for (let i = 0; i < opponentMoves.length; i++) {
      if (opponentMoves[i].boardEndIndex == currentKingIndex) {
        return true;
      }
    }

    return false;
  }

  private testIsInCheck() {
    let board = new Board();
    let tests = [];
    tests.push(!this.isInCheck(board));
    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        throw new Error("Is in check failed, test " + (i + 1) + " failed");
      }
    }
  }

  private Piece(vector: V2D): any {
    let index = vector.x + vector.y * 8;
    for (let i = 0; i < this.Pieces.length; i++) {
      if (this.Pieces[i].getIndex() == index) {
        return this.Pieces[i];
      }
    }
    return " ";
  }

  private addPiece(piece: Piece) {
    this.Pieces.push(piece);
    // console.log(this.board[piece.getIndex()])
    if (
      this.board[piece.getIndex()] != undefined &&
      this.board[piece.getIndex()] != " "
    )
      console.log("ERROR: PIECE ALREADY EXISTS AT THIS LOCATION", piece);

    this.board[piece.getIndex()] = piece.type;
  }

  private findPawnMoves(piece: Piece, board: Board): Move[] {
    let moves: Move[] = [];
    let index = piece.getIndex();
    let pos = new V2D(index % 8, Math.floor(index / 8));
    let color = piece.color;

    if (color != board.currentTurnColor) return moves;

    if (color == "white") {
      //check if there is a piece in front remember white is on the bottom.\\
      let moveForward = new V2D(pos.x, pos.y - 1);

      if (board.Piece(moveForward) == " " && pos.y != 0) {
        moves.push(new Move(pos, moveForward));
      }
      //check if I can move two spaces forward
      let moveForward2 = new V2D(pos.x, pos.y - 2);
      if (
        board.Piece(moveForward2) == " " &&
        board.Piece(moveForward) == " " &&
        pos.y == 6
      ) {
        moves.push(new Move(pos, moveForward2));
      }

      //check if there is a piece to the left
      let moveLeft = new V2D(pos.x - 1, pos.y - 1);
      if (
        board.Piece(moveLeft) != " " &&
        board.Piece(moveLeft)?.color == "black" &&
        pos.x - 1 >= 0 &&
        pos.y - 1 >= 0
      ) {
        moves.push(new Move(pos, moveLeft));
      }
      //check if there is a piece to the right
      let moveRight = new V2D(pos.x + 1, pos.y - 1);
      if (
        board.Piece(moveRight) != " " &&
        board.Piece(moveRight)?.color == "black" &&
        pos.x + 1 <= 7 &&
        pos.y - 1 >= 0
      ) {
        moves.push(new Move(pos, moveRight));
      }
      //check for en passant
      if (board.enPassantTargetSquare != "-" && pos.y == 3) {
        let enPassantTarget = new V2D(
          board.enPassantTargetSquare.charCodeAt(0) - 97,
          8 - parseInt(board.enPassantTargetSquare[1])
        );
        if (deepEqual(enPassantTarget, moveRight) === true) {
          moves.push(new Move(pos, moveRight));
        }
        if (deepEqual(enPassantTarget, moveLeft) === true) {
          moves.push(new Move(pos, moveLeft));
        }
      }
    } else {
      //check if there is a piece in front remember white is on the bottom.\\
      let moveForward = new V2D(pos.x, pos.y + 1);
      if (board.Piece(moveForward) == " " && pos.y != 7) {
        moves.push(new Move(pos, moveForward));
      }
      //check if I can move two spaces forward
      let moveForward2 = new V2D(pos.x, pos.y + 2);
      if (
        board.Piece(moveForward2) == " " &&
        board.Piece(moveForward) == " " &&
        pos.y == 1
      ) {
        moves.push(new Move(pos, moveForward2));
      }

      //check if there is a piece to the left
      let moveLeft = new V2D(pos.x - 1, pos.y + 1);
      if (
        board.Piece(moveLeft) != " " &&
        board.Piece(moveLeft)?.color == "white" &&
        pos.x - 1 >= 0 &&
        pos.y + 1 <= 7
      ) {
        moves.push(new Move(pos, moveLeft));
      }
      //check if there is a piece to the right
      let moveRight = new V2D(pos.x + 1, pos.y + 1);
      if (
        board.Piece(moveRight) != " " &&
        board.Piece(moveRight)?.color == "white" &&
        pos.x + 1 <= 7 &&
        pos.y + 1 <= 7
      ) {
        moves.push(new Move(pos, moveRight));
      }

      if (board.enPassantTargetSquare != "-" && pos.y === 4) {
        let enPassantTarget = new V2D(
          board.enPassantTargetSquare.charCodeAt(0) - 97,
          8 - parseInt(board.enPassantTargetSquare[1])
        );
        // console.log(enPassantTarget)
        if (deepEqual(enPassantTarget, moveRight) === true) {
          moves.push(new Move(pos, moveRight));
        }
        if (deepEqual(enPassantTarget, moveLeft) === true) {
          moves.push(new Move(pos, moveLeft));
        }
      }
    }

    return moves;
  }

  private testFindPawnMoves() {
    let board = new Board();
    let moves = this.findPawnMoves(board.Piece(new V2D(0, 6)), board);
    let tests = [];
    tests.push(moves.length == 2);
    // console.log(moves[0].toString());
    // console.log(moves[1].toString())
    tests.push(moves[0].toString() == "a2-a3");
    tests.push(moves[1].toString() == "a2-a4");
    for (let i = 0; i < tests.length; i++) {
      if (tests[i] == false) {
        console.log("testFindPawnMoves failed");
        return;
      }
    }

    tests = [];
    moves = this.findPawnMoves(board.Pieces[16], board);
    // console.log(moves[0].toString());
    // console.log(moves[1].toString())
    tests.push(moves.length == 2);
    tests.push(moves[0].toString() == "a2-a3");
    tests.push(moves[1].toString() == "a2-a4");
    for (let i = 0; i < tests.length; i++) {
      if (tests[i] == false) {
        console.log("testFindPawnMoves failed");
        return;
      }
    }

    board = new Board([]);

    let piece = new Piece("a5", "black", pawn);
    board.addPiece(piece);
    piece = new Piece("a4", "white", pawn);
    board.addPiece(piece);
    moves = this.findPawnMoves(piece, board);
    tests = [];
    tests.push(moves.length == 0);
    for (let i = 0; i < tests.length; i++) {
      if (tests[i] == false) {
        console.error("testFindPawnMoves failed");
        return;
      }
    }
  }

  private findRookMoves(piece: Piece, board: Board): Move[] {
    let moves: Move[] = [];
    let index = piece.getIndex();
    let pos = new V2D(index % 8, Math.floor(index / 8));
    let color = piece.color;
    // this.displayBoard();
    if (color != board.currentTurnColor) return moves;

    //move forward as long as there is not pieces on the way, or I don't eat.
    if (color === "white") {
      for (let i = pos.y - 1; i >= 0; i--) {
        let move = new V2D(pos.x, i);
        // console.log("this",this.Piece(move));
        // console.log(this.Piece(move) === " ")
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move backward as long as there is not pieces on the way, or I don't eat.
      for (let i = pos.y + 1; i <= 7; i++) {
        let move = new V2D(pos.x, i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move left as long as there is not pieces on the way, or I don't eat.
      for (let i = pos.x - 1; i >= 0; i--) {
        let move = new V2D(i, pos.y);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move right as long as there is not pieces on the way, or I don't eat.
      for (let i = pos.x + 1; i <= 7; i++) {
        let move = new V2D(i, pos.y);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
    } else {
      for (let i = pos.y - 1; i >= 0; i--) {
        let move = new V2D(pos.x, i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move backward as long as there is not pieces on the way, or I don't eat.
      for (let i = pos.y + 1; i <= 7; i++) {
        let move = new V2D(pos.x, i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move left as long as there is not pieces on the way, or I don't eat.
      for (let i = pos.x - 1; i >= 0; i--) {
        let move = new V2D(i, pos.y);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move right as long as there is not pieces on the way, or I don't eat.
      for (let i = pos.x + 1; i <= 7; i++) {
        let move = new V2D(i, pos.y);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
    }
    return moves;
  }

  private testFindRookMoves() {
    let board = new Board(
      [],
      "rnbqkbnr/1ppppppp/8/p7/P7/8/1PPPPPPP/RNBQKBNR w KQkq a6 0 2"
    );
    let moves = board.findRookMoves(board.Piece(new V2D(0, 7)), board);
    // console.log(board.Piece(new V2D(0,7)));
    let tests = [];

    tests.push(moves.length === 2);
    // console.log(moves);

    for (let i = 0; i < tests.length; i++) {
      if (tests[i] == false) {
        console.log("testFindRookMoves failed");
        return;
      }
    }
  }

  private findKnightMoves(piece: Piece, board: Board): Move[] {
    let moves: Move[] = [];
    let index = piece.getIndex();
    let pos = new V2D(index % 8, Math.floor(index / 8));
    let color = piece.color;
    if (color != board.currentTurnColor) return moves;

    if (color === "white") {
      //move L shape up left
      if (pos.x - 2 >= 0 && pos.y - 1 >= 0) {
        let move = new V2D(pos.x - 2, pos.y - 1);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape up right
      if (pos.x + 2 <= 7 && pos.y - 1 >= 0) {
        let move = new V2D(pos.x + 2, pos.y - 1);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape down left
      if (pos.x - 2 >= 0 && pos.y + 1 <= 7) {
        let move = new V2D(pos.x - 2, pos.y + 1);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape down right
      if (pos.x + 2 <= 7 && pos.y + 1 <= 7) {
        let move = new V2D(pos.x + 2, pos.y + 1);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape left up
      if (pos.x - 1 >= 0 && pos.y - 2 >= 0) {
        let move = new V2D(pos.x - 1, pos.y - 2);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape left down
      if (pos.x - 1 >= 0 && pos.y + 2 <= 7) {
        let move = new V2D(pos.x - 1, pos.y + 2);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape right up
      if (pos.x + 1 <= 7 && pos.y - 2 >= 0) {
        let move = new V2D(pos.x + 1, pos.y - 2);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape right down
      if (pos.x + 1 <= 7 && pos.y + 2 <= 7) {
        let move = new V2D(pos.x + 1, pos.y + 2);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
        }
      }
    } else {
      //move L shape up left
      if (pos.x - 2 >= 0 && pos.y - 1 >= 0) {
        let move = new V2D(pos.x - 2, pos.y - 1);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape up right
      if (pos.x + 2 <= 7 && pos.y - 1 >= 0) {
        let move = new V2D(pos.x + 2, pos.y - 1);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape down left
      if (pos.x - 2 >= 0 && pos.y + 1 <= 7) {
        let move = new V2D(pos.x - 2, pos.y + 1);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape down right
      if (pos.x + 2 <= 7 && pos.y + 1 <= 7) {
        let move = new V2D(pos.x + 2, pos.y + 1);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape left up
      if (pos.x - 1 >= 0 && pos.y - 2 >= 0) {
        let move = new V2D(pos.x - 1, pos.y - 2);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape left down
      if (pos.x - 1 >= 0 && pos.y + 2 <= 7) {
        let move = new V2D(pos.x - 1, pos.y + 2);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape right up
      if (pos.x + 1 <= 7 && pos.y - 2 >= 0) {
        let move = new V2D(pos.x + 1, pos.y - 2);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
        }
      }
      //move L shape right down
      if (pos.x + 1 <= 7 && pos.y + 2 <= 7) {
        let move = new V2D(pos.x + 1, pos.y + 2);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
        }
      }
    }
    return moves;
  }

  private testFindKnightMoves() {
    let board = new Board([]);
    let tests = [];
    board.currentTurnColor = "white";

    let piece = new Piece("c3", "white", knight);
    board.addPiece(piece);
    let moves = board.findKnightMoves(piece, board);
    tests.push(moves.length === 8);

    board = new Board([]);
    piece = new Piece("c3", "black", knight);
    board.addPiece(piece);
    board.currentTurnColor = "black";
    moves = board.findKnightMoves(piece, board);
    tests.push(moves.length === 8);

    board = new Board([]);
    piece = new Piece("a1", "white", knight);
    board.addPiece(piece);
    moves = board.findKnightMoves(piece, board);
    tests.push(moves.length === 2);

    for (let i = 0; i < tests.length; i++) {
      if (!tests[i]) {
        console.log("testFindKnightMoves failed at test " + i);
        return;
      }
    }
  }

  private findBishopMoves(piece: Piece, board: Board): Move[] {
    let moves: Move[] = [];
    let index = piece.getIndex();
    let pos = new V2D(index % 8, Math.floor(index / 8));
    let color = piece.color;
    if (color != board.currentTurnColor) return moves;

    if (color === "white") {
      //move forward left as long as there is not pieces on the way, or I don't eat.
      for (let i = 1; i <= 7; i++) {
        if (pos.x - i < 0 || pos.y - i < 0) break;
        let move = new V2D(pos.x - i, pos.y - i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move forward right as long as there is not pieces on the way, or I don't eat.
      for (let i = 1; i <= 7; i++) {
        if (pos.x + i > 7 || pos.y - i < 0) break;
        let move = new V2D(pos.x + i, pos.y - i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move backward left as long as there is not pieces on the way, or I don't eat.
      for (let i = 1; i <= 7; i++) {
        if (pos.x - i < 0 || pos.y + i > 7) break;
        let move = new V2D(pos.x - i, pos.y + i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move backward right as long as there is not pieces on the way, or I don't eat.
      for (let i = 1; i <= 7; i++) {
        if (pos.x + i > 7 || pos.y + i > 7) break;
        let move = new V2D(pos.x + i, pos.y + i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "black") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
    } else {
      //move down left as long as there is not pieces on the way, or I don't eat.
      for (let i = 1; i <= 7; i++) {
        if (pos.x - i < 0 || pos.y + i > 7) break;
        let move = new V2D(pos.x - i, pos.y + i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move down right as long as there is not pieces on the way, or I don't eat.
      for (let i = 1; i <= 7; i++) {
        if (pos.x + i > 7 || pos.y + i > 7) break;
        let move = new V2D(pos.x + i, pos.y + i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move up left as long as there is not pieces on the way, or I don't eat.
      for (let i = 1; i <= 7; i++) {
        if (pos.x - i < 0 || pos.y - i < 0) break;
        let move = new V2D(pos.x - i, pos.y - i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
      //move up right as long as there is not pieces on the way, or I don't eat.
      for (let i = 1; i <= 7; i++) {
        if (pos.x + i > 7 || pos.y - i < 0) break;
        let move = new V2D(pos.x + i, pos.y - i);
        if (board.Piece(move) === " ") {
          moves.push(new Move(pos, move));
        } else if (board.Piece(move)?.color === "white") {
          moves.push(new Move(pos, move));
          break;
        } else {
          break;
        }
      }
    }
    return moves;
  }

  private testFindBishopMoves() {
    let board = new Board([]);
    let piece = new Piece("a2", "white", bishop);
    board.addPiece(piece);
    let moves = board.findBishopMoves(piece, board);
    if (moves.length !== 7) {
      console.log("testFindBishopMoves failed 0");
      return;
    }
    board = new Board([]);
    piece = new Piece("a2", "black", bishop);
    board.addPiece(piece);
    board.currentTurnColor = "black";
    moves = board.findBishopMoves(piece, board);
    if (moves.length !== 7) {
      console.log("testFindBishopMoves failed 1");
      return;
    }
    board = new Board([]);
    piece = new Piece("a2", "white", bishop);
    board.addPiece(piece);
    board.currentTurnColor = "black";
    piece = new Piece("b3", "black", bishop);
    board.addPiece(piece);
    moves = board.findBishopMoves(piece, board);
    if (moves.length !== 9) {
      console.log("testFindBishopMoves failed 2");
      return;
    }
    board = new Board([]);
    piece = new Piece("a2", "black", bishop);
    board.addPiece(piece);
    piece = new Piece("b3", "white", bishop);
    board.addPiece(piece);
    moves = board.findBishopMoves(piece, board);
    if (moves.length !== 9) {
      console.log("testFindBishopMoves failed 3");
      return;
    }
    // console.log("testFindBishopMoves passed");
  }

  private findQueenMoves(piece: Piece, board: Board): Move[] {
    let moves = this.findRookMoves(piece, board);
    moves.push(...this.findBishopMoves(piece, board));
    return moves;
  }

  private testFindQueenMoves() {
    let board = new Board([]);
    let piece = new Piece("a2", "white", queen);
    board.addPiece(piece);
    let moves = board.findQueenMoves(piece, board);
    if (moves.length !== 21) {
      console.log(moves);
      console.error("testFindQueenMoves failed 0");
      return;
    }
    board = new Board([]);
    piece = new Piece("a2", "black", queen);
    board.addPiece(piece);
    board.currentTurnColor = "black";
    moves = board.findQueenMoves(piece, board);
    if (moves.length !== 21) {
      board.displayBoard();
      console.log(moves);
      console.error("testFindQueenMoves failed 1");
      return;
    }
    board = new Board([]);
    piece = new Piece("a2", "white", queen);
    board.addPiece(piece);
    board.currentTurnColor = "black";
    piece = new Piece("b3", "black", queen);
    board.addPiece(piece);
    moves = board.findQueenMoves(piece, board);
    if (moves.length !== 23) {
      console.error("testFindQueenMoves failed 2");
      return;
    }
    board = new Board([]);
    piece = new Piece("a2", "black", queen);
    board.addPiece(piece);
    piece = new Piece("b3", "white", queen);
    board.addPiece(piece);
    moves = board.findQueenMoves(piece, board);
    if (moves.length !== 23) {
      console.error("testFindQueenMoves failed 3");
      return;
    }
    // console.log("testFindQueenMoves passed");
  }

  private findKingMoves(piece: Piece, board: Board): Move[] {
    let moves: Move[] = [];
    let pos = piece.getPos().pos;
    //here I need to add a move that is castling in witch
    //the king can move two squares in either direction depending on the castling rights of the board state
    //
    if (piece.color === "black") {
      //move down once
      let move = new V2D(pos.x, pos.y + 1);
      if (board.Piece(move) === " " && pos.y + 1 <= 7) {
        moves.push(new Move(pos, move));
      } else if (board.Piece(move)?.color === "white" && pos.y + 1 <= 7) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x, pos.y - 1);
      if (board.Piece(move) === " " && pos.y - 1 >= 0) {
        moves.push(new Move(pos, move));
      } else if (board.Piece(move)?.color === "white" && pos.y - 1 >= 0) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x + 1, pos.y);
      if (board.Piece(move) === " " && pos.x + 1 <= 7) {
        moves.push(new Move(pos, move));
      } else if (board.Piece(move)?.color === "white" && pos.x + 1 <= 7) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x - 1, pos.y);
      if (board.Piece(move) === " " && pos.x - 1 >= 0) {
        moves.push(new Move(pos, move));
      } else if (board.Piece(move)?.color === "white" && pos.x - 1 >= 0) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x + 1, pos.y + 1);
      if (board.Piece(move) === " " && pos.x + 1 <= 7 && pos.y + 1 <= 7) {
        moves.push(new Move(pos, move));
      } else if (
        board.Piece(move)?.color === "white" &&
        pos.x + 1 <= 7 &&
        pos.y + 1 <= 7
      ) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x - 1, pos.y + 1);
      if (board.Piece(move) === " " && pos.x - 1 >= 0 && pos.y + 1 <= 7) {
        moves.push(new Move(pos, move));
      } else if (
        board.Piece(move)?.color === "white" &&
        pos.x - 1 >= 0 &&
        pos.y + 1 <= 7
      ) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x + 1, pos.y - 1);
      if (board.Piece(move) === " " && pos.x + 1 <= 7 && pos.y - 1 >= 0) {
        moves.push(new Move(pos, move));
      } else if (
        board.Piece(move)?.color === "white" &&
        pos.x + 1 <= 7 &&
        pos.y - 1 >= 0
      ) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x - 1, pos.y - 1);
      if (board.Piece(move) === " " && pos.x - 1 >= 0 && pos.y - 1 >= 0) {
        moves.push(new Move(pos, move));
      } else if (
        board.Piece(move)?.color === "white" &&
        pos.x - 1 >= 0 &&
        pos.y - 1 >= 0
      ) {
        moves.push(new Move(pos, move));
      }
      //black king side castling
      //problem is I am removing castling rights when finding move before actually moving.
      //King can only castle if it's not in check
      move = new V2D(pos.x + 2, pos.y);
      if (
        board.Piece(move) === " " &&
        pos.x + 2 === 6 &&
        pos.y === 0 &&
        this.inCheck === false
      ) {
        if (
          board.Piece(new V2D(pos.x + 1, pos.y)) === " " &&
          board.castlingRights.includes("k")
        ) {
          moves.push(new Move(pos, move));
        }
      }
      //black queen side castling
      move = new V2D(pos.x - 2, pos.y);
      if (
        board.Piece(move) === " " &&
        pos.x - 2 === 2 &&
        pos.y === 0 &&
        this.inCheck === false
      ) {
        if (
          board.Piece(new V2D(pos.x - 1, pos.y)) === " " &&
          board.Piece(move) === " " &&
          board.castlingRights.includes("q")
        ) {
          moves.push(new Move(pos, move));
        }
      }
    } else {
      let move = new V2D(pos.x, pos.y + 1);
      if (board.Piece(move) === " " && pos.y + 1 <= 7) {
        moves.push(new Move(pos, move));
      } else if (board.Piece(move)?.color === "black" && pos.y + 1 <= 7) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x, pos.y - 1);
      if (board.Piece(move) === " " && pos.y - 1 >= 0) {
        moves.push(new Move(pos, move));
      } else if (board.Piece(move)?.color === "black" && pos.y - 1 >= 0) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x + 1, pos.y);
      if (board.Piece(move) === " " && pos.x + 1 <= 7) {
        moves.push(new Move(pos, move));
      } else if (board.Piece(move)?.color === "black" && pos.x + 1 <= 7) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x - 1, pos.y);
      if (board.Piece(move) === " " && pos.x - 1 >= 0) {
        moves.push(new Move(pos, move));
      } else if (board.Piece(move)?.color === "black" && pos.x - 1 >= 0) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x + 1, pos.y + 1);
      if (board.Piece(move) === " " && pos.x + 1 <= 7 && pos.y + 1 <= 7) {
        moves.push(new Move(pos, move));
      } else if (
        board.Piece(move)?.color === "black" &&
        pos.x + 1 <= 7 &&
        pos.y + 1 <= 7
      ) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x - 1, pos.y + 1);
      if (board.Piece(move) === " " && pos.x - 1 >= 0 && pos.y + 1 <= 7) {
        moves.push(new Move(pos, move));
      } else if (
        board.Piece(move)?.color === "black" &&
        pos.x - 1 >= 0 &&
        pos.y + 1 <= 7
      ) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x + 1, pos.y - 1);
      if (board.Piece(move) === " " && pos.x + 1 <= 7 && pos.y - 1 >= 0) {
        moves.push(new Move(pos, move));
      } else if (
        board.Piece(move)?.color === "black" &&
        pos.x + 1 <= 7 &&
        pos.y - 1 >= 0
      ) {
        moves.push(new Move(pos, move));
      }
      move = new V2D(pos.x - 1, pos.y - 1);
      if (board.Piece(move) === " " && pos.x - 1 >= 0 && pos.y - 1 >= 0) {
        moves.push(new Move(pos, move));
      } else if (
        board.Piece(move)?.color === "black" &&
        pos.x - 1 >= 0 &&
        pos.y - 1 >= 0
      ) {
        moves.push(new Move(pos, move));
      }
      //white king side castling
      move = new V2D(pos.x + 2, pos.y);
      if (
        board.Piece(move) === " " &&
        pos.x + 2 === 6 &&
        pos.y === 7 &&
        this.inCheck === false
      ) {
        if (
          board.Piece(new V2D(pos.x + 1, pos.y)) === " " &&
          board.castlingRights.includes("K")
        ) {
          moves.push(new Move(pos, move));
        }
      }
      //white queen side castling
      move = new V2D(pos.x - 2, pos.y);
      if (
        board.Piece(move) === " " &&
        pos.x - 2 === 2 &&
        pos.y === 7 &&
        this.inCheck === false
      ) {
        if (
          board.Piece(new V2D(pos.x - 1, pos.y)) === " " &&
          board.Piece(move) === " " &&
          board.castlingRights.includes("Q")
        ) {
          moves.push(new Move(pos, move));
        }
      }
    }

    return moves;
  }

  private testFindKingMoves() {
    let board = new Board([]);
    let piece = new Piece("a2", "white", king);
    board.addPiece(piece);
    let moves = board.findKingMoves(piece, board);
    if (moves.length !== 5) {
      console.error("testFindKingMoves failed 0", moves);
      return;
    }
    board = new Board([]);
    piece = new Piece("a2", "black", king);
    board.addPiece(piece);
    board.currentTurnColor = "black";
    moves = board.findKingMoves(piece, board);
    if (moves.length !== 5) {
      console.error("testFindKingMoves failed 1");
      return;
    }
    board = new Board([]);
    piece = new Piece("a2", "white", king);
    board.addPiece(piece);
    board.currentTurnColor = "black";
    piece = new Piece("b3", "black", king);
    board.addPiece(piece);
    moves = board.findKingMoves(piece, board);
    if (moves.length !== 8) {
      console.error("testFindKingMoves failed 2");
      return;
    }
    board = new Board([]);
    piece = new Piece("a2", "black", king);
    board.addPiece(piece);
    piece = new Piece("b3", "white", king);
    board.addPiece(piece);
    moves = board.findKingMoves(piece, board);
    if (moves.length !== 8) {
      console.error("testFindKingMoves failed 3");
      return;
    }
    // console.log("testFindKingMoves passed");
  }

  runAllTests() {
    this.testConvertToPosition();
    this.testConstructors();
    this.testBoardToFen();
    this.testFenToBoard();
    this.testFindPawnMoves();
    this.testFindRookMoves();
    this.testFindKnightMoves();
    this.testFindBishopMoves();
    this.testFindQueenMoves();
    this.testFindKingMoves();
    this.testFindPseudoLegalMoves();
    this.testIsInCheck();
    this.testFindLegalMoves();

    console.log("All tests ran for board class");
  }
}

export class TEST {
  runAllTests() {
    let move = new Move(undefined, undefined, "a2", "a4");
    move.runAllTests();
    let position = new Position("a2");
    position.runAllTests();
    let piece = new Piece("a2", "white", "pawn");
    piece.runAllTests();
    let board = new Board();
    board.runAllTests();
    console.log("All tests ran for chessClasses.ts");
  }
}

//so the find moves function is already set such that it only fetches moves based on current turn.
//now I need to make sure to add the special moves
//so for pawns I must add en-passant and promotion
//for king I must add castling.
//for everything I must check if we are in check, and then add a loop at the bottom, than only returns moves,
//that get us out of check.

export function deepEqual(x: any, y: any): boolean {
  return x && y && typeof x === "object" && typeof y === "object"
    ? Object.keys(x).length === Object.keys(y).length &&
        Object.keys(x).reduce(function (isEqual, key) {
          return isEqual && deepEqual(x[key], y[key]);
        }, true)
    : x === y;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
