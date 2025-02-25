// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AiFightBetting is ReentrancyGuard, Ownable {
    
    struct Bet {
        address bettor;
        uint256 amount;
    }
    
    struct Fight {
        address roomCreator;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isFinalized;
        uint8 winner;
        uint256 totalPool;
        uint256 betAmountBot1;
        uint256 betAmountBot2;
        Bet[] betsPersonality1;
        Bet[] betsPersonality2;
    }

    constructor(uint256 _duration) Ownable(msg.sender) {
         //fightId = keccak256(abi.encodePacked(block.timestamp, msg.sender));
        require(!currentFight.isActive, "Fight already exists");
        
        
        require(!currentFight.isActive, "Fight already exists");

        currentFight.roomCreator = msg.sender;
        currentFight.startTime = block.timestamp + (1 minutes);
        currentFight.endTime = block.timestamp + (_duration * 1 minutes);
        currentFight.isActive = true;
        currentFight.isFinalized = false;
        currentFight.winner = 0;
        currentFight.totalPool = 0;
        currentFight.betAmountBot1 = 0;
        currentFight.betAmountBot2 = 0;

        // No need to initialize dynamic struct arrays explicitly

        emit FightCreated(address(this), msg.sender, currentFight.startTime, currentFight.endTime);
    }
    
    Fight public currentFight;
    uint256 public constant MIN_BET_AMOUNT = 0.01 ether;
    uint256 public constant PLATFORM_FEE = 2; // 2%
    uint256 public platformFeesAccumulated;
    address platformAddress = address(0x34040646ba5166C6Df72Eb82d754AcF9EaCe5724);
    
    event FightCreated(address deployed_address, address indexed creator, uint256 startTime, uint256 endTime);
    event BetPlaced(address indexed bettor, uint256 amount, uint8 personality);
    event FightFinalized( uint8 winner, uint256 totalPool);
    event UserPaid(address indexed bettor, uint256 amount);

   

    function placeBet(uint8 personality) external payable nonReentrant {
        require(msg.value >= MIN_BET_AMOUNT, "Bet amount too low");
        require(personality == 1 || personality == 2, "Invalid personality");
        
        Fight storage fight = currentFight;
        require(fight.isActive, "Fight not active");
        require(!fight.isFinalized, "Fight already finalized");
        require(block.timestamp < fight.endTime, "Betting period ended");
        
        if (personality == 1) {
            fight.betsPersonality1.push(Bet(msg.sender, msg.value));
            fight.betAmountBot1 += msg.value;
        } else {
            fight.betsPersonality2.push(Bet(msg.sender, msg.value));
            fight.betAmountBot2 += msg.value;
        }
        
        fight.totalPool += msg.value;
        emit BetPlaced( msg.sender, msg.value, personality);
    }

    function finalizeFight( uint8 winningPersonality) external onlyOwner {
        Fight storage fight = currentFight;
        require(fight.isActive, "Fight not active");
        require(!fight.isFinalized, "Fight already finalized");
        require(block.timestamp >= fight.endTime, "Fight not ended");
        require(winningPersonality == 1 || winningPersonality == 2, "Invalid personality");

        fight.isFinalized = true;
        fight.winner = winningPersonality;
        fight.isActive = false;
        
        emit FightFinalized( winningPersonality, fight.totalPool);
        claimWinnings();
    }

    function claimWinnings() internal nonReentrant {
        Fight storage fight = currentFight;
        require(fight.isFinalized, "Fight not finalized");

        uint256 totalWinningBets = (fight.winner == 1) ? fight.betAmountBot1 : fight.betAmountBot2;
        require(totalWinningBets > 0, "No bets on winning side");

        uint256 totalLosingBets = fight.totalPool - totalWinningBets;
        uint256 roomCreatorFee = (totalLosingBets * 5) / 100;
        uint256 platformFee = (totalLosingBets * PLATFORM_FEE) / 100;
        uint256 payoutPool = fight.totalPool - platformFee - roomCreatorFee;
        
        platformFeesAccumulated += platformFee;
        (bool creatorPaid, ) = fight.roomCreator.call{value: roomCreatorFee}("");
        require(creatorPaid, "Room creator fee transfer failed");
        
        Bet[] storage winningBets = (fight.winner == 1) ? fight.betsPersonality1 : fight.betsPersonality2;
        
        for (uint256 i = 0; i < winningBets.length; i++) {
            uint256 reward = (winningBets[i].amount * payoutPool) / totalWinningBets;
            (bool success, ) = winningBets[i].bettor.call{value: reward}("");
            require(success, "Transfer failed");
            winningBets[i].amount = 0;
            emit UserPaid( winningBets[i].bettor, reward);
        }
    }
    
    // function withdrawPlatformFees() external onlyOwner {
    //     uint256 fees = platformFeesAccumulated;
    //     require(fees > 0, "No fees available");

    //     platformFeesAccumulated = 0;
    //     (bool success, ) = owner().call{value: fees}("");
    //     require(success, "Transfer failed");
    // }
}
