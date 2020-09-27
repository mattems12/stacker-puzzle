import React, {useState} from 'react';
import './App.css';
import Material from './material.jsx';

//Frame work should be all set. (deck, hand, stack)
// TODO: when we put something on the stack, how does it interact with the other things?
// When generating the deck, we will need 'types' of materials. Use these types to determine interactions on stack
const BLUE = 'blue';
const RED = 'red';
const GREEN = 'green';
const YELLOW = 'yellow';
const CIRCLE = 'circle';
const TRIANGLE = 'triangle';
const SQUARE = 'square';
const EFFECT_GROUP_1 = [BLUE, RED, GREEN, YELLOW];
const EFFECT_GROUP_2 = [CIRCLE, TRIANGLE, SQUARE];

function App() {
  const [selectedMat, setSelectedMat] = useState(null);
  const [matStack, setMatStack] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const materialDeck = generateDeck(20);
  const [curDeck, setCurDeck] = useState(materialDeck);
  const [totalScore, setTotalScore] = useState(0);

  let effect_descriptions = {"blue": "If a red mat is below me, double it's score.",
                             "red": "When forced off the stack, add half this score to the 2nd mat on the stack.",
                             "green": "Increase the score of each adjacent mat by 20%",
                             "yellow": "When placed, increase the score of the bottom mat by 50%",
                             "circle": "when forced off the stack, add this score to the top most circle mat",
                             "triangle": "If this is on the top of the stack AND adjacent to a square, increase both mat scores by 25%",
                             "square": "If placed above another square, double this score."}

  function executeMat(material, poppedFromBottom) {
    //execute the specific material effects, based on the current state of the matStack
    if(matStack.length > 0){
        //colors
        if(material.color === BLUE) {
            if(matStack[0].color === RED) {
                console.log("blue effect activated!");
                matStack[0].score *= 2;
            }
        }else if(material.color === RED && poppedFromBottom) {
            console.log("red effect activated!");
            matStack[1].score += Math.floor(material.score/2);
        }else if(material.color === YELLOW) {
            if(matStack.length == 4) {
                console.log("yellow effect activated!");
                matStack[3].score = Math.floor(matStack[3] * 1.5);
            }
        }

        //shapes
        if(material.shape === SQUARE) {
            if(matStack[0].shape === SQUARE) {
                console.log("square effect activated!");
                material.score *= 2;
            }
        }else if(material.shape === CIRCLE && poppedFromBottom) {
            //find the top most circle
            for(let i=0; i<4; i++) {
                if(matStack[i].shape === CIRCLE) {
                    console.log("circle effect activated!");
                    matStack[i].score += material.score;
                    break;
                }
            }
        }
    }
  }

  function calculateFinalScore() {
    if(totalScore > 0) {
        return;
    }
    for(let i=0; i < matStack.length; i++) {
        let material = matStack[i];
        //colors
        if(material.color === GREEN) {
            if(i > 0) {
                console.log("green effect activated!");
                matStack[i-1].score = Math.floor(matStack[i-1].score * 1.2);
            }
            if(i < matStack.length-1) {
                console.log("green effect activated!");
                matStack[i+1].score = Math.floor(matStack[i+1].score * 1.2);
            }
        }

        //shapes
        if(material.shape === TRIANGLE && i == 0) {
            if(i+1 < matStack.length && matStack[i+1].shape === SQUARE) {
                console.log("triangle effect activated!");
                material.score = Math.floor(material.score * 1.25);
                matStack[i+1].score = Math.floor(matStack[i+1].score * 1.25);
            }
        }
    }
    let grandTotal = 0;
    for(let i=0; i < matStack.length; i++) {
        let mat = matStack[i];
        grandTotal += mat.score;
    }
    setTotalScore(grandTotal);
  }

  function generateDeck(amount) {
    let deck = [];
    for(let i=0; i < amount; i++) {
        let random_effect_1 = EFFECT_GROUP_1[getRndInteger(0, 3)];
        let random_effect_2 = EFFECT_GROUP_2[getRndInteger(0, 2)];
        let mat = {"id": i,
                   "color": random_effect_1,
                   "shape": random_effect_2,
                   "score": 10};
        deck.push(mat);
    }
    return deck;
  }

  function popMatFromHand(matId) {
    let newHand = [...playerHand];
    let indexToRemove = null;
    let matFromHand = null;
    for(let i=0; i < newHand.length; i++) {
        if(newHand[i].id === matId) {
            indexToRemove = i;
            break;
        }
    }
    if(indexToRemove !== null) {
        matFromHand = newHand.splice(indexToRemove, 1)[0];
        setPlayerHand(newHand);
    }
    return matFromHand;
  }

  function selectMat(material) {
    if(selectedMat !== null) {
        selectedMat.className = selectedMat.className.replace(/ active$/, '');
    }
    material.className = material.className.replace(/$/, ' active');
    setSelectedMat(material);
  }

  function pushMat() {
    if(selectedMat !== null) {
        let newStack = [...matStack];
        let matObj = popMatFromHand(parseInt(selectedMat.id));
        newStack.unshift(matObj);
        executeMat(matObj, false);
        if(newStack.length > 4) {
            executeMat(newStack.pop(), true);
        }
        setMatStack(newStack);
        selectedMat.className = selectedMat.className.replace(/ active$/, '');
        setSelectedMat(null);
    }
  }
  function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
  }
  function drawFromDeck() {
    let newHand = [...playerHand];
    let deck = [...curDeck];
    if(deck.length > Math.floor(materialDeck.length/2)){
        let randomIndex = getRndInteger(0, deck.length-1);
        newHand.push(deck.splice(randomIndex, 1)[0]); //take a random index from the deck
        setPlayerHand(newHand);
        setCurDeck(deck);
    }
  }

  return (
    <div className="App">
        <div className="Deck">
            Deck
            <div className="Grid">
                {curDeck.map((mat, i) =>
                    <Material key={i} color={mat.color} shape={mat.shape}></Material>
                )}
            </div>
        </div>
        <div className="Hand">
            Hand
            <div className="Grid">
                {playerHand.map((mat, i) =>
                    <Material key={i} id={mat.id} selectMe={selectMat} color={mat.color} shape={mat.shape}></Material>
                )}
            </div>
        </div>
        <div className="Stack">
            Stack
            {matStack.map((mat, i) =>
                <Material key={i} color={mat.color} shape={mat.shape}>{mat.score}</Material>
            )}
        </div>
        <div className="Actions">
            <button onClick={pushMat}>Stack Selected Material</button>
            <button onClick={drawFromDeck}>Draw Material</button>
            <button onClick={calculateFinalScore}>Done</button>
            <p>{totalScore}</p>
        </div>

    </div>
  );
}

export default App;
