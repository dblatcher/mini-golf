import { MiniGolfLevel } from "./MiniGolfLevel";

interface ScoreCardRow {
    index: number
    name: string
    shots: number
    par: number
    score: number
}

class ScoreCard {
    rows: ScoreCardRow[]

    constructor(levels: MiniGolfLevel[], shots: number[]) {

        this.rows = levels.map((level, index) => {
            return {
                index,
                name: level.data.name || `Hole ${index + 1}`,
                shots: typeof shots[index] == 'number' ? shots[index] : null,
                par: level.data.par,
                score: typeof shots[index] == 'number' ? shots[index] - level.data.par : null,
            } as ScoreCardRow
        })

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
            tableBody.appendChild(makeRow(row))
        })

        table.innerHTML += `
        <thead>
            <tr>
                <th colspan="3"></th><th>${this.totalScore} over par</th>
            </tr>
        </thead>
        `

        return table

        function makeRow(rowData: ScoreCardRow) {
            const row = document.createElement('tr')
            row.appendChild(makeCell(rowData.name, true));
            row.appendChild(makeCell(rowData.par, false));
            row.appendChild(makeCell(rowData.shots !== null ? rowData.shots : "", false));
            row.appendChild(makeCell(rowData.score !== null ? rowData.score + " over par" : "", false));
            return row
        }

        function makeCell(content: string | number, isTh = false) {
            const cell = document.createElement(isTh ? 'th' : 'td')
            const isEmpty = content == null || typeof content === 'undefined';
            cell.innerHTML = !isEmpty ? content.toString() : "";
            return cell
        }
    }

}

export { ScoreCard }