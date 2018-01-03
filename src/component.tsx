import * as React from "react";

import * as classNames from "classnames";

import * as tabbable from "tabbable";
import { Key } from "ts-keycode-enum";

export interface IDialogProps extends React.HTMLAttributes<HTMLDivElement> {
    onBackgroundClick?: () => void;
    isBaseStylesDisabled?: boolean;
    isVisible: boolean;
}

export class Dialog extends React.Component<IDialogProps> {
    private dialogRef: HTMLDivElement;

    componentDidMount() {
        if (this.props.isVisible === true) {
            this.dialogRef.focus();
        }
    }

    componentDidUpdate(oldProps: IDialogProps) {
        // Needed for when the root level element is not animated
        if (this.props.isVisible === true &&
            this.props.isVisible !== oldProps.isVisible) {

            this.dialogRef.scrollTop = 0;
            this.dialogRef.focus();
        }
    }

    render() {
        let { isBaseStylesDisabled, onBackgroundClick, isVisible, className, ...htmlProps } = this.props;
        className = classNames({ "sci-react-dialog": isBaseStylesDisabled !== true }, className, { "visible": this.props.isVisible });

        return (
            <div {...htmlProps} className={className} onAnimationEnd={this.setFocusIfVisible} onTransitionEnd={this.setFocusIfVisible}>
                <div className="overlay" onClick={this.onBackgroundClick}>
                    <div ref={this.setDialogRef} role="dialog" tabIndex={1} className="dialog" onClick={this.onDialogClick} onKeyDown={this.onKeyDown}>
                        {this.props.children}
                    </div>
                </div>
            </div>);
    }

    protected setDialogRef = (ref: HTMLDivElement) => {
        this.dialogRef = ref;
    }

    private setFocusIfVisible = () => {
        // Needed when the root level element is animated
        if (this.props.isVisible === true) {
            this.dialogRef.focus();
        }
    }

    private onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (this.handleEscapeClick(event)) {
            return;
        }
        if (this.handleTabClick(event)) {
            return;
        }
    }

    private handleEscapeClick(event: React.KeyboardEvent<HTMLDivElement>): boolean {
        if (!event.isDefaultPrevented() && event.keyCode &&
            event.keyCode === Key.Escape) {
            event.preventDefault();
            this.onBackgroundClick();
            return true;
        } else {
            return false;
        }
    }
    private handleTabClick(event: React.KeyboardEvent<HTMLDivElement>): boolean {
        if (event.isDefaultPrevented() || event.keyCode == null &&
            event.keyCode !== Key.Tab) {
            return false;
        }

        let tabbableElements = tabbable(this.dialogRef);
        let first = tabbableElements[0];
        let last = tabbableElements[tabbableElements.length - 1];

        if (first === undefined) {
            // This has no tabbable elements, set focus back on the dialog itself
            this.dialogRef.focus();
            event.preventDefault();
        }
        else if (document.activeElement === this.dialogRef || event.target === last && !event.shiftKey) {
            first.focus();
            event.preventDefault();
        } else if (event.target === first && event.shiftKey) {
            last.focus();
            event.preventDefault();
        }

        return true;
    }

    private onDialogClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        this.dialogRef.focus();
    }

    private onBackgroundClick = () => {
        if (this.props.onBackgroundClick) {
            this.props.onBackgroundClick();
        }
    }
}