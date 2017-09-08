import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    let className = 'square';
    if (props.winner) {
        className += ' winner';
    }

    return (
        <button className={className} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        const winner = this.props.winner;
        const winnerSquare = winner && winner.squares.includes(i);

        return (
            <Square key={i}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                winner={winnerSquare}
            />
        );
    }

    renderRow(index) {
        let squares = [];
        for (let i = 0; i < this.props.boardSize; i++) {
            squares.push(this.renderSquare((index * this.props.boardSize) + i));
        }

        return (
            <div key={index} className="board-row">
                {squares}
            </div>
        );
    }

    render() {
        let rows = [];
        for (let i = 0; i < this.props.boardSize; i++) {
            rows.push(this.renderRow(i));
        }

        return (
            <div>{rows}</div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(props.boardSize ** 2).fill(null),
                moveLocation: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            sortAscending: true,
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        const boardSize = this.props.boardSize;
        const toWin = this.props.toWin;
        if (calculateWinner(squares, boardSize, toWin) || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';

        const moveX = (i % this.props.boardSize) + 1;
        const moveY = Math.floor(i / this.props.boardSize) + 1;

        this.setState({
            history: history.concat([{
                squares: squares,
                moveX: moveX,
                moveY: moveY,
            }]),
            stepNumber: history.length,
            xIsNext: ! this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    changeSortOrder() {
        this.setState({
            sortAscending: ! this.state.sortAscending,
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        const boardSize = this.props.boardSize;
        const toWin = this.props.toWin;
        const winner = calculateWinner(current.squares, boardSize, toWin);

        const moves = history.map((step, move) => {
            const moveX = history[move].moveX;
            const moveY = history[move].moveY;

            const desc = move ?
                'Move #' + move + ' (' + moveX + ', ' + moveY + ')' :
                'Game start';

            let style = {};
            if (move === this.state.stepNumber) {
                style = {
                    fontWeight: 'bold',
                };
            }

            return (
                <li key={move}>
                    <a href="#" onClick={() => this.jumpTo(move)} style={style}>{desc}</a>
                </li>
            );
        });

        if (! this.state.sortAscending) {
            moves.reverse();
        }

        let status;
        if (winner) {
            status = 'Winner: ' + winner.player;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        const sort = this.state.sortAscending ? 'ascending' : 'descending';
        const nextSort = this.state.sortAscending ? 'descending' : 'ascending';

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        boardSize={this.props.boardSize}
                        squares={current.squares}
                        onClick={(i) => this.handleClick(i)}
                        winner={winner}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>
                        <span>Current sort: {sort}</span>
                        <a href="#" onClick={() => this.changeSortOrder()} className="change-sort">Sort {nextSort}</a>
                    </div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

function calculateWinner(squares, size, toWin) {
    let lines = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const index = (row * size) + col;

            // horizontal lines
            if (size - col >= toWin) {
                let config = [];
                for (let k = 0; k < toWin; k++) {
                    config.push(index + k);
                }
                lines.push(config);
            }

            // vertical lines
            if (size - row >= toWin) {
                let config = [];
                for (let k = 0; k < toWin; k++) {
                    config.push(index + (k*size));
                }
                lines.push(config);
            }

            // diagonals top left to bottom right
            if (size - row >= toWin && size - col >= toWin) {
                let config = [];
                for (let k = 0; k < toWin; k++) {
                    config.push(index + k + (k*size));
                }
                lines.push(config);
            }

            // diagonals bottom left to top right
            if (row - toWin + 1 >= 0 && size - col >= toWin) {
                let config = [];
                for (let k = 0; k < toWin; k++) {
                    config.push(index + k - (k*size));
                }
                lines.push(config);
            }
        }
    }

    // for each possible winning combination, figure out if the given set of
    // squares contains that combination owned by a single player
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const startIndex = line[0];
        const player = squares[startIndex];
        if ( player ) {
            let found = true;
            for (let j = 0; j < line.length; j++) {
                if (player !== squares[line[j]]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return {
                    player: player,
                    squares: line,
                }
            }
        }
    }

    return null;
}

// ========================================

ReactDOM.render(
    <Game boardSize="4" toWin="3" />,
    document.getElementById('root')
);
