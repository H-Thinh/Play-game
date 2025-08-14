import { ChangeEvent, useEffect, useRef, useState } from "react";
import "./Playgame.css";

interface Circle {
  top: string;
  left: string;
  isVisible: boolean;
  timeCircle: number;
  isClicked: boolean;
}

interface Stategame {
  text: string;
  color: string;
}

function Playgame() {
  const [input, setInputs] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOnAuto, setIsOnAuto] = useState(false);
  const [isPause, setIsPause] = useState(false);
  const [timeStart, setTimeStart] = useState(0);
  const [positions, setPositions] = useState<Circle[]>([]);
  const [nextRemoveIndex, setNextRemoveIndex] = useState(0);
  const [header, setHeader] = useState<Stategame>({
    text: "Let's Play",
    color: "black",
  });

  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);
  const isOnAutoRef = useRef(isOnAuto);

  useEffect(() => {
    if (isPause) {
      clearTimer();
    }
  }, [isPause]);

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    let intValue = parseInt(e.target.value);
    if (intValue <= 0) {
      intValue = 1;
      alert("Vui lòng chọn số lớn hơn 0");
    }
    setInputs(intValue);
  }

  function randomPosition() {
    const x = Math.floor(Math.random() * 473); // làm tròn số và radom vị trí
    const y = Math.floor(Math.random() * 473);
    return { top: y + "px", left: x + "px" };
  }

  useEffect(() => {
    if (!isPlaying || isPause) return;

    let timerId: NodeJS.Timeout;

    timerId = setInterval(() => {
      setTimeStart((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, 100);

    return () => clearInterval(timerId);
  }, [isPlaying, isPause]);

  function clearTimer() {
    intervalsRef.current.forEach(clearInterval);
    timeoutRef.current.forEach(clearTimeout);
    intervalsRef.current = [];
    timeoutRef.current = [];
  }

  function startGame() {
    setTimeStart(0);
    const newPositions: Circle[] = Array.from({ length: input }).map(() => ({
      ...randomPosition(),
      isVisible: true,
      timeCircle: 3,
      isClicked: false,
    }));

    clearTimer();

    setPositions(newPositions);
    setIsPlaying(true);
    setIsPause(false);
    setNextRemoveIndex(0);
    setHeader({ text: "Let's Play", color: "black" });
    setIsOnAuto(false);
  }

  function RemoveNext(numberCircle: number) {
    if (numberCircle > nextRemoveIndex) {
      setHeader({ text: "Game Over", color: "red" });
      setIsPause(true);
      return;
    } else {
      setNextRemoveIndex((prev) => prev + 1);
    }

    // Countdown mỗi 0.1s
    const countdownInterval = setInterval(() => {
      setPositions((prev) =>
        prev.map((pos, i) =>
          i === numberCircle
            ? {
                ...pos,
                timeCircle: parseFloat((pos.timeCircle - 0.1).toFixed(1)),
                isClicked: true,
              }
            : pos
        )
      );
    }, 100);
    intervalsRef.current.push(countdownInterval);

    // Sau 3 giây thì ẩn vòng tròn & chuyển sang cái tiếp theo
    const removeTimeout = setTimeout(() => {
      clearInterval(countdownInterval);
      setPositions((prev) =>
        prev.map((pos, i) =>
          i === numberCircle
            ? {
                ...pos,
                isVisible: false,
              }
            : pos
        )
      );

      if (nextRemoveIndex === input - 1) {
        setPositions([]);
        setIsPause(true);
        setHeader({
          text: "All Cleared",
          color: "green",
        });
      }
    }, 3000);
    timeoutRef.current.push(removeTimeout);
  }

  function autoPlayStep() {
    setIsOnAuto(!isOnAuto);
  }

  useEffect(() => {
    isOnAutoRef.current = isOnAuto;

    // if (isOnAutoRef.current) return;

    function runCircle(index: number) {
      if (!isOnAutoRef.current || index >= input) return;

      const countdownInterval = setInterval(() => {
        setPositions((prev) =>
          prev.map((pos, i) =>
            i === index
              ? {
                  ...pos,
                  timeCircle: parseFloat((pos.timeCircle - 0.1).toFixed(1)),
                  isClicked: true,
                }
              : pos
          )
        );
      }, 100);
      intervalsRef.current.push(countdownInterval);

      const removeTimeout = setTimeout(() => {
        clearInterval(countdownInterval);
        setPositions((prev) =>
          prev.map((pos, i) =>
            i === index ? { ...pos, isVisible: false } : pos
          )
        );

        if (index === input - 1) {
          setPositions([]);
          setIsPause(true);
          setHeader({
            text: "All Cleared",
            color: "green",
          });
        }
      }, 3000);
      timeoutRef.current.push(removeTimeout);

      const continueTimeout = setTimeout(() => {
        if (index === input - 1) {
        } else {
          setNextRemoveIndex(index + 1);
        }

        // Nếu chưa hết vòng, chạy vòng tiếp theo
        runCircle(index + 1);
      }, 1000);
      timeoutRef.current.push(continueTimeout);
    }

    runCircle(0); // bắt đầu từ index 0
  }, [isOnAuto]);

  return (
    <div className="container">
      <h1 style={{ color: header.color }}>{header.text}</h1>
      <div className="header-game">
        <div className="points">
          <p>Points:</p>
          <input
            type="number"
            name="points"
            value={input}
            onChange={handleInput}
            disabled={!isPlaying && isPause}
          />
        </div>
        <div className="time">
          <p>Time:</p>
          <span>{timeStart}</span>
        </div>
      </div>
      <div className="btn-game">
        {isPlaying ? (
          <>
            <button
              onClick={() => {
                startGame();
              }}
            >
              Restart
            </button>
            {isPause && positions.length === 0 ? (
              ""
            ) : (
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  autoPlayStep();
                }}
              >
                Auto Play {isOnAuto ? "OFF" : "ON"}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={() => {
              startGame();
            }}
          >
            Play
          </button>
        )}
      </div>
      <ul className="frame-game">
        {positions.map((pos, i) =>
          pos.isVisible ? (
            <li
              key={i}
              style={{
                ...pos,
                backgroundColor: pos.isClicked ? "orange" : "",
                opacity: pos.timeCircle / 3,
              }}
              onClick={() => RemoveNext(i)}
            >
              <p>{i + 1}</p>
              <span>{pos.timeCircle}</span>
            </li>
          ) : (
            <></>
          )
        )}
      </ul>
      <div className="point-next">
        <p>next: </p>
        <span>{nextRemoveIndex + 1}</span>
      </div>
    </div>
  );
}

export default Playgame;
