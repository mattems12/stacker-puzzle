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

  const effect_descriptions = {"blue": "If a red material is below me, double it's score.",
                             "red": "When forced off the stack, add half this score to the 2nd material on the stack.",
                             "green": "Increase the score of each adjacent material by 20%",
                             "yellow": "When placed, increase the score of the bottom material by 50%",
                             "circle": "When forced off the stack, add this score to the top most circle material",
                             "triangle": "If this is on the top of the stack AND adjacent to a square, increase both material scores by 25%",
                             "square": "If placed above another square, double this material's score."}

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
                matStack[3].score = Math.floor(matStack[3].score * 1.5);
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
            <p>
            Some starting amount of materials. This would be determined by the crafting recipe.
            (Maybe players can adjust what goes into the "deck"?)
            </p>
            <div className="GridWrap">
                <div className="Grid">
                    {curDeck.map((mat, i) =>
                        <Material key={i} color={mat.color} shape={mat.shape}></Material>
                    )}
                </div>
            </div>
            <button className="Btn" onClick={drawFromDeck}>Draw Material</button>
            <br />
            <br />
            <div className="Effects">
                <h3>Effects:</h3>
                <p><b>Blue</b>: {effect_descriptions.blue}</p>
                <p><b>Red</b>: {effect_descriptions.red}</p>
                <p><b>Green</b>: {effect_descriptions.green}</p>
                <p><b>Yellow</b>: {effect_descriptions.yellow}</p>
                <p><b>Square</b>: {effect_descriptions.square}</p>
                <p><b>Circle</b>: {effect_descriptions.circle}</p>
                <p><b>Triangle</b>: {effect_descriptions.triangle}</p>
            </div>
        </div>
        <div className="Hand">
            Hand
            <p>
            The "hand" is a random subset of materials from the "deck". (Maybe players can adjust the RNG?)
            </p>
            <div className="Grid">
                {playerHand.map((mat, i) =>
                    <Material key={i} id={mat.id} selectMe={selectMat} color={mat.color} shape={mat.shape}></Material>
                )}
            </div>
            <button className="Btn" onClick={pushMat}>Stack Selected Material</button>
        </div>
        <div className="Stack">
            Stack
            <p>
            Materials are placed on the "stack" with various effects triggering at different times. This stack's max
            size is currently set at 4. When a material is placed and the max size is exceeded, the bottom material
            is popped off.
            </p>
            <div>
                {matStack.map((mat, i) =>
                    <Material key={i} color={mat.color} shape={mat.shape}>{mat.score}</Material>
                )}
            </div>
            <button className="Btn" onClick={calculateFinalScore}>Done</button>
        </div>
        <div className="Score">
            Score
            <p>The score is the sum of the current materials on the stack, plus any additional effects that trigger
            on completion.
            </p>
            <p>Final Score: {totalScore}</p>
        </div>

    </div>
  );
}

export default App;
