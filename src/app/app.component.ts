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
    board: Board;
    speed: number;
    object: any;

    constructor(private sanitizer: DomSanitizer) {
        console.log("Started");
        this.createGrid();
    }

    createGrid() {
        let boardData = {} as Board;
        this.board = boardData;
        let tableHTML = "";
        this.board.height = this.height = Math.floor((document.documentElement.clientHeight) / 15);
        this.board.width = this.width = Math.floor(document.documentElement.clientWidth / 25);
        this.board.start = this.start = Math.floor(this.height / 2).toString() + "-" + Math.floor(this.width / 4).toString();
        this.board.target = this.target = Math.floor(this.height / 2).toString() + "-" + Math.floor(3 * this.width / 4).toString();
        this.board.speed = "average";

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
        nodesToAnimate = [];
        while (structure.length) {
            let currentNode = name === "bfs" ? structure.shift() : structure.pop();
            nodesToAnimate.push(currentNode);
            if (name === "dfs") exploredNodes[currentNode.id] = true;
            currentNode.status = "visited";
            if (currentNode.id === target) {
                console.log("success");
                this.board.nodesToAnimate = nodesToAnimate;
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

    RunBFS() {
        console.log("Test the call");
        let name = "dfs";
        //this.createGrid();
        this.UnweightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, name);
        this.AnimateTheNodes();

    }

    AnimateTheNodes() {
        let nodes = this.board.nodesToAnimate.slice(0);
        this.speed = this.board.speed === "fast" ?
            0 : this.board.speed === "average" ?
                25 : 50;
        console.log(nodes);
        console.log("speed:", this.speed);
        for (let i = 0; i < nodes.length; i++) {
            setTimeout(() => {
                this.change(nodes[i], nodes[i - 1]);
            }, this.speed*(i+1));
        }
    }

    change(currentNode, previousNode, bidirectional = false) {
        let currentHTMLNode = document.getElementById(currentNode.id);
        let relevantClassNames = ["start", "target", "object", "visitedStartNodeBlue", "visitedStartNodePurple", "visitedObjectNode", "visitedTargetNodePurple", "visitedTargetNodeBlue"];
        if (!relevantClassNames.includes(currentHTMLNode.className)) {
            currentHTMLNode.className = !bidirectional ?
                "current" : currentNode.weight === 15 ?
                    "visited weight" : "visited";
        }
        if (currentHTMLNode.className === "visitedStartNodePurple" && !this.object) {
            currentHTMLNode.className = "visitedStartNodeBlue";
        }
        if (currentHTMLNode.className === "target" && this.object) {
            currentHTMLNode.className = "visitedTargetNodePurple";
        }
        if (previousNode) {
            let previousHTMLNode = document.getElementById(previousNode.id);
            if (!relevantClassNames.includes(previousHTMLNode.className)) {
                if (this.object) {
                    previousHTMLNode.className = previousNode.weight === 15 ? "visitedobject weight" : "visitedobject";
                } else {
                    previousHTMLNode.className = previousNode.weight === 15 ? "visited weight" : "visited";
                }
            }
        }
    }
}


export interface Board {
    height?: number;
    width?: number;
    start?: string;
    target?: string;
    object?: string;
    boardArray?: [];
    nodes?: {};
    nodesToAnimate?: string[];
    objectNodesToAnimate?: [];
    shortestPathNodesToAnimate?: [];
    objectShortestPathNodesToAnimate?: [];
    wallsToAnimate?: [];
    mouseDown?: boolean;
    pressedNodeStatus?: string;
    previouslyPressedNodeStatus?: null;
    previouslySwitchedNode?: null;
    previouslySwitchedNodeWeight?: 0;
    keyDown?: boolean;
    algoDone?: boolean;
    currentAlgorithm?: null;
    currentHeuristic?: null;
    numberOfObjects?: number;
    isObject?: boolean;
    buttonsOn?: boolean;
    speed?: string;
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