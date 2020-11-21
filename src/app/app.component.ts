import { Component, ViewEncapsulation } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class AppComponent {
    title = 'Datastructure';
    htmlStr: any;
    htmlStrTest: any;
    height: number;
    width: number;
    start: string;
    target: string;
    boardArray = [];
    nodes = [];
    nodesToAnimate = [];
    constructor(private sanitizer: DomSanitizer) {
        console.log("Started");
        this.createGrid();
    }

    RunBFS() {
        console.log("Test the call");
        let name = "bfs";
        this.UnweightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, name);
        console.log(this.nodes);
        this.AnimateTheNodes();

    }

    AnimateTheNodes() {

    }

    createGrid() {
        let tableHTML = "";
        this.height = Math.floor((document.documentElement.clientHeight) / 15);
        this.width = Math.floor(document.documentElement.clientWidth / 25);
        this.start = Math.floor(this.height / 2).toString() + "-" + Math.floor(this.width / 4).toString();
        this.target = Math.floor(this.height / 2).toString() + "-" + Math.floor(3 * this.width / 4).toString();
        console.log(this.height, ":", this.width, ":", this.start, ":", this.target);
        for (let r = 0; r < this.height; r++) {
            let currentArrayRow = [];
            let currentHTMLRow = `<tr id="row ${r}">`;
            for (let c = 0; c < this.width; c++) {
                let newNodeId = `${r}-${c}`,
                    newNodeClass;
                if (r === Math.floor(this.height / 2) && c === Math.floor(this.width / 4)) {
                    newNodeClass = "start";
                    this.start = `${newNodeId}`;
                } else if (r === Math.floor(this.height / 2) && c === Math.floor(3 * this.width / 4)) {
                    newNodeClass = "target";
                    this.target = `${newNodeId}`;
                } else {
                    newNodeClass = "unvisited";
                }
                let newNode = {} as Node;
                newNode.id = newNodeId;
                newNode.status = newNodeClass;
                newNode.otherstatus = newNodeClass;
                currentArrayRow.push(newNode);
                currentHTMLRow += `<td id="${newNodeId}" class="${newNodeClass}"></td>`;
                this.nodes[newNodeId] = newNode;
            }
            this.boardArray.push(currentArrayRow);
            tableHTML += currentHTMLRow + `</tr>`;
        }
        this.htmlStr = this.sanitizer.bypassSecurityTrustHtml(tableHTML);
    };

    UnweightedSearchAlgorithm(nodes: Node[], start: string, target: string, nodesToAnimate: string[], boardArray: string[], name: string) {
        if (!start || !target || start === target) {
            return false;
        }
        let structure = [nodes[start]];
        let exploredNodes = {
            start: true
        };
        while (structure.length) {
            let currentNode = name === "bfs" ? structure.shift() : structure.pop();
            nodesToAnimate.push(currentNode);
            if (name === "dfs") exploredNodes[currentNode.id] = true;
            currentNode.status = "visited";
            if (currentNode.id === target) {
                console.log("success");
                return "success";
            }
            let currentNeighbors = this.getNeighbors(currentNode.id, nodes, boardArray, name);
            currentNeighbors.forEach(neighbor => {
                if (!exploredNodes[neighbor]) {
                    if (name === "bfs") exploredNodes[neighbor] = true;
                    nodes[neighbor].previousNode = currentNode.id;
                    structure.push(nodes[neighbor]);
                }
            });
        }
        return false;
    }

    getNeighbors(id, nodes, boardArray, name) {
        let coordinates = id.split("-");
        let x = parseInt(coordinates[0]);
        let y = parseInt(coordinates[1]);
        let neighbors = [];
        let potentialNeighbor;
        if (boardArray[x - 1] && boardArray[x - 1][y]) {
            potentialNeighbor = `${(x - 1).toString()}-${y.toString()}`
            if (nodes[potentialNeighbor].status !== "wall") {
                if (name === "bfs") {
                    neighbors.push(potentialNeighbor);
                } else {
                    neighbors.unshift(potentialNeighbor);
                }
            }
        }
        if (boardArray[x][y + 1]) {
            potentialNeighbor = `${x.toString()}-${(y + 1).toString()}`
            if (nodes[potentialNeighbor].status !== "wall") {
                if (name === "bfs") {
                    neighbors.push(potentialNeighbor);
                } else {
                    neighbors.unshift(potentialNeighbor);
                }
            }
        }
        if (boardArray[x + 1] && boardArray[x + 1][y]) {
            potentialNeighbor = `${(x + 1).toString()}-${y.toString()}`
            if (nodes[potentialNeighbor].status !== "wall") {
                if (name === "bfs") {
                    neighbors.push(potentialNeighbor);
                } else {
                    neighbors.unshift(potentialNeighbor);
                }
            }
        }
        if (boardArray[x][y - 1]) {
            potentialNeighbor = `${x.toString()}-${(y - 1).toString()}`
            if (nodes[potentialNeighbor].status !== "wall") {
                if (name === "bfs") {
                    neighbors.push(potentialNeighbor);
                } else {
                    neighbors.unshift(potentialNeighbor);
                }
            }
        }
        return neighbors;
    }
}


export interface Board {
    height: number;
    width: number;
    start: string;
    target: string;
    object: string;
    boardArray: [];
    nodes: {};
    nodesToAnimate: [];
    objectNodesToAnimate: [];
    shortestPathNodesToAnimate: [];
    objectShortestPathNodesToAnimate: [];
    wallsToAnimate: [];
    mouseDown: boolean;
    pressedNodeStatus: "normal";
    previouslyPressedNodeStatus: null;
    previouslySwitchedNode: null;
    previouslySwitchedNodeWeight: 0;
    keyDown: false;
    algoDone: false;
    currentAlgorithm: null;
    currentHeuristic: null;
    numberOfObjects: 0;
    isObject: false;
    buttonsOn: false;
    speed: "fast";
}

export interface Node {
    id?: string;
    status?: string;
    previousNode?: null;
    path?: null;
    direction?: null;
    storedDirection?: null;
    distance?: number;
    totalDistance?: number;
    heuristicDistance?: null;
    weight?: number;
    relatesToObject?: boolean;
    overwriteObjectRelation?: boolean;
    otherid?: string;
    otherstatus?: string;
    otherpreviousNode?: null;
    otherpath?: null;
    otherdirection?: null;
    otherstoredDirection?: null;
    otherdistance?: number;
    otherweight?: number;
    otherrelatesToObject?: boolean;
    otheroverwriteObjectRelation?: boolean;
}