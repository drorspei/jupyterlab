// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Panel
} from 'phosphor-panel';

import {
  Widget
} from 'phosphor-widget';

import {
  NotebookToolbar, ToolbarButton
} from '../notebook/notebook/toolbar';


/**
 * The class name added to inspector widgets.
 */
const INSPECTOR_CLASS = 'jp-ConsoleInspector';


/**
 * The class name added to inspector widgets.
 */
const CHILD_CLASS = 'jp-ConsoleInspector-child';


/**
 * The back button class name.
 */
const BACK_CLASS = 'jp-ConsoleInspector-back';

/**
 * The forward button class name.
 */
const FORWARD_CLASS = 'jp-ConsoleInspector-forward';


/**
 * An inspector widget for a console.
 */
export
class ConsoleInspector extends Panel {
  /**
   * Construct a console inspector widget.
   */
  constructor() {
    super();
    this.addClass(INSPECTOR_CLASS);
  }

  /**
   * The text of the inspector.
   */
  get content(): Widget {
    return this._content;
  }
  set content(newValue: Widget) {
    if (newValue === this._content) {
      return;
    }
    if (this._content) {
      if (this._remember) {
        this._content.hide();
      } else {
        this._content.dispose();
      }
    }
    this._content = newValue;
    if (this._content) {
      this._content.addClass(CHILD_CLASS);
      this.addChild(this._content);
      if (this.remember) {
        this._history.push(newValue);
        this._index++;
      }
    }
  }

  /**
   * A flag that indicates whether the inspector remembers history.
   */
  get remember(): boolean {
    return this._remember;
  }
  set remember(newValue: boolean) {
    if (newValue === this._remember) {
      return;
    }
    this._remember = newValue;
    if (!this._remember) {
      this._toolbar.dispose();
      this._history.forEach(widget => widget.dispose());
      this._history = null;
    } else {
      this._toolbar = this._createToolbar();
      this._history = [];
      this._index = -1;
      this.insertChild(0, this._toolbar);
    }
  }

  /**
   * The display rank of the inspector.
   */
  get rank(): number {
    return this._rank;
  }
  set rank(newValue: number) {
    this._rank = newValue;
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    if (this._history) {
      this._history.forEach(widget => widget.dispose());
      this._history = null;
    }
    if (this._toolbar) {
      this._toolbar.dispose();
    }
    super.dispose();
  }

  /**
   * Navigate back in history.
   */
  private _back(): void {
    if (this._history.length) {
      this._navigateTo(Math.max(this._index - 1, 0));
    }
  }

  /**
   * Navigate forward in history.
   */
  private _forward(): void {
    if (this._history.length) {
      this._navigateTo(Math.min(this._index + 1, this._history.length - 1));
    }
  }

  /**
   * Create a history toolbar.
   */
  private _createToolbar(): NotebookToolbar {
    let toolbar = new NotebookToolbar();
    let back = new ToolbarButton({
      className: BACK_CLASS,
      onClick: () => this._back(),
      tooltip: 'Navigate back in history'
    });
    toolbar.add('back', back);

    let forward = new ToolbarButton({
      className: FORWARD_CLASS,
      onClick: () => this._forward(),
      tooltip: 'Navigate forward in history'
    });
    toolbar.add('forward', forward);

    return toolbar;
  }

  /**
   * Navigate to a known index in history.
   */
  private _navigateTo(index: number): void {
    if (this._content) {
      this._content.hide();
    }
    this._content = this._history[index];
    this._index = index;
    this._content.show();
  }

  private _content: Widget = null;
  private _history: Widget[] = null;
  private _index: number = -1;
  private _rank: number = Infinity;
  private _remember: boolean = false;
  private _toolbar: NotebookToolbar = null;
}
