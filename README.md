# Web3 Course Marketplace

VISIT PROJECT WEBPAGE: https://web3-course-marketplace.vercel.app/

---

![Imgur](https://i.imgur.com/HSrQNVi.png)

> Rinkeby Testnet Course Marketplace

---

## Table of Contents

- [Description](#description)

- [How To Use](#how-to-use)

- [Installation](#installation)

- [References](#references)

- [Author Info](#author-info)

---

## Description

This project is a Web3 test marketplace deployed on the Rinkeby test network on the Ethereum blockchain. It showcases a list of courses which are available for purchase at a cost of $15 USD each (paid in its correspondent value in ETH).
IMPORTANT NOTE: The content of the course is not available since it is the result of a project meant for web3 develop learning purposes only.

## Technologies used:

- Solidity
- Truffle
- Ganache
- Web3.js
- Next JS
- Tailwind
- Infura endpoint
- Ethereum blockchain

[Back To The Top](#web3-course-marketplace)

---

## How To Use

For interaction with the project, the users must have a wallet connected to the browser, and some test ETH if you want to purchase a course\*. Metamask was the wallet used for development and testing of this course marketplace.

\* You can get Rinkeby test ETH [HERE](https://faucets.chain.link/rinkeby)

1.- Log in with your Metamask account and make sure that:

&nbsp; &nbsp; &nbsp; a) You are on the Rinkeby Test Network, and

![Imgur](https://i.imgur.com/L45pKPm.png)

&nbsp; &nbsp; &nbsp; b) You have connected your account to the Dapplication by clicking the "Connect" button.

![Imgur](https://i.imgur.com/MuwUoPG.png)

2.- You can freely browse the page, and go to the Marketplace tab to purchase a course you're interested in.

![Imgur](https://i.imgur.com/HSrQNVi.png)

3.- Once you found the course you're looking for, click on the "Purchase" button and submit your email address. If you want to, you can increase the amount of ETH willing to spend for the course.

![Imgur](https://i.imgur.com/KhSkfIp.png)

![Imgur](https://i.imgur.com/k1iMTIX.png)

After purchasing, the course will be in a "Pending" state.

![Imgur](https://i.imgur.com/e6OMdxz.png)

4.- For activating the course, you must send the proof generated for the course (with the Keccak256 hashing function) from the email address used for the purchase to the email address specified on the message on the course page.

![Imgur](https://i.imgur.com/hnk34HT.png)

For the activation, the marketplace administrator will verify that the email address and the proof generated at the moment of purchase match. If they do, the course will be immediately activated. If they don't the course will be in a "Deactivated" state and the buyer of the course must "repurchase" the course (paying only the gas fees), and proceed with the verification process once again.

![Imgur](https://i.imgur.com/xlhQxqW.png)

![Imgur](https://i.imgur.com/nk81qQy.png)

![Imgur](https://i.imgur.com/v2kuBKV.png)

5.- Once activated, the courses are permanently owned by the user's address.

![Imgur](https://i.imgur.com/ZwOfVZQ.png)

<!-- IMAGE HERE -->

[Back To The Top](#web3-course-marketplace)

## Installation

- For testing this application on a local environment, you will need to clone this repository and run the following commands on the root folder for installing dependencies and running the local server:

```bash
npm i
npm run dev
```

- For creating a build production of the project, you may run the command

```bash
npm build
```

## References

This project is the result of the content of Udemy's [Solidity & Ethereum in React (Next JS): The Complete Guide](https://www.udemy.com/course/solidity-ethereum-in-react-next-js-the-complete-guide/) course.

[Back To The Top](#web3-course-marketplace)

---

## Author Info

- Twitter - [@juanxavier](https://twitter.com/juanxavier)
- LinkedIn - [juanxaviervalverde](https://www.linkedin.com/in/juanxaviervalverde/)

[Back To The Top](#web3-course-marketplace)
