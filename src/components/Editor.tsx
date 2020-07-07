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
 * カーソルの位置を示すオブジェクト
 */
interface CursorPos {
  element: Node,
  offset: number,
}

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
 * カーソルキーハンドラ
 */
function cursorKeyDown(key : string) : boolean {
  //カーソルがいる要素と位置を取得
  const pos = getCursorPos();
  if (pos === null) {
    return false;
  }
  //移動先の要素を判定
  const nextPos = getNextPos(key, pos);
  if (! nextPos) {
    return false;
  }

  //移動
  moveCursor(nextPos);

  return true;
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

/**
 * 移動先の要素を取得
 */
function getNextPos(key : string, pos : CursorPos) : CursorPos | false {
  if (upKeys.includes(key)) {
    return upKeyDown(key, pos);
  }
  if (downKeys.includes(key)) {
    return downKeyDown(key, pos);
  }
  if (leftKeys.includes(key)) {
    return leftKeyDown(key, pos);
  }
  if (rightKeys.includes(key)) {
    return rightKeyDown(key, pos);
  }

  return false;
}

/**
 * カーソルを移動
 * @param pos
 */
function moveCursor(pos : CursorPos) {
  const range = document.createRange();
  range.setStart(pos.element, pos.offset);
  range.setEnd(pos.element, pos.offset);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/**
 * 上キーを押された場合
 * @param key 
 * @param pos 
 */
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

/**
 * 下キーを押された場合
 * @param key 
 * @param pos 
 */
function downKeyDown(key : string, pos : CursorPos) : CursorPos {
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
 * 左キーを押された場合
 * @param key 
 * @param pos 
 */
function leftKeyDown(key : string, pos : CursorPos) : CursorPos {
  const nextPos : CursorPos = {
    element: pos.element,
    offset: pos.offset,
  };
  //一つ後の要素を取得
  const next = getNextElement(pos.element);
  if (! next) {
    return nextPos;
  }
  nextPos.element = next;
  const nextStrLength : number = next.nodeValue?.length || 0;
  //移動先のオフセットが存在すればそのまま移動
  if (nextStrLength < nextPos.offset) {
    //存在しない場合は移動先の末尾に移動
    nextPos.offset = nextStrLength;
  }

  return nextPos
}

/**
 * 右キーを押された場合
 * @param key 
 * @param pos 
 */
function rightKeyDown(key : string, pos : CursorPos) : CursorPos {
  const nextPos : CursorPos = {
    element: pos.element,
    offset: pos.offset,
  };
  //一つ前の要素を取得
  const previous = getPreviousElement(pos.element);
  if (! previous) {
    return nextPos;
  }
  nextPos.element = previous;
  const nextStrLength : number = previous.nodeValue?.length || 0;
  //移動先のオフセットが存在すればそのまま移動
  if (nextStrLength < nextPos.offset) {
    //存在しない場合は移動先の末尾に移動
    nextPos.offset = nextStrLength;
  }

  return nextPos
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

//一つ後の要素の親要素を取得する
function getNextParentElement(element:Node) {
  if ((element.parentElement?.id || '') === 'edit-area') {
    return element.nextSibling;
  }
  return element.parentElement?.nextSibling;
}

//一つ後の要素を取得する
function getNextElement(element:Node) {
  const previousParentElement = getNextParentElement(element);
  if ((previousParentElement?.nodeType || 0) === 1) {
    return previousParentElement?.childNodes[0];
  }
  return previousParentElement;
}

function Editor() {
  return (
    <React.Fragment>
      <div contentEditable id="edit-area" onKeyDown={keydown}></div>
    </React.Fragment>
  );
}

export default Editor;