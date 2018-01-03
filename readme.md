[![npm (scoped)](https://img.shields.io/npm/v/@snowcoders/react-dialog.svg)](https://www.npmjs.com/package/@snowcoders/react-dialog) 
[![CircleCI branch](https://img.shields.io/circleci/project/github/snowcoders/react-dialog.svg)](https://circleci.com/gh/snowcoders/react-dialog)

# Use it
`npm install --save @snowcoders/react-dialog` 

# Parent Library
This repository is part of a larger repository called react-ui-base. The core idea behind the library is that the logic and functionality of a component doesn't really change between UI Libraries, only their styling. Given that situation, the goal is to provide highly customizable UI building blocks that UI libraries can use, combine and style however they wish without worrying about the core logic.

We highly recommend visiting the parent library's repository (https://github.com/snowcoders/react-ui-base) to understand general core concepts of versioning, upgrades and the suggested way to override our css. You will also find examples of many of our other components of which you are free to use! 

# This component
This component renders it's children in a HTMLDivElement centered within the entire page. Other features provided by this component:
 - Tabbing within the dialog component will stay within the dialog component
 - Pressing the Escape key will run the onBackgroundClick