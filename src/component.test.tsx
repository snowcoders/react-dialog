import * as React from 'react';

import { Dialog, IDialogProps } from "./component";

import { expect } from 'chai';
import { mock, spy } from 'sinon';
import { shallow, configure } from "enzyme";

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

        xit("Click dialog doesn't close", () => {
            let fakeMouseEvent = {
                stopPropagation: () => { }
            };
            let onBackgroundClickSpy = spy();
            defaultProps.onBackgroundClick = onBackgroundClickSpy;

            let wrapper = shallow(<Dialog {...defaultProps} />);
            wrapper.find(".dialog").simulate("click", fakeMouseEvent);
            expect(onBackgroundClickSpy.called).to.be.false;
        });
    });

    describe("Ref required methods", () => {
        let mockRef: any;
        // Since we are setting the focus on mount, we have to set the ref before we start
        class CustomDialog extends Dialog {
            constructor(props) {
                super(props);
                this.setDialogRef(mockRef);
            }
        }

        beforeEach(() => {
            mockRef = {
                focus: spy()
            };
        });

        describe("Focus", () => {
            it("Focus is set on mount if visible is true", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} />, { lifecycleExperimental: true });
                expect(mockRef.focus.calledOnce).to.be.true;
            });

            it("Focus is not set on mount if visible is false", () => {
                let wrapper = shallow(<CustomDialog isVisible={false} />, { lifecycleExperimental: true });
                expect(mockRef.focus.calledOnce).to.be.false;
            });

            it("Focus is set when component starts closed then is visible", () => {
                let wrapper = shallow(<CustomDialog isVisible={false} />, { lifecycleExperimental: true });
                expect(mockRef.focus.calledOnce).to.be.false;
                wrapper.setProps({
                    isVisible: true
                });
                expect(mockRef.focus.calledOnce).to.be.true;
                wrapper.setProps({
                    isVisible: false
                });
                expect(mockRef.focus.calledOnce).to.be.true;
            });

            it("Focus is set when component is done animating", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} />);
                // Even though the focus gets called, the element is animating and may be visibility: hidden.
                // In this case, the focus won't work and we have to call focus after the animation is complete
                expect(mockRef.focus.calledOnce, "1").to.be.true;
                mockRef.focus.reset();
                wrapper.first().props().onAnimationEnd();
                expect(mockRef.focus.calledOnce, "2").to.be.true;
                mockRef.focus.reset();
                wrapper.first().props().onTransitionEnd();
                expect(mockRef.focus.calledOnce, "3").to.be.true;
                mockRef.focus.reset();
            });

            it("Focus is not set when component is done animating but not visible", () => {
                let wrapper = shallow(<CustomDialog isVisible={false} />);
                // Even though the focus gets called, the element is animating and may be visibility: hidden.
                // In this case, the focus won't work and we have to call focus after the animation is complete
                expect(mockRef.focus.calledOnce, "1").to.be.false;
                mockRef.focus.reset();
                wrapper.first().props().onAnimationEnd();
                expect(mockRef.focus.calledOnce, "2").to.be.false;
                mockRef.focus.reset();
                wrapper.first().props().onTransitionEnd();
                expect(mockRef.focus.calledOnce, "3").to.be.false;
                mockRef.focus.reset();
            });
        });

        describe("Keyboarding", () => {
            it("Escape key fires onBackgroundClick", () => {
                let onBackgroundClickSpy = spy();
                defaultProps.onBackgroundClick = onBackgroundClickSpy;

                let wrapper = shallow(<CustomDialog {...defaultProps} isVisible={true} />);
                let tabIndexedElements = wrapper.find("[tabIndex=1]");
                expect(tabIndexedElements).to.have.length(1);
                tabIndexedElements.props().onKeyDown({
                    charCode: Key.Escape,
                    keyCode: Key.Escape,
                    isDefaultPrevented: () => { return false; },
                    preventDefault: () => { }
                } as any);
                expect(onBackgroundClickSpy.calledOnce).to.be.true;
            });
            xit("Tab key moves to next element", () => {
                let wrapper = shallow(<CustomDialog isVisible={true} />);
                let tabIndexedElements = wrapper.find("[tabIndex=1]");
                expect(tabIndexedElements).to.have.length(1);
                tabIndexedElements.props().onKeyDown({
                    charCode: Key.Tab,
                    keyCode: Key.Tab,
                    isDefaultPrevented: () => { return false; },
                } as any);
            });
            xit("Any other key doesn't close", () => {
                let onBackgroundClickSpy = spy();
                defaultProps.onBackgroundClick = onBackgroundClickSpy;

                let wrapper = shallow(<CustomDialog isVisible={true} />);
                let tabIndexedElements = wrapper.find("[tabIndex=1]");
                expect(tabIndexedElements).to.have.length(1);
                tabIndexedElements.props().onKeyDown({
                    charCode: Key.R,
                    keyCode: Key.R,
                    isDefaultPrevented: () => { return false; },
                } as any);

                expect(onBackgroundClickSpy.calledOnce).to.be.false;
            });
        });
    });
});