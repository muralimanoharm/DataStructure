import { Component, ViewEncapsulation } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class AppComponent {

    title = 'DataStructure';
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
    speedV: string
    object: any;
    currAlgo: any;
    breakpoint:number;

    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'top';

    algos: any[] = [
        { value: 'bfs', viewValue: 'Breath First Search' },
        { value: 'dfs', viewValue: 'Depth First Search' },
    ];

    speedc: any[] = [
        { value: 'slow', viewValue: 'Slow' },
        { value: 'average', viewValue: 'Average' },
        { value: 'fast', viewValue: 'fast' }
    ];

    constructor(private sanitizer: DomSanitizer, private _snackBar: MatSnackBar) {
        console.log("Started");
        this.createGrid();
    }

    ngOnInit() {
        this.breakpoint = (window.innerWidth <= 400) ? 1 : 6;
    }
    
    onResize(event) {
      this.breakpoint = (event.target.innerWidth <= 400) ? 1 : 6;
    }

    createGrid() {
        let boardData = {} as Board;
        this.board = boardData;
        let tableHTML = "";
        this.currAlgo = "";
        this.speedV = "";
        this.board.height = this.height = Math.floor((document.documentElement.clientHeight) / 25);
        this.board.width = this.width = Math.floor(document.documentElement.clientWidth / 25);
        this.board.start = this.start = Math.floor(this.height / 2).toString() + "-" + Math.floor(this.width / 4).toString();
        this.board.target = this.target = Math.floor(this.height / 2).toString() + "-" + Math.floor(3 * this.width / 4).toString();

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
        this.htmlStrTest = this.sanitizer.bypassSecurityTrustHtml(tableHTML);
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

    RunAlgorithm() {
        console.log("Test the call");
        if (this.currAlgo == "") {
            console.log("Please Select an algorithm");
            this.ShowUserMessage("Please Select an algorithm");
        }else if (this.speedV == "") {
            console.log("Please Select a Speed Level");
            this.ShowUserMessage("Please Select a Speed Level");
        } else {
            let name = this.currAlgo;
            this.board.speed = this.speedV;
            this.ClearPath();
            this.UnweightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, name);
            this.AnimateTheNodes();
        }

    }

    ClearPath()
    {
        let start = this.nodes[this.start];
        let target = this.nodes[this.target];
        //let object = this.numberOfObjects ? this.nodes[this.object] : null;
        let object = null;
        start.status = "start";
        document.getElementById(start.id).className = "start";
        target.status = "target";
        document.getElementById(target.id).className = "target";
        if (object) {
            object.status = "object";
            document.getElementById(object.id).className = "object";
        }

        Object.keys(this.nodes).forEach(id => {
            let currentNode = this.nodes[id];
            currentNode.previousNode = null;
            currentNode.distance = Infinity;
            currentNode.totalDistance = Infinity;
            currentNode.heuristicDistance = null;
            currentNode.direction = null;
            currentNode.storedDirection = null;
            currentNode.relatesToObject = false;
            currentNode.overwriteObjectRelation = false;
            currentNode.otherpreviousNode = null;
            currentNode.otherdistance = Infinity;
            currentNode.otherdirection = null;
            let currentHTMLNode = document.getElementById(id);
            let relevantStatuses = ["wall", "start", "target", "object"];
            if ((!relevantStatuses.includes(currentNode.status) || currentHTMLNode.className === "visitedobject") && currentNode.weight !== 15) {
                currentNode.status = "unvisited";
                currentHTMLNode.className = "unvisited";
            } else if (currentNode.weight === 15) {
                currentNode.status = "unvisited";
                currentHTMLNode.className = "unvisited weight";
            }
        });
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
            }, this.speed * (i + 1));
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

    ShowUserMessage(message: string) {
        this._snackBar.open(message, "", {
            duration: 800,
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
        });
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