// ======================== //
// ===== DOM ELEMENTS ===== //
// ======================== //

const welcomeScreen = document.querySelector('.welcome-screen');
const input = document.querySelector('#search');
const startButton = document.querySelector('#start-button');

const gameScreen = document.querySelector('.game-screen');
const matchingKeyword = document.querySelector('#matching-keyword');
const imagesContainer = document.querySelector('.images-container');
const timerElement = document.querySelector('#timer');
const rightScoreElement = document.querySelector('#right-answers');
const wrongScoreElement = document.querySelector('#wrong-answers');

const optionsScreen = document.querySelector('.container-game-options');
const gridOptions = document.querySelectorAll('input[name=grid-size]');
const timeOptions = document.querySelectorAll('input[name=time-limit]');
const diffOptions = document.querySelectorAll('input[name=difficulty]');

const resultsScreen = document.querySelector('.results-screen');
const finalScore = document.querySelector('#final-score');
const finalRight = document.querySelector('#final-right');
const finalWrong = document.querySelector('#final-wrong');
const reviewSize = document.querySelector('#review-size');
const reviewTime = document.querySelector('#review-time');
const reviewDiff = document.querySelector('#review-diff');

const hiScoreScreen = document.querySelector('.hi-scores-screen');
const hiScoreElements = document.querySelectorAll('.scores');


// ======================== //
// === GLOBAL VARIABLES === //
// ======================== //

const apiKey = '-x12KZv8xycsDvA69NSRDVTCdiO831mu2ITgs-wYgQA';

let timerInterval,
    validKeyword,
    invalidKeyword,
    totalDivCount,
    imageObjects,
    rightAnswers,
    wrongAnswers,
    topScores,
    computedScore;

let gameOptions = {
    size: 'small',
    time: '30',
    difficulty: 'easy'
}


// =========================== //
// ==== SCREEN NAVIGATION ==== //
// =========================== //


const toggleOptions = () => {
    optionsScreen.classList.toggle('hidden');
}

const openHiScores = () => {
    hiScoreScreen.classList.toggle('hidden');
    getScores();
}

const closeHiScores = () => {
    hiScoreScreen.classList.toggle('hidden');
}

const backToWelcome = () => {
    resultsScreen.classList.toggle('hidden');
    welcomeScreen.classList.toggle('hidden');
    
    resetOptions();
    resetScore();
}



// ============================ //
// ======= GAME OPTIONS ======= //
// ============================ //


const getGridSize = () => {
    let value;
    gridOptions.forEach(option => {
        if (option.checked) {
            value = option.value;
        }
    });
    return value;
}

const getTimeLimit = () => {
    let value;
    timeOptions.forEach(option => {
        if (option.checked) {
            value = option.value;
        }
    });
    return value;
}

const getDifficulty = () => {
    let value;
    diffOptions.forEach(option => {
        if (option.checked) {
            value = option.value;
        }
    });
    return value;
}

const getGameOptions = () => {
    gameOptions = {
        size: getGridSize(),
        time: getTimeLimit(),
        difficulty: getDifficulty()
    }
    return gameOptions;
}

const saveOptions = () => {
    getGameOptions();
    toggleOptions();
}

const resetOptions = () => {
    gameOptions = {
        size: 'small',
        time: '30',
        difficulty: 'easy'
    }
    gridOptions.forEach(option => {
        option.checked = false;
    });
    gridOptions[0].checked = true;

    timeOptions.forEach(option => {
        option.checked = false;
    });
    timeOptions[0].checked = true;

    diffOptions.forEach(option => {
        option.checked = false;
    });
    diffOptions[0].checked = true;

}


// ============================ //
// ==== GAME FUNCTIONALITY ==== //
// ============================ //


const getInputValue = () => {
    const searchSubstrings = input.value.split(',');
    if (searchSubstrings.length !== 2) {
        alert('Please insert two keywords separated by a comma');
        input.value = '';
        startButton.disabled = false;
        return;
    }
    const keywords = [];
    searchSubstrings.forEach(word => {
        let newWord = word.trim().replace(/[^\w\s]/gi, "");
        keywords.push(newWord.toLowerCase());
    });
    if (keywords[0] === keywords[1]) {
        alert('Please insert two DISTINCT keywords separated by a comma');
        input.value = '';
        startButton.disabled = false;
        return;
    }
    return keywords;
}

const startGame = () => {

    try {

        startButton.setAttribute('disabled', 'true');

        const gameOptions = getGameOptions();

        processKeywords();

        matchingKeyword.innerText = `Select all images containing ${validKeyword.toUpperCase()}`;

        welcomeScreen.classList.toggle('hidden');
        gameScreen.classList.toggle('hidden');

        displayAnswerCount();
        resetScore();
        setTimer(gameOptions.time);
        setImages(gameOptions);

    } catch (err) {
        console.log(err);
    }
}

const nextPage = () => {
    setImages(gameOptions);
}

const processKeywords = () => {
    let tempKeywords = getInputValue();
    const randomBoolean = getRandomBoolean();
    validKeyword = randomBoolean ? tempKeywords[1] : tempKeywords[0];
    invalidKeyword = randomBoolean ? tempKeywords[0] : tempKeywords[1];
}

const finishGame = () => {
    clearInterval(timerInterval);
    timerElement.innerText = '';
    timerInterval = 0;
    matchingKeyword.innerText = '';
    startButton.removeAttribute('disabled');

    imageObjects = [];
    showResults();
}

const showResults = () => {
    gameScreen.classList.toggle('hidden');
    resultsScreen.classList.toggle('hidden');

    finalRight.innerText = rightAnswers;
    finalWrong.innerText = wrongAnswers;
    computedScore = rightAnswers - wrongAnswers;
    finalScore.innerText = computedScore;

    addScore(computedScore);

    reviewDiff.innerText = gameOptions.difficulty;
    reviewTime.innerText = gameOptions.time;
    reviewSize.innerText = gameOptions.size;

}

const displayAnswerCount = () => {
    rightAnswers = 0;
    wrongAnswers = 0;
    rightScoreElement.innerText = rightAnswers;
    wrongScoreElement.innerText = wrongAnswers;
}

const resetScore = () => {
    wrongAnswers = 0;
    rightAnswers = 0;
    computedScore = 0;
}

const addScore = (score) => {
    if (!window.localStorage.getItem('topScores')) {
        topScores = [];
        topScores.push(score);
        window.localStorage.setItem('topScores', topScores.toString());
    } else {
        topScores = window.localStorage.getItem('topScores').split(",");
        topScores.push(score);
        window.localStorage.setItem('topScores', topScores);
    }
}

const getScores = () => {
    if (window.localStorage.getItem('topScores')) {
        topScores = window.localStorage.getItem('topScores').split(",");
        topScores.forEach(s => {s = Number(s)});
    }

    let sortedScores = sortAndReturnTopN(topScores);
    for (let i = 0; i < sortedScores.length; i++) {
        hiScoreElements[i].innerText = sortedScores[i];
    }
}

const deleteScores = () => {
    window.localStorage.clear();
}

const setTimer = (timeLimit) => {
    let seconds = timeLimit;
    timerElement.innerText = 'Ready?';
    timerInterval = setInterval(() => {
        timerElement.innerText = `${seconds} seconds left`;
        seconds--;
        if (seconds < 0) {
            // timerElement.innerText = 'Time Up!';
            clearInterval(timerInterval);
            timerInterval = 0;
            finishGame(); // SUSTITUIR POR MOSTRAR RESULTADOS
        }
    }, 1000);
}



// ======================= //
// === IMAGE FUNCTIONS === //
// ======================= //


const setImages = async (options) => {

    /* 1 - DETERMINAR TAMAÑO GRID EN BASE A OPCIONES */
    imagesContainer.className = `images-container grid-${options.size}`;

    /* 2 - GENERAR Y ASIGNAR AL DOM LOS DIVS CORRESPONDIENTES */
    totalDivCount = getDivsByDifficulty(options); // TOTAL DIVS IS NUMBER
    appendDivs(totalDivCount);

    /* 3 - DETERMINAR CANTIDAD DE IMAGENES VALID E INVALID */
    let validImgCount = getValidImgCountByOptions(options);

    /* 4 - LLAMAR API Y TRAER ARRAY CON IMGS Y KEYWORDS */
    let mixedArray = [];
    mixedArray = await getImgObjectsArray(validKeyword, validImgCount, invalidKeyword, totalDivCount);

    /* 5 - COMPLETAR IMG OBJECTS ARRAY CON URL Y KEYWORDS */
    assignUrlAndKeywordToImageObjects(mixedArray);

    /* 6 - APPEND IMAGENES A LOS DIVS */
    const imageDivs = document.querySelectorAll('.img-card');
    const imgElements = [];
    for (let i = 0; i < imageDivs.length; i++) {
        let newImgElement = document.createElement('img');
        if (mixedArray !== undefined) {
            newImgElement.src = mixedArray[i].url;
        }
        imageDivs[i].appendChild(newImgElement);
        imgElements.push(newImgElement);
    }

}

const assignUrlAndKeywordToImageObjects = (array) => {
    for (let i = 0; i < array.length; i++) {
        imageObjects[i].url = array[i].url;
        imageObjects[i].keyword = array[i].keyword;
    }
}

const appendDivs = (totalDivCount) => {

    imagesContainer.innerHTML = '';
    imageObjects = [];

    for (let i = 0; i < totalDivCount; i++) {

        let newDiv = document.createElement('div');
        let newImageObject = {
            url: '',
            keyword: '',
            gridPlacement: `img${i + 1}`,
        }
        imageObjects.push(newImageObject);

        newDiv.className = `img-card img${i + 1}`;
        newDiv.setAttribute('onclick', `checkClick('img${i + 1}')`);
        imagesContainer.appendChild(newDiv);
    }

}

const getImgObjectsArray = async (validWord, validCount, invalidWord, totalCount) => {

    let tempImageObjects = [];
    let shuffledArray = [];

    const urlValid = `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=${validWord}&count=${validCount}`;
    const urlInvalid = `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=${invalidWord}&count=${(totalCount - validCount)}`;

    try {
        const res1 = await fetch(urlValid);
        const data1 = await res1.json();
        data1.forEach(img => {
            let tempImageObject = {
                url: img.urls.small,
                keyword: validWord
            }
            tempImageObjects.push(tempImageObject);
        });

        const res2 = await fetch(urlInvalid);
        const data2 = await res2.json();
        data2.forEach(img => {
            let tempImageObject = {
                url: img.urls.small,
                keyword: invalidWord
            }
            tempImageObjects.push(tempImageObject);
        });

        return shuffledArray = shuffleArray(tempImageObjects);

    } catch (err) {
        console.log(err);
    }
}

const checkClick = (element) => {

    /* 1 - STORE CLICKED DIV */
    const clickedDiv = document.querySelector(`.${element}`);
    clickedDiv.classList.add('clicked');
    let tmpObj;

    /* 2 - REMOVE ONCLICK TO IMPEDE FURTHER CLICKS */
    clickedDiv.removeAttribute('onclick');

    /* 2 - SEARCH NAME OF CLICKED DIV IN IMAGE OBJECTS ARRAY */
    for (let i = 0; i < imageObjects.length; i++) {
        if (imageObjects[i].gridPlacement === element) {
            tmpObj = imageObjects[i];
        }
    }

    /* 3 - COMPARE CLICKED KEYWORD WITH VALID KEYWORD */
    if (tmpObj.keyword === validKeyword) {
        clickedDiv.firstElementChild.src = './assets/images/right.png';
        clickedDiv.classList.add('right');
        rightAnswers++;
        rightScoreElement.innerText = rightAnswers;
    } else {
        clickedDiv.classList.add('wrong');
        clickedDiv.firstElementChild.src = './assets/images/wrong.png';
        wrongAnswers++;
        wrongScoreElement.innerText = wrongAnswers;
    }

}



// ======================= //
// ====== UTILITIES ====== //
// ======================= //


const getRandomBoolean = () => {
    return (Math.floor(Math.random() * 100)) % 2 === 0;
}

const getDivsByDifficulty = (options) => {

    switch (options.size) {
        case 'small':
            return 6;
        case 'medium':
            return 12;
        case 'large':
            return 16;
    }

}

const getValidImgCountByOptions = (options) => {

    let joinedOptions = `${options.size} ${options.difficulty}`;

    switch (joinedOptions) {
        case 'small easy':
            return 4;
        case 'small normal':
            return 3;
        case 'small hard':
            return 2;
        case 'medium easy':
            return 8;
        case 'medium normal':
            return 6;
        case 'medium hard':
            return 3;
        case 'large easy':
            return 12;
        case 'large normal':
            return 8;
        case 'large hard':
            return 4;
    }
}

const sortAndReturnTopN = (array) => {
    if (array !== undefined) {
        let tempArray = [ ...array ];
        tempArray.sort((a,b) => b - a);
        return tempArray;
    }
    return array = [0,0,0,0,0,0];
}

const shuffleArray = (arr) => {
    let j, x, index;
    for (index = arr.length - 1; index > 0; index--) {
        j = Math.floor(Math.random() * (index + 1));
        x = arr[index];
        arr[index] = arr[j];
        arr[j] = x;
    }
    return arr;
}
