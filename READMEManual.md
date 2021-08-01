# README Gen

## Version
1.0.3  

## Description
A node project that prompts user for details then generates a linked, badged and polished README.md file and saves it to the directed local repository checkout

## Badges
![badmath](https://img.shields.io/github/languages/top/nielsenjared/badmath)
Badges aren't necessary, per se, but they demonstrate street cred. Badges let other developers know that you know what you're doing. Check out the badges hosted by [shields.io](https://shields.io/). You may not understand what they all represent now, but you will in time.

## Contents
- [Why](#why)
- [Installation](#installation)
- [Usage](#usage)
- [Credits](#credits)
- [License](#license)

## Why
My mantra is that if it gets done, it gets done well, if it gets done twice, it gets automated. 
This is an automated readme generator and it is designed to save time for all future projects. 
There is a  tradeoff between the level of readme customization, and the promptness of the process. 
Bearing that in mind, some avenues for readme customization have been left unexplored simply to reduce complexity. 
In the process of building this I learned a lot about distinguishing vanity metrics from utility metrics. 
I have added some visual metrics but where possible, I have opted for meaningful design choices over flash.

## License
MIT License
## Usage

1. Make your own project (not packaged), best to use github
2. Run index.js entry point
3. Enter local path of repo
4. Follow user prompts to build README.md file.
5. Prompts - gather options appear in ascending order of privilege

* local repo root path: UserInputAbsolutePath eg "C:\Users\user\Documents\localProjectRepo" Required   
- project title: [readPackage-name], [readOrigin-repoName], userInput  
- project version: [readPackage-version], userInput  
- profile name: [readPackage-author], [readOrigin-ownerProfile], userInput  
- collaborators: [readOrigin-repoContributors], userInput  
- description: [readPackage-description], UserInput    
- license: [readOrigin-license], UserInputChoice  
- project motivation: UserInput 
- installation: UserInput  
- usage: long string  
- credits: UserInput   
- features: UserInput  
- how to contribute: UserInput    
- tests: [readPackage-scripts.test], UserInput

Background collections:
-github repo contributors
-assets/images/screenshot.png
-assets/images/screengrab.gif 

NOTE: if there is a package.json file but any of the readPackage.json commands find an empty value or a clashed value with the origin repo, console alert package.json doesn't match origin repo details


## Installation

1. Install Node.js on your pc
2. Checkout project
3. Run npm install to download dependencies
4. Read project readme for details on repo structure, specifically:
	- screenshot and screengrab files in assets/images/screenshot.png + screencap.gif


## Credits

personal project


## Features
1: Automatic reading of git repo
2: Automatic reading of package.json file
3: Linking of contributors, owner and dependencies to their github and npm repositories
4: Embedding of screenshot and screencap files


## How to Contribute
This is a personal project, it is not accepting pull requests
## Tests
no testing framework has been deployed for this project

## Questions
Contact me through nick.alex.ritchie@gmail.com

