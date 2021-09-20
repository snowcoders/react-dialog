# Deprecation

The majority of what this library provided was a "focus trap" where when the user tabbed in the dialog the focus would stay inside the dialog while the user is tabbing. However modern HTML Dialogs already do this so this package is now obsolete. For more information along with polyfills you might need see https://developer.mozilla.org/en-US/docs/web/html/element/dialog.

[![npm (scoped)](https://img.shields.io/npm/v/@snowcoders/react-dialog.svg)](https://www.npmjs.com/package/@snowcoders/react-dialog)
[![CircleCI branch](https://img.shields.io/circleci/project/github/snowcoders/react-dialog.svg)](https://circleci.com/gh/snowcoders/react-dialog)

# Use it

`npm install --save @snowcoders/react-dialog save-prefix ~`

# Parent Library

This component is part of a larger components library, [react-ui-base](https://github.com/snowcoders/react-ui-base). The goal is to keep all the core logic and base css styles in a single location, that way building out new UI component libraries cheaper and faster (and less buggy).

We highly recommend visiting the react-ui-base repository to understand how to customize the css along with see examples.

You can also view all the components on our demo site https://snowcoders.github.io/react-ui-base/

# This component

This component renders it's children in a HTMLDivElement centered within the entire page. Other features provided by this component:

- Tabbing within the dialog component will stay within the dialog component
- Clicking the background will fire onBackgroundClick allowing you to close the dialog
- Pressing the Escape key will also run the onBackgroundClick
- When the dialog closes, it will set the active element back to whatever it was before it opened
