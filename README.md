# README Gen
## Description
A node project that prompts user for details then generates a linked, badged and polished README.md file and saves it to the directed local repository checkout

## Why Tho?
My mantra is that if it gets done, it gets done well, if it gets done twice, it gets automated. This is said automation and it is designed to save time for all future projects. There is a  tradeoff between the level of readme customization, and the promptness of the process. Bearing that in mind, some avenues for readme customization have been left unexplored simply to reduce complexity. In the process of building this I learned a lot about distinguishing vanity metrics from utility metrics. I have added some visual metrics but where possible, I have opted for meaningful design choices over flash.

## Contents
- [Installation](#installation)
- [Usage](#usage)
- [Credits](#credits)
- [License](#license)
## Installation
#### 1. Make your own project (not packaged)
#### 2. Checkout project and install node.js
#### 3. Run npm install to download dependencies 

## Dependencies
### inquirer : https://www.npmjs.com/package/inquirer 
### git-repo-name : https://www.npmjs.com/package/git-repo-name
### read-pkg : https://www.npmjs.com/package/read-pkg 
## Usage
### 1. Run index.js entry point
### 2. Follow user prompts to build README.md file. Note you will need the local repository path  
### 3. Prompts: 
- local repo root path: absolute path eg "C:\Users\user\Documents\localProjectRepo"  
We use this path to output the file and to read and verify project paths for resources (such as screenshots and package.json)  
- readOrigin: [y/n]  
y(yes) case derives the following from the origin repo  
project title, profile (repo owner), collaborators  
-- NOTE: this only works for public repository's - otherwise it user will have to manually fill these in
- readPackage: [y/n]  
y(yes) case derives the following from the package.json file
Description, license, dependencies  
### Manual mode prompts - descending order of privilege 
- project title: string, [readOrigin], [readPackage]  
- profile name: string, [readOrigin], [readPackage]  
- description: Long string, [readPackage] 
- project motivation: Long string  
- installation: Long string  
- dependencies: csv string or [readPackage]  
- usage: long string  
- screencapGif: relative path to gif
<!-- https://docs.github.com/en/rest/reference/repos#list-repository-contributors -->
- collaborators: 'string1, string2, string3", [readOrigin]  
- credits: "string1, string2, string3"  
- license: "str" choice from license list, [readPackage]  
- features: "long string"  
- how to contribute: "long string"  
- tests: "long string"  


<!-- ![alt text](assets/images/usageScreencap.gif); -->

## Credits
List your collaborators, if any, with links to their GitHub profiles.
If you used any third-party assets that require attribution, list the creators with links to their primary web presence in this section.
If you followed tutorials, include links to those here as well.
## License
The last section of a high-quality README file is the license. This lets other developers know what they can and cannot do with your project. If you need help choosing a license, refer to [https://choosealicense.com/](https://choosealicense.com/).
---
🏆 The previous sections are the bare minimum, and your project will ultimately determine the content of this document. You might also want to consider adding the following sections.
## Badges
![badmath](https://img.shields.io/github/languages/top/nielsenjared/badmath)
Badges aren't necessary, per se, but they demonstrate street cred. Badges let other developers know that you know what you're doing. Check out the badges hosted by [shields.io](https://shields.io/). You may not understand what they all represent now, but you will in time.
## Features
If your project has a lot of features, list them here.
## How to Contribute
If you created an application or package and would like other developers to contribute it, you can include guidelines for how to do so. The [Contributor Covenant](https://www.contributor-covenant.org/) is an industry standard, but you can always write your own if you'd prefer.
## Tests
Go the extra mile and write tests for your application. Then provide examples on how to run them here.
