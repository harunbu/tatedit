import React from 'react';
import './editor.css';
import { Link } from "react-router-dom";

//行の高さ
const lineHeight = 31.5;

/**
 * ホイールイベント
 * @param e 
 */
const wheelMove = (e: React.WheelEvent) => {
  e.currentTarget.scrollLeft -= e.deltaY;
};

/**
 * ペーストイベント
 * @param e 
 */
const paste = (e: React.ClipboardEvent) => {
  const range = window?.getSelection()?.getRangeAt(0);
  if (range === undefined) {
    return;
  }
  //offsetがずれるので改行コードを統一
  const clipboardText = e.clipboardData.getData('text/plain').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  range.deleteContents();
  range.insertNode(document.createTextNode(clipboardText));
  range.endContainer?.parentElement?.normalize();
  range.collapse(false);
  e.preventDefault();
};

/**
 * キーダウンイベント
 * @param e 
 */
const keyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
      enterKeyDown(e);
      e.preventDefault();
      updateCount();
      break;
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowRight':
    case 'ArrowLeft':
      arrowKeyDown(e) && e.preventDefault();
      updateCount();
      break;
  }
};

/**
 * エンターキーが押された場合
 * @param e 
 */
const enterKeyDown = (e: React.KeyboardEvent) => {
  const range = window.getSelection()?.getRangeAt(0);
  if (range instanceof Range) {
    range.deleteContents();
    const breakLineText = isDoubleBreakLine(range.endOffset) ? '\n\n' : '\n';
    const breakLine = document.createTextNode(breakLineText);
    range.insertNode(breakLine);
    range.selectNode(breakLine);
    range.setStart(breakLine, breakLineText.length);
    range.setEnd(breakLine, breakLineText.length);
    e.currentTarget.normalize();
  }
};

/**
 * エンターキーが押された際に改行コードを2文字入力するか否かの判定
 * @param offset 
 */
const isDoubleBreakLine = (offset : number) => {
  const editArea = document.getElementById('edit-area');
  //文章の最後で、かつカーソルのひとつ前が改行ではなかった場合
  return offset === editArea?.innerText.length &&
   editArea?.innerText.substr(offset - 1 , 1) !== '\n';
}

/**
 * カーソルキーが押された場合
 * @param e 
 */
const arrowKeyDown = (e: React.KeyboardEvent): boolean => {
  const selection = window.getSelection();
  const focusNode = selection?.focusNode;
  const focusOffset = selection?.focusOffset;
  const editArea = document.getElementById('edit-area');
  if (selection === undefined || selection === null ||
    focusNode === undefined || focusNode === null ||
    focusOffset === undefined || editArea === null
  ) {
    return false;
  }
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const tempRange = document.createRange();
    tempRange.setStart(focusNode, focusOffset);
    tempRange.setEnd(focusNode, focusOffset);
    const rect = getCaretRect(tempRange);
    let nextRange = document.caretRangeFromPoint(
      rect.x + ((e.key === 'ArrowRight') ? (lineHeight * 1.5) : -(lineHeight * 0.5)),
      rect.y
    );
    if (
      nextRange.endContainer instanceof Element &&
      nextRange.endContainer.nodeType !== Node.TEXT_NODE
    ) {
      //移動先の要素がtextでは無かった場合（スクロールをオーバーする場合）
      const shift = ((e.key === 'ArrowRight') ? -lineHeight : lineHeight);
      editArea.scrollLeft -= shift;
      const rect2 = getCaretRect(tempRange);
      nextRange = document.caretRangeFromPoint(
        rect2.x + ((e.key === 'ArrowRight') ? (lineHeight * 1.5) : -(lineHeight * 0.5)),
        rect2.y
      );
      if (
        nextRange.endContainer instanceof Element &&
        nextRange.endContainer.tagName.toLowerCase() === 'body'
      ) {
        nextRange = tempRange;
      }
    }
    selection.extend(nextRange.endContainer, nextRange.endOffset);
  } else {
    //上下キーの場合は単純にoffsetをずらして移動
    if (e.key === 'ArrowDown') {
      const nodeLength: number = focusNode?.nodeValue?.length || 0;
      if (selection.focusOffset < nodeLength) {
        selection.extend(focusNode, focusOffset + 1);
      }
    } else if (e.key === 'ArrowUp') {
      if (selection.focusOffset > 0) {
        selection.extend(focusNode, selection.focusOffset - 1);
      }
    }
  }
  if (! e.shiftKey) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      selection.collapseToEnd();
    } else {
      selection.collapseToStart();
    }
  }

  return true;
}

/**
 * キャレット位置のRectを取得
 */
const getCaretRect = (range: Range) => {
  const anchor = document.createElement('span');
  anchor.innerHTML = '&#8203;'
  range.insertNode(anchor);
  const rect = anchor.getBoundingClientRect();
  const parent = anchor.parentElement;
  if (parent !== null) {
    parent.removeChild(anchor);
    parent.normalize();
  }

  return rect;
};

/**
 * キーアップイベント
 * @param e
 */
const keyUp = (e: React.KeyboardEvent) => {
  updateCount();
}

/**
 * 文字数カウンタを更新
 */
const updateCount = () => {
  const editArea = document.getElementById('edit-area');
  const charCount = document.getElementById('charCount');
  if (charCount instanceof HTMLElement && editArea instanceof HTMLElement) {
    charCount.innerText = editArea.innerText.replace(/[\r\n]/g, '').length.toString();
  }
}

const compositionStart = () => {
  const range = window.getSelection()?.getRangeAt(0);
  const inputWindow = document.getElementById('input-window');
  if (range instanceof Range && inputWindow instanceof HTMLElement) {
    const rect = getCaretRect(range);
    inputWindow.style.display = 'block';
    inputWindow.style.top = (rect.top)+'px';
    inputWindow.style.left = (rect.left-80)+'px';
  }
}

const compositionUpdate = (e: React.CompositionEvent) => {
  const inputWindow = document.getElementById('input-window');
  if (inputWindow instanceof HTMLElement) {
    inputWindow.innerText = e.data;
  }
}

const compositionEnd = (e: React.CompositionEvent) => {
  const inputWindow = document.getElementById('input-window');
  if (inputWindow instanceof HTMLElement) {
    inputWindow.style.display = 'none';
  }
}

const Editor = () => {
  return (
    <React.Fragment>
      <div contentEditable id="edit-area"
        onKeyDown={keyDown}
        onKeyUp={keyUp}
        onPaste={paste}
        onCompositionStart={compositionStart}
        onCompositionUpdate={compositionUpdate}
        onCompositionEnd={compositionEnd}
        onWheel={wheelMove}></div>
      <div id="status-bar">文字数：<span id="charCount">0</span></div>
      <div id="input-window"></div>
      <div id="debug-window"></div>
      <Link to="/">Topに戻る</Link>
    </React.Fragment>
  );
}

export default Editor;