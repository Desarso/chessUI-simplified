import {
  createContext,
  useContext,
  createSignal,
  onMount,
} from "solid-js";

interface ContextProps {
  onDragStart: Function;
  onDragEnd: Function;
  createDraggable: Function;
  createDroppable: Function;
  onHoverOver: Function
  onHoverOut: Function,
  onGlobalDragStart: Function
  onGlobalDragEnd: Function
}

interface Draggable {
  id: string;
  startingPosition: { x: number; y: number };
  dragStart: Function[];
  dragEnd: Function;
  ref: any;
  rectangle: any
  data: any
}

interface Droppable {
  id: string;
  startingPosition: { x: number; y: number };
  hoverOver: Function;
  hoverOut: Function;
  ref: any;
  rectangle: any;
  hovering: boolean;
  occupied: boolean;
  droppable: boolean;
}

//I need a drag start assignable function for both draggable and droppable

const DragDropContext = createContext<ContextProps>();

export function DragDropContextProvider(props: any) {
  //here we are keeping track of some of the global states
  //so we need a function to createDraggable, this function should
  const [mousePosition, setMousePosition] = createSignal({ x: 0, y: 0 });
  const [startingMousePosition, setStartingMousePosition] = createSignal({
    x: 0,
    y: 0,
  });
  const [cursorDown, setCursorDown] = createSignal(false);
  const [target, setTarget] = createSignal(null);
  const [previousTarget, setPreviousTarget] = createSignal(null);
  const [previousPosition, setPreviousPosition] = createSignal({ x: 0, y: 0 });
  const [overlapped, setOverlapped] = createSignal(null);
  const [hovered, setHovered] = createSignal(null);


  //all variables for virtual mouse
  const [virtualMousePosition, setVirtualMousePosition] = createSignal({ x: 0, y: 0 });
  const [virtualStartingMousePosition, setVirtualStartingMousePosition] = createSignal({x: 0,y: 0,});
  const [virtualCursorDown, setVirtualCursorDown] = createSignal(false);
  const [virtualTarget, setVirtualTarget] = createSignal(null);
  const [virtualPreviousTarget, setVirtualPreviousTarget] = createSignal(null);
  const [virtualPreviousPosition, setVirtualPreviousPosition] = createSignal({ x: 0, y: 0 });
  const [virtualOverlapped, setVirtualOverlapped] = createSignal(null);
  const [virtualHovered, setVirtualHovered] = createSignal(null);


  const [droppables, setDropables] = createSignal([] as Droppable[]);



  const globalDragStart: Function[] = [];
  const globalDragEnd: Function[] = [];

  //global dran and drop event listeners
  //click down is not global since they are specific to elements only.
  onMount(() => {
    document.addEventListener("pointermove", (e) => {
      //this are general functions, I need to specify them.
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (cursorDown() && target()) {
        target().ref.style.transform = `translate(${
          mousePosition().x - startingMousePosition().x + previousPosition().x
        }px, ${
          mousePosition().y - startingMousePosition().y + previousPosition().y
        }px)`;
        target().ref.style.zIndex = 100;
        target().rectangle = target().ref.getBoundingClientRect();
        if(overlapped()?.length > 0){
          setHovered(findHovered(overlapped()));
        }
      }
    });
    document.addEventListener("pointerup", (e) => {
      if (target() == null) return;
      target().dragEnd(hovered());
      globalDragEnd.forEach((callback) => {
        callback(e);
      });
      if (target()?.ref) {
        target().ref.style.transform = `translate(${0}px, ${.1}px)`;
        target().ref.style.zIndex = 0;
      }
      setCursorDown(false);
      setPreviousTarget(target());
      setTarget(null);
    });

    document.addEventListener("virtualpointermove", (e) => {
      //this are general functions, I need to specify them.
      setVirtualMousePosition({ x: e.clientX, y: e.clientY });
      if (virtualCursorDown() && virtualTarget()) {
        virtualTarget().ref.style.transform = `translate(${
          virtualMousePosition().x - virtualStartingMousePosition().x + virtualPreviousPosition().x
        }px, ${
          virtualMousePosition().y - virtualStartingMousePosition().y + virtualPreviousPosition().y
        }px)`;
        virtualTarget().ref.style.zIndex = 100;
        virtualTarget().rectangle = virtualTarget().ref.getBoundingClientRect();
        if(virtualOverlapped()?.length > 0){
          setVirtualHovered(virtualFindHovered(virtualOverlapped()));
        }
      }
    });
    document.addEventListener("virtualpointerup", (e) => {
      if (virtualTarget() == null) return;
      virtualTarget().dragEnd(virtualHovered());
      globalDragEnd.forEach((callback) => {
        callback(e);
      });
    //   console.log("mouse up");
      // console.log("target", target());
      if (virtualTarget()?.ref) {
        virtualTarget().ref.style.transform = `translate(${0}px, ${.1}px)`;
        virtualTarget().ref.style.zIndex = 0;
        // console.log(target().ref.style)
      }
      setVirtualCursorDown(false);
      setVirtualPreviousTarget(virtualTarget());
      setVirtualTarget(null);
    });

    //create listeners for virtual mouses
  });

  //injection function
  const onDragStart = (callback: any, draggable: Draggable) => {
    if (draggable !== undefined) {
      draggable.dragStart.push(callback) ;
    }
  };

  const onGlobalDragStart = (callback: any) => {
    globalDragStart.push(callback);
  };

  const onGlobalDragEnd = (callback: any) => {
    globalDragEnd.push(callback);
  }


  
  //injection function
  const onDragEnd = (callback: Function, draggable: Draggable) => {
    if (draggable !== undefined) {
      draggable.dragEnd = callback;
    }
  };
   //injection function
  const onHoverOver = (callback: Function, droppable: Droppable) => {
    if(droppable !== undefined){
        droppable.hoverOver = callback;
    }
  }
  const onHoverOut = (callback: Function, droppable: Droppable) => {
    if(droppable !== undefined){
        droppable.hoverOut = callback;
    }
  }


  const createDraggable = (id: string) => {
    let draggable: Draggable = {
      id: id,
      startingPosition: { x: 0, y: 0 },
      dragStart: [],
      dragEnd: () => {},
      ref: null,
      rectangle: null,
      data: {}
    };
    onMount(() => {
      draggable.ref.addEventListener("pointerdown", (e : any) => {
        if(draggable.ref.classList.contains("noDrag")) return;
        setTarget(draggable);
       
        for(let i = 0; i < draggable.dragStart.length; i++){
            draggable.dragStart[i](draggable);
        }
        for(let i = 0; i < globalDragStart.length; i++){
            globalDragStart[i](draggable);
        }
          setPreviousPosition(getPreviousPosition(e.target.getAttribute("style")));
          setStartingMousePosition({x: e.clientX, y: e.clientY});
          setCursorDown(true);
          // setHovered(draggable.ref.parentElement);
          draggable.rectangle = draggable.ref.getBoundingClientRect();

      
          });
      //create listener for virtual pointerdown
      draggable.ref.addEventListener("virtualpointerdown", (e : any) => {
        if(!draggable.ref.classList.contains("noDrag")) return;
        setVirtualTarget(draggable);
        for(let i = 0; i < draggable.dragStart.length; i++){
            draggable.dragStart[i](draggable);
        }
        for(let i = 0; i < globalDragStart.length; i++){
            globalDragStart[i](draggable);
        }
          setVirtualPreviousPosition(getPreviousPosition(e.target.getAttribute("style")));
          setVirtualStartingMousePosition({x: e.clientX, y: e.clientY});
          setVirtualCursorDown(true);
          // setHovered(draggable.ref.parentElement);
          draggable.rectangle = draggable.ref.getBoundingClientRect();

      
          });


    });
    

    return draggable;
  };


  //what currently happens is that the droppable element detects
  //if there is a target() element and that is has a rectangle propery defined
  //then if that is the case, it then checks if this property overlaps it's own

  //what we need is the draggable to check which elements is it overlapping,
  //and then it needs to send a message to the droppable that it is overlapping the most
  //this is because it can overlap multiple droppables at the same time
  //this is done by checking the area of the overlap, which is just basic math

  //right now we have an event listener in the droppable for pointermove
  //we need the droppable to be able to receive messages from the draggable
  
  //what we can do is have a global array of droppables that are being hovered,
  //so if there is overlap, we can add it to the array, but that also means if there is not overlap
  //we need to remove from array, and that seems very computationally expensive
  //

  const createDroppable = (id: string) => {
    let droppable: Droppable = {
      id: id,
      startingPosition: { x: 0, y: 0 },
      hoverOver: () => {},
      hoverOut: () => {},
      ref: null,
      rectangle: null,
      hovering: false,
      occupied: false,
      droppable: true
    }
    //how do we know when something is hovering over?
    //the draggable needs to send a message to the droppable
    setDropables([...droppables(), droppable]);

    onMount(() => {
      droppable.rectangle = droppable.ref.getBoundingClientRect();
      //injecting special code for chess board
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      if(droppable.ref.querySelector(".piece") !== null){
        droppable.occupied = true;
      }
      //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      //old base code
      // if(droppable.ref.children.length > 0){
      //   droppable.occupied = true;
      // }
      document.addEventListener("pointermove", () => {
        if(target() == null) return;
        if (target().rectangle == null) return;
          let rect1 = target().ref.getBoundingClientRect();
          let rect2 = droppable.ref.getBoundingClientRect();
          if (rect1.top > rect2.bottom ||
              rect1.right < rect2.left ||
              rect1.bottom < rect2.top ||
              rect1.left > rect2.right
                ) {
                  removeHovered(droppable);
                  if(!droppable.hovering) return;
                  droppable.hovering = false;
                  droppable.hoverOut(target());
                } else {
                  if(droppable.ref === hovered()?.ref){
                    if(droppable.hovering) return;
                    droppable.hovering = true;
                    droppable.hoverOver(target());
                  }else{
                    droppable.hovering = false;
                    droppable.hoverOut(target());
                  }
                  addHovered(droppable);
                  
                }
    
          

      });
      document.addEventListener("pointerdown", () =>{
          if(target() == null) return;
          if (target().rectangle == null) return;
            let rect1 = target().ref.getBoundingClientRect();
            let rect2 = droppable.ref.getBoundingClientRect();
            if (rect1.top > rect2.bottom ||
                rect1.right < rect2.left ||
                rect1.bottom < rect2.top ||
                rect1.left > rect2.right
                  ) {
                    removeHovered(droppable);
                    if(!droppable.hovering) return;
                    droppable.hovering = false;
                    droppable.hoverOut(target());
                  } else {
                    if(droppable.ref === hovered()?.ref){
                      if(droppable.hovering) return;
                      droppable.hovering = true;
                      droppable.hoverOver(target());
                    }else{
                      droppable.hovering = false;
                      droppable.hoverOut(target());
                    }
                    addHovered(droppable);
                    
                  }

              if(overlapped()?.length > 0){
                setHovered(findHovered(overlapped()));
                // console.log("hovered", hovered() )
              }


      
      });
      document.addEventListener("pointerup", () => {
        if(!droppable.hovering) return;
        droppable.hovering = false;
        droppable.hoverOut(previousTarget());
        if(previousTarget() == null) return;
        if(droppable.droppable === false) return;


        // console.log("removed something");
        //also modified for chess
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if(droppable.ref.querySelector(".piece") !== null){
          //right here I am removing the children, if the droppable is occupied
          //what I need to do it take this child and send it back to the event
          droppable.ref.querySelector(".piece").remove();
          // console.log("PIECE REMOVED")
        }else if(droppable.ref.querySelector(".circle") !== null){
          droppable.ref.querySelector(".circle").remove();
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //in a regular program I would just remove the only child, but the board square has
        //numbers and letters that mess this up, so I must specify the child types to remove

     
        droppable.ref.appendChild(previousTarget().ref);
          

      });

      document.addEventListener("virtualpointermove", () => {
        if(virtualTarget() == null) return;
        if (virtualTarget().rectangle == null) return;
          let rect1 = virtualTarget().ref.getBoundingClientRect();
          let rect2 = droppable.ref.getBoundingClientRect();
          if (rect1.top > rect2.bottom ||
              rect1.right < rect2.left ||
              rect1.bottom < rect2.top ||
              rect1.left > rect2.right
                ) {
                  virtualRemoveHovered(droppable);
                  if(!droppable.hovering) return;
                  droppable.hovering = false;
                  droppable.hoverOut(virtualTarget());
                } else {
                  if(droppable.ref === virtualHovered()?.ref){
                    if(droppable.hovering) return;
                    droppable.hovering = true;
                    droppable.hoverOver(virtualTarget());
                  }else{
                    droppable.hovering = false;
                    droppable.hoverOut(virtualTarget());
                  }
                  virtualAddHovered(droppable);
                  // for (let i=0; i < virtualHovered().length; i++){
                  //   console.log(virtualHovered())
                  // }
                  
                }
    
          

      });
      document.addEventListener("virtualpointerdown", () =>{
          if(virtualTarget() == null) return;
          if (virtualTarget().rectangle == null) return;
            let rect1 = virtualTarget().ref.getBoundingClientRect();
            let rect2 = droppable.ref.getBoundingClientRect();
            if (rect1.top > rect2.bottom ||
                rect1.right < rect2.left ||
                rect1.bottom < rect2.top ||
                rect1.left > rect2.right
                  ) {
                    virtualRemoveHovered(droppable);
                    if(!droppable.hovering) return;
                    droppable.hovering = false;
                    droppable.hoverOut(virtualTarget());
                  } else {
                    if(droppable.ref === virtualHovered()?.ref){
                      if(droppable.hovering) return;
                      droppable.hovering = true;
                      droppable.hoverOver(virtualTarget());
                    }else{
                      droppable.hovering = false;
                      droppable.hoverOut(virtualTarget());
                    }
                    virtualAddHovered(droppable);
                    
                  }

              if(virtualOverlapped()?.length > 0){
                setVirtualHovered(virtualFindHovered(virtualOverlapped()));
                // console.log("hovered", hovered() )
              }


      
      });
      //DOUBLE CHECKED
      document.addEventListener("virtualpointerup", () => {
        // if(droppable.ref.children.length === 0){
        //   droppable.occupied = false;
        // }
        // if(droppable.ref.children.length > 0){
        //   droppable.occupied = true;
        // }
        if(!droppable.hovering) return;
        droppable.hovering = false;
        droppable.hoverOut(virtualPreviousTarget());
        // console.log("hi")
        if(virtualPreviousTarget() == null) return;
        // if(droppable.occupied) return;
        if(droppable.droppable === false) return;

        // console.log("removed something");
        //also modified for chess
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        if(droppable.ref.querySelector(".piece") !== null){
          //right here I am removing the children, if the droppable is occupied
          //what I need to do it take this child and send it back to the event
          droppable.ref.querySelector(".piece").remove();
          // console.log("PIECE REMOVED")
        }else if(droppable.ref.querySelector(".circle") !== null){
          droppable.ref.querySelector(".circle").remove();
        }
        //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        //in a regular program I would just remove the only child, but the board square has
        //numbers and letters that mess this up, so I must specify the child types to remove

     
        droppable.ref.appendChild(virtualPreviousTarget().ref);
          

      });
    });
    return droppables()[droppables().length - 1];
 }



 //universal
 function getPreviousPosition(style: string) {
  if (style === null) return { x: 0, y: 0 };
  let ass = style.split("translate(")[0];
  let position;
  if (ass) {
    position = style.split("translate(")[1].split(")")[0].split("px, ");
  }
  return { x: parseInt(position[0]), y: parseInt(position[1]) };
}

function addHovered(droppable: Droppable) {
  if(overlapped() == null) setOverlapped([droppable]);
  if(overlapped().includes(droppable)) return;
  if(!overlapped()?.includes(droppable)) setOverlapped([...overlapped(), droppable]);
}

function removeHovered(droppable: Droppable) {
  if(overlapped() == null) return;
  if(!overlapped()?.includes(droppable)) return;
  if(overlapped().includes(droppable)) setOverlapped(overlapped()?.filter((d) => d !== droppable));

}

function findHovered(overlapped: Droppable[])  {
  if(overlapped == null) return;
  let targetRect = target().ref.getBoundingClientRect();
  let hovered = overlapped.sort((a, b) => {
    //we are given two rectangles, we must compare with target()
    //and return same but calculate correctly
    let arect = a.ref.getBoundingClientRect();
    let brect = b.ref.getBoundingClientRect();
    let awidht;
    let aheight;
    let bwidth;
    let bheight;
    let areaA;
    let areaB;

    //bottom is actually top, need to reverse y coords
    if(targetRect.x > arect.x){
      awidht = arect.right - targetRect.x;
    }else{
      awidht = targetRect.right - arect.x;
    }
    if(targetRect.bottom > arect.bottom){
      aheight = arect.bottom - targetRect.top;
    }else{
      aheight = targetRect.bottom - arect.top;
    }
    areaA = awidht * aheight;

    if(targetRect.x > brect.x){
      bwidth = brect.right - targetRect.x;
    }else{
      bwidth = targetRect.right - brect.x;
    }
    if(targetRect.bottom > brect.bottom){
      bheight = brect.bottom - targetRect.top;
    }else{
      bheight = targetRect.bottom - brect.top;
    }

    areaB = bwidth * bheight;

   
    return areaB - areaA;
  });

  return hovered[0];
}

function virtualAddHovered(droppable: Droppable) {
  if(virtualOverlapped() == null) setVirtualOverlapped([droppable]);
  if(virtualOverlapped().includes(droppable)) return;
  if(!virtualOverlapped()?.includes(droppable)) setVirtualOverlapped([...virtualOverlapped(), droppable]);
}

function virtualRemoveHovered(droppable: Droppable) {
  if(virtualOverlapped() == null) return;
  if(!virtualOverlapped()?.includes(droppable)) return;
  if(virtualOverlapped().includes(droppable)) setVirtualOverlapped(virtualOverlapped()?.filter((d) => d !== droppable));

}

function virtualFindHovered(overlapped: Droppable[])  {
  if(overlapped == null) return;
  let targetRect = virtualTarget().ref.getBoundingClientRect();
  let hovered = overlapped.sort((a, b) => {
    //we are given two rectangles, we must compare with target()
    //and return same but calculate correctly
    let arect = a.ref.getBoundingClientRect();
    let brect = b.ref.getBoundingClientRect();
    let awidht;
    let aheight;
    let bwidth;
    let bheight;
    let areaA;
    let areaB;

    //bottom is actually top, need to reverse y coords
    if(targetRect.x > arect.x){
      awidht = arect.right - targetRect.x;
    }else{
      awidht = targetRect.right - arect.x;
    }
    if(targetRect.bottom > arect.bottom){
      aheight = arect.bottom - targetRect.top;
    }else{
      aheight = targetRect.bottom - arect.top;
    }
    areaA = awidht * aheight;

    if(targetRect.x > brect.x){
      bwidth = brect.right - targetRect.x;
    }else{
      bwidth = targetRect.right - brect.x;
    }
    if(targetRect.bottom > brect.bottom){
      bheight = brect.bottom - targetRect.top;
    }else{
      bheight = targetRect.bottom - brect.top;
    }

    areaB = bwidth * bheight;

   
    return areaB - areaA;
  });

  return hovered[0];
}

  return (
    <DragDropContext.Provider
      value={{ onDragEnd, onDragStart, createDraggable, onHoverOver, createDroppable, onHoverOut, onGlobalDragStart, onGlobalDragEnd }}
    >
      {props.children}
    </DragDropContext.Provider>   
  );
}

export const useDragDropContext = () => useContext(DragDropContext)!;


