import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Dialog, IDialogProps } from "./component";

import { expect } from 'chai';
import { mock, spy } from 'sinon';
import { shallow, ShallowWrapper, mount, configure, ReactWrapper } from "enzyme";

import { Key } from 'ts-keycode-enum';

// Configure enzyme
import * as Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });

describe("Dialog", () => {
    let defaultProps: IDialogProps;
    beforeEach(() => {
        defaultProps = {
            isVisible: false
        };
    });

    it("Render", () => {
        let wrapper = shallow(<Dialog {...defaultProps} />);
        expect(wrapper).to.have.length(1);
    });

    describe("Classname", () => {
        it("Default has classname", () => {
            let wrapper = shallow(<Dialog {...defaultProps} />);
            let rootElement = wrapper.first();
            expect(rootElement.props().className).to.contain('sci-react-dialog');
        });

        it("Disable style has no classname", () => {
            let wrapper = shallow(<Dialog {...defaultProps} className="blue" isBaseStylesDisabled={true} />);
            let rootElement = wrapper.first();
            expect(rootElement.props().className).to.not.contain('sci-react-dialog');
        });

        it("Class name override", () => {
            let wrapper = shallow(<Dialog {...defaultProps} className="blue" />);
            let rootElement = wrapper.first();
            expect(rootElement.props().className).to.contain('sci-react-dialog');
            expect(rootElement.props().className).to.contain('blue');
        });
    });

    describe("Click", () => {
        it("Click background", () => {
            let onBackgroundClickSpy = spy();
            defaultProps.onBackgroundClick = onBackgroundClickSpy;

            let wrapper = shallow(<Dialog {...defaultProps} />);
            wrapper.find(".overlay").simulate("click");
            expect(onBackgroundClickSpy.calledOnce).to.be.true;
        });

        it("Click background with no callback", () => {
            expect(() => {
                let wrapper = shallow(<Dialog {...defaultProps} />);
                wrapper.find(".overlay").simulate("click");
            }).to.not.throw();
        });

        it("Click dialog doesn't close", () => {
            let onBackgroundClickSpy = spy();
            defaultProps.onBackgroundClick = onBackgroundClickSpy;

            let wrapper = mount(<Dialog {...defaultProps} />);
            wrapper.find(".dialog").simulate("click");
            expect(onBackgroundClickSpy.called).to.be.false;
        });
    });

    it("Focus is not set if active element is child", () => {
        let focusSpy: sinon.SinonSpy = spy();
        // Since we are setting the focus on mount, we have to set the ref before we start
        class CustomDialog extends Dialog {
            constructor(props) {
                super(props);
                this.onSetDialogRef({
                    focus: focusSpy,
                    contains: () => { return true; }
                } as any);
            }
        }

        let wrapper = shallow(<CustomDialog isVisible={true} onTransitionEnd={() => { }} />);
        focusSpy.reset();
        wrapper.find(".sci-react-dialog").props().onTransitionEnd({
            isDefaultPrevented: () => { return false; }
        } as any);

        expect(focusSpy.called).to.be.false;
    });

    describe("Ref required methods", () => {
        let focusSpy: sinon.SinonSpy = spy();
        // Since we are setting the focus on mount, we have to set the ref before we start
        class CustomDialog extends Dialog {
            constructor(props) {
                super(props);
                this.onSetDialogRef({
                    focus: focusSpy,
                    contains: () => { return false; }
                } as any);
            }
        }

        beforeEach(() => {
            focusSpy.reset();
        });

        afterEach(() => {
            focusSpy.reset();
        });

        describe("Focus", () => {
            it("Focus is set on mount if visible is true", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} />, { lifecycleExperimental: true });
                expect(focusSpy.calledOnce).to.be.true;
            });

            it("Focus is not set on mount if visible is false", () => {
                let wrapper = shallow(<CustomDialog isVisible={false} />, { lifecycleExperimental: true });
                expect(focusSpy.called).to.be.false;
            });

            it("Focus is set when component starts closed then is visible", () => {
                let wrapper = shallow(<CustomDialog isVisible={false} />, { lifecycleExperimental: true });
                expect(focusSpy.called).to.be.false;
                focusSpy.reset();
                wrapper.setProps({
                    isVisible: true
                });
                expect(focusSpy.called).to.be.true;
                focusSpy.reset();
                wrapper.setProps({
                    isVisible: false
                });
                expect(focusSpy.called).to.be.false;
            });
            it("Focus is set when component is done animating", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} />);
                // Even though the focus gets called, the element is animating and may be visibility: hidden.
                // In this case, the focus won't work and we have to call focus after the animation is complete
                expect(focusSpy.calledOnce, "1").to.be.true;
                focusSpy.reset();
                wrapper.first().props().onAnimationEnd();
                expect(focusSpy.calledOnce, "2").to.be.true;
                focusSpy.reset();
                wrapper.first().props().onTransitionEnd();
                expect(focusSpy.calledOnce, "3").to.be.true;
                focusSpy.reset();
            });

            it("Focus is not set when component is done animating but not visible", () => {
                let wrapper = shallow(<CustomDialog isVisible={false} />);
                // Even though the focus gets called, the element is animating and may be visibility: hidden.
                // In this case, the focus won't work and we have to call focus after the animation is complete
                expect(focusSpy.calledOnce, "1").to.be.false;
                focusSpy.reset();
                wrapper.first().props().onAnimationEnd();
                expect(focusSpy.calledOnce, "2").to.be.false;
                focusSpy.reset();
                wrapper.first().props().onTransitionEnd();
                expect(focusSpy.calledOnce, "3").to.be.false;
                focusSpy.reset();
            });

            it("Focus is set on original element after close", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} />);
                focusSpy.reset();

                // Set the state to something that doesn't have a focus method
                wrapper.setState({
                    previousElementBeforeOpen: {
                        focus: undefined
                    }
                });

                expect(() => {
                    wrapper.setProps({
                        isVisible: false
                    })
                }).to.not.throw();
            });

            it("Focus is set after animation is complete", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} onAnimationEnd={() => { }} />);
                focusSpy.reset();

                wrapper.find(".sci-react-dialog").props().onAnimationEnd({
                    isDefaultPrevented: () => { return false; }
                } as any);
                expect(focusSpy.calledOnce).to.be.true;
            });

            it("Focus is not set if animation is prevented", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} onAnimationEnd={() => { }} />);
                focusSpy.reset();

                wrapper.find(".sci-react-dialog").props().onAnimationEnd({
                    isDefaultPrevented: () => { return true; }
                } as any);
                expect(focusSpy.calledOnce).to.be.false;
            });

            it("Focus is set after transition is complete", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} onTransitionEnd={() => { }} />);
                focusSpy.reset();

                wrapper.find(".sci-react-dialog").props().onTransitionEnd({
                    isDefaultPrevented: () => { return false; }
                } as any);
                expect(focusSpy.calledOnce).to.be.true;
            });

            it("Focus is not set if transition is prevented", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} onTransitionEnd={() => { }} />);
                focusSpy.reset();

                wrapper.find(".sci-react-dialog").props().onTransitionEnd({
                    isDefaultPrevented: () => { return true; }
                } as any);
                expect(focusSpy.calledOnce).to.be.false;
            });
        });

        describe("Keyboarding", () => {
            let tabFunction: (dialog: ShallowWrapper<any, any> | ReactWrapper<any, any>, key: Key, isShift?: boolean) => void;

            before(() => {
                tabFunction = (dialog: ShallowWrapper<any, any> | ReactWrapper<any, any>, key: Key, isShift: boolean = false) => {
                    let tabIndexedElements = dialog.find("[tabIndex=1]").first();
                    tabIndexedElements.props().onKeyDown({
                        charCode: key,
                        keyCode: key,
                        shiftKey: isShift,
                        isDefaultPrevented: () => { return false; },
                        stopPropagation: () => { },
                        preventDefault: () => { }
                    } as any);
                }
            });
            it("Escape key fires onBackgroundClick", () => {
                let onBackgroundClickSpy = spy();
                defaultProps.onBackgroundClick = onBackgroundClickSpy;

                let wrapper = shallow(<CustomDialog {...defaultProps} isVisible={true} />);
                tabFunction(wrapper, Key.Escape);
                expect(onBackgroundClickSpy.calledOnce).to.be.true;
            });
            it("Tab key stays on dialog when no children elements", () => {
                let wrapper = mount(<Dialog isVisible={true} />);
                let oldActive = document.activeElement;

                tabFunction(wrapper, Key.Tab);

                let newActive = document.activeElement;
                expect(newActive).to.equal(oldActive);
            });
            it("Tab key stays moves between elements when tabbing forward", () => {
                let wrapper = mount(<Dialog isVisible={true}>
                    <input className="a" type="text" />
                    <input className="b" type="text" />
                </Dialog>);

                let oldActive: HTMLElement;
                let newActive: HTMLElement;

                // First time running, old active should be the dialog
                oldActive = document.activeElement as HTMLElement;
                tabFunction(wrapper, Key.Tab);
                newActive = document.activeElement as HTMLElement;
                expect(oldActive.className).to.contain("dialog");
                expect(newActive.className).to.equal("a");

                // And from now on we should always be inside the dialog
                for (let x = 0; x < 4; x++) {
                    // Second time old should be a, new should be b
                    oldActive = document.activeElement as HTMLElement;
                    tabFunction(wrapper, Key.Tab);
                    (wrapper.find(".b").getDOMNode() as HTMLElement).focus(); // Since we're finding it hard to actually perform a real user tab, just fake the focus
                    newActive = document.activeElement as HTMLElement;
                    expect(oldActive.className, "1").to.equal("a");
                    expect(newActive.className, "2").to.equal("b");

                    // Now they switch
                    oldActive = document.activeElement as HTMLElement;
                    tabFunction(wrapper, Key.Tab);
                    newActive = document.activeElement as HTMLElement;
                    expect(oldActive.className, "3").to.equal("b");
                    expect(newActive.className, "4").to.equal("a");
                }
            });
            it("Tab key stays moves between elements when tabbing backward", () => {
                let wrapper = mount(<Dialog isVisible={true}>
                    <input className="a" type="text" />
                    <input className="b" type="text" />
                </Dialog>);

                let oldActive: HTMLElement;
                let newActive: HTMLElement;

                // First time running, old active should be the dialog
                oldActive = document.activeElement as HTMLElement;
                tabFunction(wrapper, Key.Tab, true);
                newActive = document.activeElement as HTMLElement;
                expect(oldActive.className).to.contain("dialog");
                expect(newActive.className).to.equal("b");

                // And from now on we should always be inside the dialog
                for (let x = 0; x < 4; x++) {
                    // Second time old should be b, new should be a
                    oldActive = document.activeElement as HTMLElement;
                    tabFunction(wrapper, Key.Tab, true);
                    (wrapper.find(".a").getDOMNode() as HTMLElement).focus(); // Since we're finding it hard to actually perform a real user tab, just fake the focus
                    newActive = document.activeElement as HTMLElement;
                    expect(oldActive.className, "1").to.equal("b");
                    expect(newActive.className, "2").to.equal("a");

                    // Now they switch
                    oldActive = document.activeElement as HTMLElement;
                    tabFunction(wrapper, Key.Tab, true);
                    newActive = document.activeElement as HTMLElement;
                    expect(oldActive.className, "3").to.equal("a");
                    expect(newActive.className, "4").to.equal("b");
                }
            });
            it("Any other key doesn't close", () => {
                let onBackgroundClickSpy = spy();
                defaultProps.onBackgroundClick = onBackgroundClickSpy;

                let wrapper = mount(<Dialog isVisible={true} />);
                let tabIndexedElements = wrapper.find("[tabIndex=1]");
                expect(tabIndexedElements).to.have.length(1);
                tabFunction(wrapper, Key.R);

                expect(onBackgroundClickSpy.calledOnce).to.be.false;
            });
            it("Overriding onKeyDown means escape isn't called", () => {
                let onBackgroundClickSpy = spy();
                defaultProps.onBackgroundClick = onBackgroundClickSpy;

                let wrapper = mount(<Dialog isVisible={true} onKeyDown={() => { return true; }} />);
                let tabIndexedElements = wrapper.find("[tabIndex=1]");
                expect(tabIndexedElements).to.have.length(1);
                tabFunction(wrapper, Key.Escape);

                expect(onBackgroundClickSpy.calledOnce).to.be.false;
            });
        });
    });
});