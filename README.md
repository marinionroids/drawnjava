# 🎮 Lootbox Casino

✨ LIVE PRODUCT

Check it out! -->  [![DRAWNGG.COM](https://img.shields.io/badge/DRAWN-GG-yellow)](https://drawngg.com/)


[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-blueviolet)](https://solana.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-Backend-brightgreen)](https://spring.io/projects/spring-boot)

A next-gen gaming platform combining lootbox mechanics with blockchain technology, built for Solana user authentication wallets.

![Lootbox Casino Banner](https://github.com/user-attachments/assets/da0fca4e-6190-4763-8853-4cb13e28dd99)

## ✨ Features

- **Animated Lootbox System** - Visually stunning lootbox opening experience
- **Solana Blockchain Integration** - Secure transactions via SOLFLARE/PHANTOM wallet connection
- **Spring Boot Backend API** - Robust and scalable backend architecture
- **Real-time Balance Updates** - Instant reflection of winnings in your wallet
- **Responsive Design** - Seamless experience across all devices

## 🚀 Technology Stack

### Frontend
- React.js
- Solana Web3.js
- Material UI

### Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA

### Blockchain
- Solana mainnet-beta
- SOLFLARE/PHANTOM Wallet Integration

### Database
- MYSQL

## 📸 Screenshot Showcase

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/da0fca4e-6190-4763-8853-4cb13e28dd99" alt="Main Interface" width="400"/></td>
    <td><img src="https://github.com/user-attachments/assets/8e76f24e-73a1-41be-afc4-be45a469899b" alt="Lootbox Selection" width="400"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/473f1618-7935-4800-9037-e5102fbfd8ce" alt="Lootbox Opening" width="400"/></td>
    <td><img src="https://github.com/user-attachments/assets/30ee070f-4b2e-47af-81a6-569990073d1f" alt="Rewards Display" width="400"/></td>
  </tr>
</table>


## 📊 API Documentation

Our REST API provides comprehensive endpoints for lootbox operations:

- `GET /api/user` - Get user's information in real time given a JWT token.
- `POST /api/user` - Updates user's information given a JWT token.
- `GET /api/profile` - Get all user's information. (Deposits, Withdrawls, Latest Transactions, Account Analytics).
- `POST /api/auth/verify` - Initial authentication endpoint, verifies the solana wallet integrity by matching the signature, message and wallet's public address.
- `GET /api/auth/verify` - Validates a JWT token to ensure user is still connected.
- `POST /api/auth/code` - Validates a promo code used by the user.
- `POST /api/auth/deposit` - Validates an user deposit by verifying the solana transaction and linking it to the proper user account.
- `POST /api/auth/withdraw` - Handles user's withdrawls given they have proper balance and pre-withdrawl requirements met.



- `GET /api/latestdrops` - Returns the list of the 15 latest transaction on the website.
- `GET /api/lootbox/{lootboxName}/items` - Returns the items of a specific lootbox.
- `GET /api/lootbox/{lootboxName}` - Returns a lootbox information.
- `GET /api/lootbox` - Returns a list of all lootboxes.
- `POST /api/lootbox/open` - Creates a lootbox transaction and opens the lootbox by returning a winning item given the user has proper balance.
- `GET /api/item/{photoName}` - Serves the images to the front end. 


## 🔐 Security Features

- Secure wallet connection using industry-standard protocols
- Transaction signing for all blockchain operations
- Rate limiting to prevent abuse
- Comprehensive logging

## 🛣️ Roadmap

Gamemodes
  - [ ] Add case-battles multiplayer functionality
  - [ ] Add item upgrade functionality

