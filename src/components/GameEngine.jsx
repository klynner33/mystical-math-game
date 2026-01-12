import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "./Header.jsx";
import Button from "./Button.jsx";
import FeedbackModal from "./FeedbackModal.jsx";
import Hint from "./Hint.jsx";
import bronzeChest from "../assets/inventory-images/extra-images/bronze-chest.png";
import bronzeKey from "../assets/inventory-images/extra-images/bronze-key.png";
import woodenDoor from "../assets/inventory-images/extra-images/wooden-door.png";
import inventoryItems from "../data/inventoryImages.js";

export default function GameEngine({
  operator,
  chart,
  generateNumbers,
  checkCorrect,
}) {
  const [answerDisplay, setAnswerDisplay] = useState("");
  const [feedbackModal, setFeedbackModal] = useState("modal-hidden");
  const [score, setScore] = useState(0);
  const [key, setKey] = useState(null);
  const [keyText, setKeyText] = useState("");
  const [chestImage, setChestImage] = useState(bronzeChest);
  const [answered, setAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [numbers, setNumbers] = useState(() => generateNumbers());
  const [displayHint, setDisplayHint] = useState("book");

  const topNumber = numbers.top;
  const bottomNumber = numbers.bottom;

  const inputRef = useRef(null);

  useEffect(() => {
    if (feedbackModal === "modal-hidden") {
      inputRef.current.focus();
    }
  }, [feedbackModal]);

  const addToInventory = (item) => {
    const existing = JSON.parse(localStorage.getItem("inventory")) || [];
    if (!existing.some((i) => i.name === item.name)) {
      existing.push(item);
      localStorage.setItem("inventory", JSON.stringify(existing));
    }
  };

  function getRandomItem() {
    const saved = JSON.parse(localStorage.getItem("inventory")) || [];

    const remaining = inventoryItems.filter(
      (item) => !saved.some((earned) => earned.name === item.name)
    );

    if (remaining.length === 0) {
      return null;
    }

    const index = Math.floor(Math.random() * remaining.length);
    return remaining[index];
  }

  function checkAnswer() {
    if (answered) return;

    const value = parseInt(document.querySelector(".answer").value);

    if (checkCorrect(topNumber, bottomNumber, value)) {
      setFeedbackModal("modal");
      setAnswerDisplay("Correct!");

      setScore((prev) => {
        const newScore = prev + 1;

        if (newScore === 10) {
          setKey(bronzeKey);
          setKeyText("Drop the key on the chest to open it!");
          setGameOver(true);
        }

        return newScore;
      });
    } else {
      setFeedbackModal("modal");
      setAnswerDisplay("Incorrect.");
    }

    setAnswered(true);
  }

  function newQuestion() {
    setDisplayHint("book");

    if (score === 10) {
      setScore(0);
      setKey(null);
      setKeyText("");
      setChestImage(bronzeChest);
    }

    setNumbers(generateNumbers());
    resetInput();
    setAnswered(false);
    setFeedbackModal("modal-hidden");
    setAnswerDisplay("");
  }

  function sameQuestion() {
    setDisplayHint("book");

    setFeedbackModal("modal-hidden");
    setAnswered(false);
  }

  function resetInput() {
    document.getElementById("answer-input").value = "";
  }

  function resetGame() {
    setDisplayHint("book");
    setScore(0);
    setGameOver(false);
    setKey(null);
    setKeyText("");
    setChestImage(bronzeChest);
    setNumbers(generateNumbers());
    resetInput();
    setAnswered(false);
    setFeedbackModal("modal-hidden");
    setAnswerDisplay("");
  }

  return (
    <div className="game-screen">
      <Header />

      <div className="top-info-bar">
        <div className="inventory-link-container">
          <p>Go to my inventory ➔</p>
          <Link to="/inventory">
            <img src={woodenDoor} alt="Wooden Door" className="wooden-door" />
          </Link>
        </div>
        <p className="info-text">
          Gain enough mystic charge from your inventory to battle the math
          wizard!
        </p>
      </div>

      <div className="game-container">
        <div className="score-container">
          <p>Your score: {score}</p>

          <div className="chest-key-container">
            {key && (
              <img
                src={key}
                className="key key-animate"
                draggable={true}
                onDragStart={(e) =>
                  e.dataTransfer.setData("text/plain", "bronzeKey")
                }
              />
            )}

            <img
              src={chestImage}
              className="chest"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const item = e.dataTransfer.getData("text/plain");

                if (item === "bronzeKey") {
                  const reward = getRandomItem();

                  if (!reward) {
                    setKeyText(
                      "You've collected EVERYTHING! You're a true Mystical Master!"
                    );
                    setKey(null);
                    return;
                  }

                  setChestImage(reward.src);
                  setKey(null);
                  setKeyText(
                    <>
                      Congrats! You've unlocked the{" "}
                      <span className="item-name">{reward.name}</span>! This
                      will be saved in your inventory!
                    </>
                  );
                  addToInventory(reward);
                }
              }}
            />
          </div>

          <div className="key-text">
            <p>{keyText}</p>
          </div>
        </div>

        <div className="equation-container">
          <p>Get 10 correct answers and earn a key to unlock the chest!</p>

          <div className="equation">
            <div className="equation-numbers">
              <div className="top-number">{topNumber}</div>
              <div>
                <span className="operator">{operator}</span>
                <span className="bottom-number">{bottomNumber}</span>
              </div>
            </div>

            <hr className="equation-line" />

            <input
              className="answer"
              type="number"
              id="answer-input"
              ref={inputRef}
              disabled={gameOver}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
                if (e.key === "Enter" && feedbackModal === "modal-hidden") {
                  checkAnswer();
                }
              }}
              onInput={(e) => {
                if (e.target.value.length > 3) {
                  e.target.value = e.target.value.slice(0, 3);
                }
              }}
            />
          </div>

          {gameOver ? (
            <Button name="Keep Playing" onClick={resetGame} />
          ) : (
            <Button name="Check Answer" onClick={checkAnswer} />
          )}
        </div>

        <Hint
          chart={chart}
          displayHint={displayHint}
          setDisplayHint={setDisplayHint}
        />
      </div>

      {/* Feedback Modal */}
      {feedbackModal === "modal" &&
        (score === 10 ? (
          <FeedbackModal
            answerDisplay="You've earned a key to unlock the chest!"
            onClick={() => setFeedbackModal("modal-hidden")}
            name="Close"
            allowEnter={false} // Mouse only
          />
        ) : answerDisplay === "Correct!" ? (
          <FeedbackModal
            answerDisplay={answerDisplay}
            onClick={newQuestion}
            name="Next Question"
            allowEnter={true} // Enter works
          />
        ) : (
          <FeedbackModal
            answerDisplay={answerDisplay}
            onClick={sameQuestion}
            name="Try Again"
            allowEnter={true} // Enter works
          />
        ))}
    </div>
  );
}
