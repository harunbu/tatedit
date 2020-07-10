import React from 'react';
import './editor.css';
import { Button } from '@material-ui/core';

const upKeys = ['ArrowUp', 'Up'];
const downKeys = ['ArrowDown', 'Down'];
const rightKeys = ['ArrowRight', 'Right'];
const leftKeys = ['ArrowLeft', 'Left'];
const verticalKeys = upKeys.concat(downKeys);
const horizontalKeys = rightKeys.concat(leftKeys);
const cursorKeys = verticalKeys.concat(horizontalKeys);

/**
 * キーダウンハンドラ
 * @param e
 */
const keydown = (e: React.KeyboardEvent): void => {
  if (cursorKeys.includes(e.key)) {
    e.preventDefault();
    cursorKeyDown(e.key, e.shiftKey);
  }
}

/**
 * カーソルキーハンドラ
 * @return boolean 移動に成功したらtrueを返す
 */
const cursorKeyDown = (key: string, isShiftKey: boolean): boolean => {
  //カーソルがいる要素と位置を取得
  const selection = window.getSelection();
  if (selection === null) {
    return false;
  }

  //移動
  const moveHandler = getMoveHandler(key);
  const result = moveHandler(selection);
  if (result === false) {
    return false;
  }

  const [nextNode, nextOffset] = result;
  if (isShiftKey) {
    selection.extend(nextNode, nextOffset);
  } else {
    selection.collapse(nextNode, nextOffset);
  }

  return true;
}

//各方向キー毎のイベントハンドラを取得
const getMoveHandler = (key: string): (sel: Selection) => [Node, number] | false => {
  if (upKeys.includes(key)) {
    return upKeyDown;
  }
  if (downKeys.includes(key)) {
    return downKeyDown;
  }
  if (leftKeys.includes(key)) {
    return leftKeyDown;
  }

  return rightKeyDown;
};

/**
 * 上キーを押された場合
 * @param pos 
 */
const upKeyDown = (sel: Selection): [Node, number] | false => {
  const focusNode = sel.focusNode;
  if (focusNode === null) {
    return false;
  }
  let nextNode: Node = focusNode;
  let nextOffset: number = sel.focusOffset;
  if (sel.focusOffset > 0) {
    //要素内の移動であればそのままオフセットだけずらす
    nextNode = focusNode;
    nextOffset = sel.focusOffset - 1;
  } else {
    //要素の一番上で押された場合は、一つ前の要素の一番下に移動する
    const previous = getPreviousElement(focusNode);
    if (previous) {
      nextNode = previous;
      nextOffset = previous.nodeValue?.length || nextOffset;
    }
  }

  return [nextNode, nextOffset];
}

/**
 * 下キーを押された場合
 * @param pos 
 */
const downKeyDown = (sel: Selection): [Node, number] | false => {
  const focusNode = sel.focusNode;
  if (focusNode === null) {
    return false;
  }
  let nextNode: Node = focusNode;
  let nextOffset: number = sel.focusOffset;
  const focusLength:number = focusNode.nodeValue?.length || 0;
  if (sel.focusOffset < focusLength) {
    //要素内の移動であればそのままオフセットだけずらす
    nextNode = focusNode;
    nextOffset = sel.focusOffset + 1;
  } else {
    //要素の一番上で押された場合は、一つ前の要素の一番下に移動する
    const nextElement = getNextElement(focusNode);
    if (nextElement) {
      nextNode = nextElement;
      nextOffset = 0;
    }
  }
  return [nextNode, nextOffset];
}

/**
 * 左キーを押された場合
 * @param pos 
 */
const leftKeyDown = (sel: Selection): [Node, number] | false => {
  const focusNode = sel.focusNode;
  if (focusNode === null) {
    return false;
  }
  //一つ後の要素を取得
  const nextNode = getNextElement(focusNode);
  if (! nextNode) {
    return false;
  }
  const nextStrLength : number = nextNode.nodeValue?.length || 0;
  const nextOffset: number = (nextStrLength < sel.focusOffset) ? nextStrLength : sel.focusOffset;

  return [nextNode, nextOffset];
}

/**
 * 右キーを押された場合
 * @param pos 
 */
const rightKeyDown = (sel: Selection): [Node, number] | false => {
  const focusNode = sel.focusNode;
  if (focusNode === null) {
    return false;
  }
  //一つ後の要素を取得
  const previousNode = getPreviousElement(focusNode);
  if (! previousNode) {
    return false;
  }
  const nextStrLength : number = previousNode.nodeValue?.length || 0;
  const nextOffset: number = (nextStrLength < sel.focusOffset) ? nextStrLength : sel.focusOffset;

  return [previousNode, nextOffset];
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

const getRange = (e: any) => {
  const selection = window.getSelection();
  console.log(selection);
};

const Editor = () => {
  return (
    <React.Fragment>
      <div contentEditable id="edit-area" onKeyDown={keydown}></div>
      <Button onClick={getRange}>取得</Button>
    </React.Fragment>
  );
}

export default Editor;