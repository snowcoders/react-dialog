import * as React from "react";

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
            let htmlElement = this.state.previousElementBeforeOpen;
            if (htmlElement != null && (htmlElement as any).focus != null) {
                (htmlElement as any).focus();
            }
        }
    }

    render() {
        let { isBaseStylesDisabled, onBackgroundClick, isVisible, className, ...htmlProps } = this.props;

        let classNameArray: string[] = [];
        if (isBaseStylesDisabled !== true) {
            classNameArray.push("sci-react-dialog");
        }
        if (className != null) {
            classNameArray.push(className);
        }
        if (this.props.isVisible) {
            classNameArray.push("visible");
        }

        return (
            <div {...htmlProps} className={classNameArray.join(" ")} onAnimationEnd={this.onAnimationEnd} onTransitionEnd={this.onTransitionEnd}>
                <div className="overlay" onClick={this.onBackgroundClick}>
                    <div ref={this.onSetDialogRef} role="dialog" tabIndex={1} className="dialog" onClick={this.onDialogClick} onKeyDown={this.onKeyDown}>
                        {this.props.children}
                    </div>
                </div>
            </div>);
    }

    protected onSetDialogRef = (ref: HTMLDivElement) => {
        this.dialogRef = ref;
    }

    private onAnimationEnd = (event: React.AnimationEvent<HTMLDivElement>) => {
        if (this.props.onAnimationEnd != null) {
            this.props.onAnimationEnd(event);
            if (event.isDefaultPrevented()) {
                return;
            }
        }
        this.setFocusIfVisible();
    }

    private onTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
        if (this.props.onTransitionEnd != null) {
            this.props.onTransitionEnd(event);
            if (event.isDefaultPrevented()) {
                return;
            }
        }
        this.setFocusIfVisible();
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

    private onDialogClick = (event: React.MouseEvent<HTMLDivElement>) => {
        // event.preventDefault();
        event.stopPropagation();
    }

    private onBackgroundClick = (event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
        if (this.props.onBackgroundClick) {
            this.props.onBackgroundClick(event);
        }
    }

    private handleEscapeClick(event: React.KeyboardEvent<HTMLDivElement>): boolean {
        if (event.isDefaultPrevented() || event.keyCode !== Key.Escape) {
            return false;
        }

        event.preventDefault();
        event.stopPropagation();
        this.onBackgroundClick(event);
        return true;
    }

    private handleTabClick(event: React.KeyboardEvent<HTMLDivElement>): boolean {
        if (event.isDefaultPrevented() || event.keyCode !== Key.Tab) {
            return false;
        }

        let tabbableElements = tabbable(this.dialogRef);
        let first = tabbableElements[0];
        let last = tabbableElements[tabbableElements.length - 1];

        if (first === undefined) {
            // This has no tabbable elements, set focus back on the dialog itself
            this.dialogRef.focus();
            event.preventDefault();
        } else if ((document.activeElement === this.dialogRef || document.activeElement === last) && !event.shiftKey) {
            first.focus();
            event.preventDefault();
        } else if ((document.activeElement === this.dialogRef || document.activeElement === first) && event.shiftKey) {
            last.focus();
            event.preventDefault();
        }

        return true;
    }

    // Needed when the root level element is animated
    private setFocusIfVisible() {
        if (this.props.isVisible === false) {
            // If we aren't visible, no need to set focus
            return;
        }
        if (this.dialogRef.contains(document.activeElement)) {
            // If we are focused on a subchild, no need to change focus
            return;
        }
        this.dialogRef.focus();
    }
}