import React, { useContext, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
// 创建context 便于跨组件访问数据
const GameContext = React.createContext({});
const renderSquare = (i) => {
  return <Square value={i} />;
};
// 下棋历史
const HistoryList = () => {
  const { history, changeStep, changeX,changeValues,changeLocation } = useContext(GameContext);
  const JumpTo = (move) => {
    if(move === 0){
      changeX(true)
      changeStep(0)
      changeValues([],true)
      changeLocation('')
    }
    changeStep(move);
    move % 2 === 0 ? changeX(true) : changeX(false);
  };
  const moves = history.map((step, move) => {
    const desc = move ? "Go to move #" + move : "Go to start game";
    return (
      <ol key={move}>
        <button onClick={() => JumpTo(move)}>{desc}</button>
      </ol>
    );
  });
  return moves;
};
// 每个方格
const Square = (props) => {
  const val = props.value;
  const {
    isX,
    history,
    changeX,
    changeValues,
    changeStep,
    stepNumber,
    changeLocation,
  } = useContext(GameContext);
  const historys = history.slice(0, stepNumber + 1);
  const current = historys[historys.length - 1];
  const squares = current.squares.slice();
  const winner = getWinner(current.squares);
  // 方格点击事件
  const handleClick = () => {
    if (winner || current.squares[val]) {
      return;
    }
    squares[val] = isX ? "X" : "O";
    changeX(!isX);
    changeValues(squares,false);
    changeStep(history.length);
    changeLocation(`[${Math.floor(val / 3 + 1)},${(val % 3) + 1}]`);
  };
  let winnerFlag = {};
  // 获胜后高亮显示连成一线的棋子
  if (winner) {
    const [a, b, c] = winner[1];
    if (a === val || b === val || c === val)
      winnerFlag = { color: "#bfbfbf", fontWeight: "bold" };
  }
  return (
    <div className={"square"} style={winnerFlag} onClick={() => handleClick()}>
      {current.squares[val]}
    </div>
  );
};

const Board = () => {
  const rows = [];
  let j = 0;
  // 获取九宫格
  for (let i = 0; i < 9; i += 3) {
    rows[j++] = (
      <div className={"board-row"} key={j}>
        {renderSquare(i)}
        {renderSquare(i + 1)}
        {renderSquare(i + 2)}
      </div>
    );
  }
  const { isX, history, location } = useContext(GameContext);
  const current = history[history.length - 1];
  let conclusion;
  // 判断是否平局
  const peace = current.squares.every((val) => {
    return val != null;
  });
  getWinner(current.squares)
    ? (conclusion = (
        <span>
          The winner :{" "}
          <span style={{ fontWeight: "bold", fontSize: 20,color:'red' }}>
            {getWinner(current.squares)[0]}
          </span>
        </span>
      ))
    : (conclusion = (
        <span>
          Next player :{" "}
          <span style={{ fontWeight: "bold", fontSize: 20 }}>
            {isX ? "X" : "O"}
          </span>
        </span>
      ));
  if (!getWinner(current.squares) && peace) {
    conclusion = <span>The game is draw</span>;
  }
  return (
    <>
      {/* 获取当前下棋情况 */}
      <div>{conclusion}</div>
      <div>
        Location of the recent move:
        <span style={{ fontWeight: "bold", fontSize: 20 }}>{location}</span>
      </div>
      {rows.slice()}
    </>
  );
};
const Game = () => {
  // 判断当前玩家
  const [isX, setX] = useState(true);
  // 存储下棋历史记录
  const [history, setHistory] = useState([{ squares: Array(9).fill(null) }]);
  // 记录当前步数值
  const [stepNumber, setStep] = useState(0);
  // 记录下棋坐标
  const [location, setLocation] = useState();
  const changeX = (x) => {
    setX(x);
  };
  const changeValues = (squares,clear) => {
    !clear?setHistory(history.concat([{ squares: squares }])):setHistory([{ squares: Array(9).fill(null) }]);
  };
  const changeStep = (val) => {
    setStep(val);
  };
  const changeLocation = (val) => {
    setLocation(val);
  };
  return (
    <div className={"wrapper"}>
      <GameContext.Provider
        value={{
          isX,
          history,
          stepNumber,
          changeX,
          changeValues,
          changeStep,
          location,
          changeLocation,
        }}
      >
        <Board />
        <HistoryList />
      </GameContext.Provider>
    </div>
  );
};
// 获取胜利者
const getWinner = (squares) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c])
      return [squares[a], lines[i]];
  }
  return null;
};
ReactDOM.render(<Game />, document.getElementById("root"));
