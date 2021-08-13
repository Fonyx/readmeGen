# Project: [Readme Generator](https://github.com/Fonyx/readmeGen)

## Version

1.0.0  

![badmath](https://img.shields.io/github/license/Fonyx/readmeGen)  ![badmath](https://img.shields.io/github/languages/count/Fonyx/readmeGen)  ![badmath](https://img.shields.io/github/commit-activity/m/Fonyx/readmeGen)  ![badmath](https://img.shields.io/github/contributors/Fonyx/readmeGen)  

## Description

My mantra is that if it gets done, it gets done well, if it gets done twice, it gets automated. 
This is an automated readme generator and it is designed to save time for all future projects. 
There is a  tradeoff between the level of readme customization, and the promptness of the process. 
Bearing that in mind, some avenues for readme customization have been left unexplored simply to reduce complexity. 
In the process of building this I learned a lot about distinguishing vanity metrics from utility metrics. 
I have added some visual metrics but where possible, I have opted for meaningful design choices over flash.  

![Alt text](https://github.com/Fonyx/readmeGen/blob/main/assets/images/show.gif?raw=true "project show gif")  

## License

MIT License  

### Details  

```A short and simple permissive license with conditions only requiring preservation of copyright and license notices. Licensed works, modifications, and larger works may be distributed under different terms and without source code.  ```

### Permissions  

```commercial-use,modifications,distribution,private-use  ```

## Content 

- [Dependencies](#dependencies)
- [Usage](#usage)
- [Video](#video)
- [Contributors](#contributors)
- [Installation](#installation)
- [Credits](#credits)
- [Features](#features)
- [Contributing](#contributing)
- [Testing](#testing)
- [Questions](#questions)




## Dependencies  

[inquirer:^6.3.1](https://www.npmjs.com/package/inquirer)

[markdown-it:^12.1.0](https://www.npmjs.com/package/markdown-it)

[node-fetch:^2.6.1](https://www.npmjs.com/package/node-fetch)

[pretty-error:^3.0.4](https://www.npmjs.com/package/pretty-error)



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
-assets/images/show.gif
-assets/images/usage.gif 

NOTE: if there is a package.json file but any of the readPackage.json commands find an empty value or a 
clashed value with the origin repo, console alert package.json doesn't match origin repo details

INSTRUCTIONAL VIDEO @: https://drive.google.com/file/d/1Th4-WoSvNLdysLZoimyHP-8BbZNwaA7S/view   
backup: https://drive.google.com/file/d/1ID5mpRL1XC7LNLoeJ5dcRSGoojVUEL8W/view?usp=sharing  


## Video

![Screenshot](https://github.com/Fonyx/readmeGen/blob/main/assets/images/usage.gif?raw=true "usage screencap")  

## Contributors 

[Fonyx](https://github.com/Fonyx)

## Installation

1. Install Node.js on your pc
2. Checkout project
3. Run npm install to download dependencies
4. Read project readme for details on repo structure, specifically:
	- show and usage screengrab gif files in assets/images/show.gif + usage.gif
  

## Credits

Personal Project, no specific credits  

## Features

1: Automatic reading of git repo
2: Automatic reading of package.json file
3: Linking of contributors, owner and dependencies to their github and npm repositories
4: Embedding of gif files for show and usage
5: Synchronize local package file with repository details  

## Contributing

This is a personal project, it is not accepting pull requests
  

## Testing

no testing framework has been deployed for this project
  

## Questions

Contact me through nick.alex.ritchie@gmail.com
  



## Checkout my github account [Fonyx](https://github.com/Fonyx)



