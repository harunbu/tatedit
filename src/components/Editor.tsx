import React from 'react';
import './editor.css';

const upKeys:string[] = ['ArrowUp', 'Up'];
const downKeys:string[] = ['ArrowDown', 'Down'];
const rightKeys:string[] = ['ArrowRight', 'Right'];
const leftKeys:string[] = ['ArrowLeft', 'Left'];
const verticalKeys:string[] = upKeys.concat(downKeys);
const horizontalKeys:string[] = rightKeys.concat(leftKeys);
const cursorKeys:string[] = verticalKeys.concat(horizontalKeys);

/**
 * キーダウンハンドラ
 * @param e
 */
function keydown(e: React.KeyboardEvent) : void {
  //カーソルキーが押された際の動作をオーバーライド
  if (cursorKeys.includes(e.key)) {
    cursorKeyDown(e.key) && e.preventDefault();
  }
}

/**
 * カーソルの位置を示すオブジェクト
 */
interface CursorPos {
  element: Node,
  offset: number,
}

/**
 * cursorの位置を取得
 */
function getCursorPos() : CursorPos | null {
  const selection = window.getSelection();
  const targetRange = selection?.getRangeAt(0);
  const startContainer = targetRange?.startContainer;
  const startOffset = targetRange?.startOffset;
  if (startContainer === undefined || startOffset === undefined) {
    return null;
  }
  const cursorPos : CursorPos = {
    element: startContainer,
    offset: startOffset,
  };
  return cursorPos;
}

//一つ前の要素の親要素を取得する
function getPreviousParentElement(element:Node) {
  if ((element.parentElement?.id || '') === 'edit-area') {
    return element.previousSibling;
  }
  return element.parentElement?.previousSibling;
}

//一つ前の要素を取得する
function getPreviousElement(element:Node) {
  const previousParentElement = getPreviousParentElement(element);
  if ((previousParentElement?.nodeType || 0) === 1) {
    return previousParentElement?.childNodes[0];
  }
  return previousParentElement;
}

//一つ前の要素の親要素を取得する
function getNextParentElement(element:Node) {
  if ((element.parentElement?.id || '') === 'edit-area') {
    return element.nextSibling;
  }
  return element.parentElement?.nextSibling;
}

//一つ前の要素を取得する
function getNextElement(element:Node) {
  const previousParentElement = getNextParentElement(element);
  if ((previousParentElement?.nodeType || 0) === 1) {
    return previousParentElement?.childNodes[0];
  }
  return previousParentElement;
}

//上キーを押された場合
function upKeyDown(key : string, pos : CursorPos) : CursorPos {
    const nextPos:CursorPos = {
      element: pos.element,
      offset: pos.offset,
    };
    if (pos.offset > 0) {
      //要素内の移動であればそのままオフセットだけずらす
      nextPos.offset = pos.offset - 1;
    } else {
      //要素の一番上で押された場合は、一つ前の要素の一番下に移動する
      const previous = getPreviousElement(pos.element);
      if (previous) {
        nextPos.element = previous;
        nextPos.offset = previous.nodeValue?.length || pos.offset;
      }
    }
    return nextPos;
}
//下キーを押された場合
function downKeyDown(key : string, pos : CursorPos) : CursorPos {
    //要素内の異動であればそのままオフセットだけずらす
    const strLength:number = pos.element.nodeValue?.length || 0;
    const nextPos:CursorPos = {
      element: pos.element,
      offset: pos.offset,
    };
    if (pos.offset + 1 <= strLength) {
      //要素内の移動であればそのままオフセットだけずらす
      nextPos.offset = pos.offset + 1;
    } else {
      //要素の一番下で押された場合は、一つ後の要素の一番上に移動する
      const next = getNextElement(pos.element);
      if (next) {
        nextPos.element = next;
        nextPos.offset = 0;
      }
    }
    return nextPos;
}

/**
 * カーソルを移動
 * @param pos
 */
function moveCursor(pos:CursorPos) {
  //console.log(pos);
  const range = document.createRange();
  range.setStart(pos.element, pos.offset);
  range.setEnd(pos.element, pos.offset);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}



/**
 * カーソルキーハンドラ
 */
function cursorKeyDown(key : string) : boolean {
  //カーソルがいる要素と位置を取得
  const pos = getCursorPos();
  if (pos === null) {
    return false;
  }
  //移動先の要素を判定し、移動
  if (upKeys.includes(key)) {
    moveCursor(upKeyDown(key, pos));
  } else if (downKeys.includes(key)) {
    moveCursor(downKeyDown(key, pos));
  }
  return true;
}

function Editor() {
  return (
    <React.Fragment>
      <div contentEditable id="edit-area" onKeyDown={keydown}></div>
    </React.Fragment>
  );
}

export default Editor;