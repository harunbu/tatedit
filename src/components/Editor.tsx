import React from 'react';
import './editor.css';
import { Button } from '@material-ui/core';

let debugText = '';

const upKeys = ['ArrowUp', 'Up'];
const downKeys = ['ArrowDown', 'Down'];
const rightKeys = ['ArrowRight', 'Right'];
const leftKeys = ['ArrowLeft', 'Left'];
const verticalKeys = upKeys.concat(downKeys);
const horizontalKeys = rightKeys.concat(leftKeys);
const cursorKeys = verticalKeys.concat(horizontalKeys);

/**
 * ペースト時にスタイルを除去する
 */
const pasteHandler = (e: React.ClipboardEvent) => {
  const selection = window.getSelection();
  if (selection === null) {
    return;
  }
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(e.clipboardData.getData('Text'));
  range.insertNode(textNode);
  range.setEnd(textNode, e.clipboardData.getData('Text').length)
  selection.removeAllRanges();
  selection.addRange(range);
  selection.collapseToEnd();
  textNode.parentNode?.normalize();
  e.preventDefault();
}

/**
 * キーダウンハンドラ
 * @param e
 */
const keydown = (e: React.KeyboardEvent): void => {
  if (cursorKeys.includes(e.key)) {
    e.preventDefault();
    cursorKeyDown(e.key, e.shiftKey);
  }
  //Ctrl + b を禁止
  if (e.key === 'b' && e.ctrlKey) {
    e.preventDefault();
  }
  //Ctrl + i を禁止
  if (e.key === 'i' && e.ctrlKey) {
    e.preventDefault();
  }
  //Ctrl + u を禁止
  if (e.key === 'u' && e.ctrlKey) {
    e.preventDefault();
  }
}

/**
 * カーソルキーハンドラ
 * @return boolean 移動に成功したらtrueを返す
 */
const cursorKeyDown = (key: string, isShiftKey: boolean): boolean => {
  //カーソルがいる要素と位置を取得
  const selection = window.getSelection();
  const focusNode = selection?.focusNode;
  const focusOffset = selection?.focusOffset;
  if (selection === null || ! focusNode || focusOffset === undefined) {
    return false;
  }

  //移動先を取得
  const moveHandler = getMoveHandler(key);
  const result = moveHandler(focusNode, focusOffset);
  if (result === false) {
    return false;
  }

  //移動
  console.log(result);
  const [nextNode, nextOffset] = result;
  if (isShiftKey) {
    selection.extend(nextNode, nextOffset);
  } else {
    selection.collapse(nextNode, nextOffset);
  }

  return true;
}

//各方向キー毎のイベントハンドラを取得
const getMoveHandler = (key: string): (node: Node, offset: number) => [Node, number] | false => {
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
const upKeyDown = (focusNode: Node, focusOffset: number): [Node, number] | false => {
  //要素内の移動であればそのままオフセットだけずらす
  if (focusOffset > 0) {
    return [focusNode, focusOffset - 1];
  }

  //要素の一番上で押された場合は、一つ前の要素の一番下に移動する
  const previousElement = getPreviousElement(focusNode);
  if (previousElement) {
    return [previousElement, previousElement.nodeValue?.length || focusOffset];
  }

  //一つ前の要素が見つからない場合は何もしない
  return false;
}

/**
 * 下キーを押された場合
 * @param pos 
 */
const downKeyDown = (focusNode: Node, focusOffset: number): [Node, number] | false => {
  if (focusOffset < (focusNode.nodeValue?.length || 0)) {
    //要素内の移動であればそのままオフセットだけずらす
    return [focusNode, focusOffset + 1];
  }

  //要素の一番下で押された場合は、一つ後の要素の一番下に移動する
  const nextElement = getNextElement(focusNode);
  if (nextElement) {
    return [nextElement, 0];
  }

  //一つ後の要素が見つからなければ何もしない
  return false;
}

/**
 * 左キーを押された場合
 * @param pos 
 */
const leftKeyDown = (focusNode: Node, focusOffset: number): [Node, number] | false => {
  //一つ後の要素の同じ位置に移動
  const nextElement = getNextElement(focusNode);
  if (nextElement) {
    const nextStrLength : number = nextElement.nodeValue?.length || 0;
    //同じ位置に移動できなければ一番下に移動
    const nextOffset: number = (nextStrLength < focusOffset) ? nextStrLength : focusOffset;
    return [nextElement, nextOffset]
  }

  //一つ後の要素が見つからなければ何もしない
  return false;
}

/**
 * 右キーを押された場合
 * @param pos 
 */
const rightKeyDown = (focusNode: Node, focusOffset: number): [Node, number] | false => {
  //一つ後の要素の同じ位置に移動
  const previousElement = getPreviousElement(focusNode);
  if (previousElement) {
    const nextStrLength : number = previousElement.nodeValue?.length || 0;
    //同じ位置に移動できなければ一番下に移動
    const nextOffset: number = (nextStrLength < focusOffset) ? nextStrLength : focusOffset;
    return [previousElement, nextOffset]
  }

  //一つ後の要素が見つからなければ何もしない
  return false;
}

//一つ前の要素を取得する
const getPreviousElement = (element: Node): Node | undefined => {
  //ひとつ前の要素がテキストノードであればそれを返す
  if (element.previousSibling && element.previousSibling.nodeType === Node.TEXT_NODE) {
    return element.previousSibling;
  }
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
  //ひとつ前の要素がテキストノードであればそれを返す
  if (element.nextSibling && element.nextSibling.nodeType === Node.TEXT_NODE) {
    return element.nextSibling;
  }
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
      <div contentEditable id="edit-area" onKeyDown={keydown} onPaste={pasteHandler}></div>
    </React.Fragment>
  );
}

export default Editor;