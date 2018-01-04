import * as React from "react";

import * as classNames from "classnames";

import * as tabbable from "tabbable";
import { Key } from "ts-keycode-enum";

export interface IDialogProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Called before the default onKeyDown handlers are invoked.
     * @returns true if the key down event was handled and further key down events should not be handled
     */
    onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => boolean;
    /**
     * Executed whenever the user presses Escape or clicks the background
     */
    onBackgroundClick?: (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => void;
    /**
     * If the base styles should be disabled (though if the base styles don't work for you, we'd love to know why!)
     */
    isBaseStylesDisabled?: boolean;
    /**
     * If the dialog is currently visible or not. The dialog component should always be mounted (so that animations work).
     * If you dismount the component before the animation finishes, the exit animation will likely look like it has not run.
     */
    isVisible: boolean;
}

export interface IDialogState {
    previousElementBeforeOpen: Element;
}

export class Dialog extends React.Component<IDialogProps, IDialogState> {
    private dialogRef: HTMLDivElement;

    componentDidMount() {
        if (this.props.isVisible === true) {
            this.setState({
                previousElementBeforeOpen: document.activeElement
            });
            this.dialogRef.focus();
        }
    }

    componentDidUpdate(oldProps: IDialogProps) {
        if (this.props.isVisible === true &&
            this.props.isVisible !== oldProps.isVisible) {
            // The dialog is going from not visible to visible
            this.dialogRef.scrollTop = 0;
            this.setState({
                previousElementBeforeOpen: document.activeElement
            });
            this.dialogRef.focus();
        } else if (this.props.isVisible === false &&
            this.props.isVisible !== oldProps.isVisible) {
            // The dialog is going from visible to not visible
            let htmlElement = this.state.previousElementBeforeOpen as HTMLElement;
            if (htmlElement != null && htmlElement.focus) {
                htmlElement.focus();
            }
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
        if (this.props.onKeyDown != null && this.props.onKeyDown(event)) {
            return;
        }
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
            this.onBackgroundClick(event);
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

    private onBackgroundClick = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
        if (this.props.onBackgroundClick) {
            this.props.onBackgroundClick(event);
        }
    }
}