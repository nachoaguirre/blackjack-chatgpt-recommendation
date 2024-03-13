(() => {
    'use strict'

    const numPlayers = 3;
    const enableRecomendations = true;

    const btnNewGame = document.getElementById('btnNewGame'),
    btnHit = document.getElementById('btnHit'),
    btnStand = document.getElementById('btnStand'),
    btnRecommendation = document.getElementById('btnRecommendation'),
    humanPlayers = document.getElementById('humanPlayers'),
    computerPlayer = document.getElementById('computerPlayer');

    let divCards = document.querySelectorAll('.divCards'),
    playerContainers = document.querySelectorAll('.player-container'),
    pointsHTML = document.querySelectorAll('small');

    let minimumPoints = 0;

    let deck = [];

    const tipos = ['C', 'D', 'H', 'S'],
    especiales = ['A', 'J', 'Q', 'K'],
    pointsToWin = 21;

    let playersPoints = [],
    winners = [],
    draw = [],
    lost = [],
    currentShift = 0;

    const init = ( playersQty = 1) => {
        if (!enableRecomendations) {
            btnRecommendation.style.display = 'none';
        }

        toggleButtons(true);

        for (let i = 0; i < playersQty+1; i++) {
            playersPoints.push(0);
        }

        for (let i = 0; i < playersPoints.length; i++) {
            createPlayerHtml(i);
        }

        divCards = document.querySelectorAll('.divCards');
        pointsHTML = document.querySelectorAll('small');
        playerContainers = document.querySelectorAll('.player-container');
    }

    const createPlayerHtml = (player) => {
        const isComputer = player === playersPoints.length - 1;
        const rowContainer = !isComputer ? humanPlayers : computerPlayer;

        const divContainer = document.createElement('div');
        divContainer.classList.add('col', 'align-self-center', 'mt-2', `player-${player+1}`);
        if (isComputer) {
            divContainer.classList.add('computer-player', 'text-center');
        }

        const playerContainer = document.createElement('div');
        playerContainer.classList.add('player-container');
        divContainer.appendChild(playerContainer);

        const playerTitle = document.createElement('h1');
        if (!isComputer) {
            playerTitle.innerHTML = `Player ${player + 1} - `;
        } else {
            playerTitle.innerHTML = `Dealer - `;
        }
        playerTitle.classList.add('fs-4');
        const smallTag = document.createElement('small');
        smallTag.innerText = '0 points';
        smallTag.classList.add('fs-6');
        playerTitle.appendChild(smallTag);
        playerContainer.appendChild(playerTitle);

        const divPlayer = document.createElement('div');
        divPlayer.classList.add('divCards', `divCards-player-${player+1}`);
        divPlayer.innerHTML = '<div class="card-placeholder"></div>';
        playerContainer.appendChild(divPlayer);

        rowContainer.appendChild(divContainer);
    }

    const createDeck = () => {
        deck = [];

        for (let i = 2; i <= 10; i++) {
            for(let tipo of tipos) {
                deck.push(i + tipo);
            }
        }

        for(let tipo of tipos) {
            for(let esp of especiales) {
                deck.push(esp + tipo);
            }
        }

        const shuffleDeck = (array) => {
            const shuffled = array.slice();
            let currentIndex = shuffled.length;
            let temporaryValue, randomIndex;
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = shuffled[currentIndex];
                shuffled[currentIndex] = shuffled[randomIndex];
                shuffled[randomIndex] = temporaryValue;
            }
            return shuffled;
        };

        return shuffleDeck(deck);
    }

    const requestCard = () => {
        if(deck.length === 0) {
            throw 'There are no cards in the deck';
        }

        return deck.pop();
    }

    const getCardPoints = (card) => {
        const value = card.substring(0, card.length - 1);
        return ( isNaN(value) ) ?
            (value === 'A') ? 11 : 10
            : value * 1;
    }

    const accumulatePoints = (card, player) => {
        playersPoints[player] += getCardPoints(card);
        pointsHTML[player].innerText = `${playersPoints[player]} points`;

        return playersPoints[player];
    }

    const dealerTurn = () => {
        let delay = 1000;

        const showDealerCard = () => {
            if (deck.length === 0 ||
                playersPoints[playersPoints.length - 1] >= minimumPoints ||
                minimumPoints > pointsToWin
            ) {
                checkResults();
                return;
            }

            const card = requestCard();

            const dealerPoints = accumulatePoints(card, playersPoints.length - 1);

            showCardInTable(card, divCards[divCards.length - 1]);

            if (dealerPoints < minimumPoints && minimumPoints <= pointsToWin) {
                setTimeout(showDealerCard, delay);
            } else {
                // checkResults();
                setTimeout(checkResults, delay);
            }
        };

        showDealerCard();
    };

    const checkResults = () => {
        const dealerPoints = playersPoints[playersPoints.length - 1];

        setTimeout(() => {
            playersPoints.forEach((currentPoints, index) => {
                if (index === playersPoints.length - 1) {
                    return;
                }

                if (dealerPoints > pointsToWin) {
                    if (currentPoints > pointsToWin) {
                        draw.push(index);
                    } else {
                        winners.push(index);
                    }
                } else {
                    if (currentPoints === dealerPoints) {
                        draw.push(index);
                    } else if (currentPoints > dealerPoints && currentPoints <= pointsToWin) {
                        winners.push(index);
                    } else {
                        lost.push(index);
                    }
                }
            });

            let result = '';
            let winnersText = '';
            let drawText = '';
            let lostText = '';

            winners.forEach((winner) => {
                winnersText += `Player ${winner+1} (${playersPoints[winner]}), `;
            });

            draw.forEach((draw) => {
                drawText += `Player ${draw+1} (${playersPoints[draw]}), `;
            });

            lost.forEach((lost) => {
                lostText += `Player ${lost+1} (${playersPoints[lost]}), `;
            });

            if (winners.length > 0) {
                result += `Winners: ${winnersText}\n`;
            }

            if (draw.length > 0) {
                result += `Draw: ${drawText}\n`;
            }

            if (lost.length > 0) {
                result += `Lost: ${lostText}`;
            }

            alert(`Result:\n${result}`);
        }, 10);
    };

    const showCardInTable = (card, player) => {
        if(player.children.length === 1 && player.children[0].classList.contains('card-placeholder')) {
            player.innerHTML = '';
        }
        const imgCard = document.createElement('img');
        imgCard.src = `assets/cards/${card}.png`;
        imgCard.classList.add('cardimg');
        player.append(imgCard);
    }

    const givePlayerCard = (player = 0) => {
        const card = requestCard();

        const playerPoints = accumulatePoints(card, player);

        showCardInTable(card, divCards[player]);

        if(playerPoints > pointsToWin) {
            console.warn(`Player ${player+1} loses, went over 21!`);
            setMinimumPoints(playerPoints);
            currentShift++;
            if(checkNextIsDealer()) {
                toggleButtons(true);
                dealerTurn();
            } else {
                playerContainers[currentShift-1].classList.remove('active-player');
                playerContainers[currentShift].classList.add('active-player');
            }
        } else if (playerPoints === pointsToWin) {
            console.warn('21, cool!');
            setMinimumPoints(playerPoints);
            if(checkNextIsDealer()) {
                toggleButtons(true);
                dealerTurn();
            } else {
                playerContainers[currentShift].classList.remove('active-player');
                currentShift++;
                playerContainers[currentShift].classList.add('active-player');
            }
        }
    }

    const toggleButtons = (state) => {
        [btnHit, btnStand].forEach(btn => {
            btn.disabled = state;
            btn.classList.toggle('btn-primary', !state);
            btn.classList.toggle('btn-secondary', state);
        });
    }

    const resetGame = () => {
        console.clear();

        minimumPoints = 0;
        currentShift = 0;

        winners = [];
        draw = [];
        lost = [];

        for (let i = 0; i < playersPoints.length; i++) {
            playersPoints[i] = 0;
            pointsHTML[i].innerText = '0 points';
            divCards[i].innerHTML = '<div class="card-placeholder"></div>';
        }

        playerContainers.forEach((container) => {
            container.classList.remove('active-player');
            container.classList.remove('lost-player');
        });

        toggleButtons(false);
    }

    const setMinimumPoints = (points) => {
        const currentIsMinor = points < minimumPoints;
        const isExceded = points > pointsToWin;

        if (minimumPoints === 0) {
            minimumPoints = points;
        } else if (!currentIsMinor && !isExceded) {
            minimumPoints = points;
        }
    }

    const checkNextIsDealer = () => {
        return currentShift === playersPoints.length - 1;
    }

    btnNewGame.addEventListener('click', () => {
        resetGame();
        deck = createDeck();

        playerContainers[0].classList.add('active-player');

        givePlayerCard(currentShift);
    });

    btnStand.addEventListener('click', () => {
        const currentShiftTemp = currentShift;
        const currentPoints = playersPoints[currentShiftTemp];
        setMinimumPoints(currentPoints);

        playerContainers[currentShift].classList.remove('active-player');

        currentShift++;

        const nextIsDealer = checkNextIsDealer();

        playerContainers[currentShift].classList.add('active-player');

        if (nextIsDealer) {
            toggleButtons(true);
            dealerTurn();
        }
    });

    btnRecommendation.addEventListener('click', async () => {
        if(!enableRecomendations) {
            return;
        }

        const points = playersPoints[currentShift];
        const cards = JSON.stringify(deck).replace(/\"/g, "");

        const response = await fetch('/api/recommendation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({points, cards})
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        const recommendation = data.recommendation;

        console.log('Recommendation:', recommendation);

        if (recommendation === 'Ask' || recommendation === 'Stop') {
            const useRecomendation = confirm(`IA Recommendation: ${recommendation}. Do you want to heed the recommendation? (Ask/Stop)`);

            if (useRecomendation) {
                if (recommendation === 'Ask') {
                    givePlayerCard(currentShift);
                } else {
                    btnStand.click();
                }
            }
        } else {
            alert(`Could not get a recommendation. Response: ${recommendation}`);
        }
    });


    btnHit.addEventListener('click', () => {
        givePlayerCard(currentShift);
    });

    init(numPlayers);

})();


