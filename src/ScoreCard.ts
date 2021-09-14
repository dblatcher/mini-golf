import { MiniGolfLevel } from "./MiniGolfLevel";


function makeCell(content: string | number, isTh = false) {
    const cell = document.createElement(isTh ? 'th' : 'td')
    const isEmpty = content == null || typeof content === 'undefined';
    cell.innerHTML = !isEmpty ? content.toString() : "";
    return cell
}

function formatScore(score: number): string {
    return score === null
        ? ""
        : score == 0 ? "par"
            : score > 0
                ? score + " over par"
                : -score + " under par"
}


class ScoreCardRow {
    level: MiniGolfLevel
    shots: number
    status: "NOT STARTED" | "CURRENT" | "DONE"

    constructor(level: MiniGolfLevel, shots: number, status: "NOT STARTED" | "CURRENT" | "DONE") {
        this.level = level
        this.shots = shots
        this.status = status
    }

    get score() {
        if (this.status === "NOT STARTED") { return null }
        return this.shots - this.level.data.par
    }

    makeRow() {
        const { name, par } = this.level.data
        const row = document.createElement('tr')
        row.appendChild(makeCell(name, true));
        row.appendChild(makeCell(par, false));
        row.appendChild(makeCell(this.status !== "NOT STARTED" ? this.shots : "", false));
        row.appendChild(makeCell(formatScore(this.score), false));
        return row
    }
}

class ScoreCard {
    rows: ScoreCardRow[]

    constructor(levels: MiniGolfLevel[], shots?: number[]) {
        this.rows = levels.map((level, index) => {
            return new ScoreCardRow(level, shots ? shots[index] : 0, index == 0 ? "CURRENT" : "NOT STARTED")
        })
    }

    setCurrentLevel(level: MiniGolfLevel) {
        const newCurrentRow = this.rows.find(row => row.level == level);
        if (!newCurrentRow) { return }
        const oldCurrentRow = this.rows.find(row => row.status == "CURRENT");

        newCurrentRow.status = "CURRENT"
        if (oldCurrentRow && oldCurrentRow !== newCurrentRow) { oldCurrentRow.status = "DONE" }
    }

    clear() {
        this.rows.forEach((row, index) => {
            row.shots = 0;
            row.status = index == 0 ? "CURRENT" : "NOT STARTED";
        })
    }

    read(level: MiniGolfLevel) {
        const row = this.rows.find(row => row.level == level);
        if (!row) { return undefined }
        return row.shots
    }

    updateAll(shotsThisRound: number[]) {
        this.rows.forEach((row, index) => {
            row.shots = shotsThisRound[index]
        })
    }

    update(level: MiniGolfLevel, shots: number) {
        const row = this.rows.find(row => row.level == level);
        if (!row) { return }
        row.shots = shots;
    }

    get totalScore() {
        let score = 0;

        this.rows.forEach(row => {
            if (typeof row.score == 'number') { score += row.score }
        })
        return score;
    }

    renderTable() {
        const table = document.createElement('table');

        table.innerHTML += `
        <thead>
            <tr>
                <th></th><th>Par</th><th>Shots</th><th>Score</th>
            </tr>
        </thead>
        `

        const tableBody = document.createElement('tbody');
        this.rows.forEach(row => {
            tableBody.appendChild(row.makeRow())
        })
        table.appendChild(tableBody)

        table.innerHTML += `
        <tfoot>
            <tr>
                <th colspan="3"></th><th>${formatScore(this.totalScore)}</th>
            </tr>
        </tfoot>
        `

        return table
    }

}

export { ScoreCard }