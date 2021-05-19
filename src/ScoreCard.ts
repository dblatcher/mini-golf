import { MiniGolfLevel } from "./MiniGolfLevel";


function makeCell(content: string | number, isTh = false) {
    const cell = document.createElement(isTh ? 'th' : 'td')
    const isEmpty = content == null || typeof content === 'undefined';
    cell.innerHTML = !isEmpty ? content.toString() : "";
    return cell
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
        row.appendChild(makeCell(this.score !== null
            ? this.score > 0
                ? this.score + " over par"
                : -this.score + " under par"
            : "",
            false));
        return row
    }
}

class ScoreCard {
    rows: ScoreCardRow[]

    constructor(levels: MiniGolfLevel[], shots: number[] = null) {
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
                <th></th><th>par</th><th>shots</th><th>score</th>
            </tr>
        </thead>
        `
        const tableBody = document.createElement('tbody');
        table.appendChild(tableBody)

        this.rows.forEach(row => {
            tableBody.appendChild(row.makeRow())
        })

        table.innerHTML += `
        <tfoot>
            <tr>
                <th colspan="3"></th><th>${Math.abs(this.totalScore)} ${this.totalScore < 0 ? 'under' : 'over'} par</th>
            </tr>
        </tfoot>
        `

        return table

    }

}

export { ScoreCard }