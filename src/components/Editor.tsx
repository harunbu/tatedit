import React from 'react';
import './editor.css';

const upKeys = ['ArrowUp', 'Up'];
const downKeys = ['ArrowDown', 'Down'];
const rightKeys = ['ArrowRight', 'Right'];
const leftKeys = ['ArrowLeft', 'Left'];
const verticalKeys = upKeys.concat(downKeys);
const horizontalKeys = rightKeys.concat(leftKeys);
const cursorKeys = verticalKeys.concat(horizontalKeys);

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
const keydown = (e: React.KeyboardEvent): void => {
  //カーソルキーが押された際の動作をオーバーライド
  if (cursorKeys.includes(e.key)) {
    cursorKeyDown(e.key) && e.preventDefault();
  }
}

/**
 * カーソルキーハンドラ
 */
const cursorKeyDown = (key: string): boolean => {
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
const getCursorPos = (): CursorPos | null => {
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
const getNextPos = (key: string, pos: CursorPos): CursorPos | false => {
  if (upKeys.includes(key)) {
    return upKeyDown(pos);
  }
  if (downKeys.includes(key)) {
    return downKeyDown(pos);
  }
  if (leftKeys.includes(key)) {
    return leftKeyDown(pos);
  }
  if (rightKeys.includes(key)) {
    return rightKeyDown(pos);
  }

  return false;
}

/**
 * カーソルを移動
 * @param pos
 */
const moveCursor = (pos: CursorPos): void  =>{
  const range = document.createRange();
  range.setStart(pos.element, pos.offset);
  range.setEnd(pos.element, pos.offset);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

/**
 * 上キーを押された場合
 * @param pos 
 */
const upKeyDown = (pos: CursorPos): CursorPos => {
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
 * @param pos 
 */
const downKeyDown = (pos: CursorPos): CursorPos => {
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
 * @param pos 
 */
const leftKeyDown = (pos: CursorPos): CursorPos => {
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
 * @param pos 
 */
const rightKeyDown = (pos: CursorPos): CursorPos => {
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

//一つ前の要素を取得する
const getPreviousElement = (element: Node): Node | undefined => {
  const parentElementId:string = element.parentElement?.id || '';
  const previousParentElement = (parentElementId === 'edit-area')
    ? element.previousSibling
    : element.parentElement?.previousSibling;
  if ((previousParentElement?.nodeType || 0) === 1) {
    return previousParentElement?.childNodes[0];
  }
  return previousParentElement || undefined;
}

//一つ後の要素を取得する
const getNextElement = (element: Node) : Node | undefined => {
  const parentElementId:string = element.parentElement?.id || '';
  const nextParentElement = (parentElementId === 'edit-area')
    ? element.nextSibling
    : element.parentElement?.nextSibling;
  if ((nextParentElement?.nodeType || 0) === 1) {
    return nextParentElement?.childNodes[0];
  }
  return nextParentElement || undefined;
}

const Editor = () => {
  return (
    <React.Fragment>
      <div contentEditable id="edit-area" onKeyDown={keydown}></div>
    </React.Fragment>
  );
}

export default Editor;