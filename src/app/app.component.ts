import { Component, HostListener, ViewEncapsulation } from '@angular/core';
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
    algoDone: boolean;
    breakpoint: number;
    previouslySwitchedNode: any;
    previouslyPressedNodeStatus: any;
    keyDown: any;
    type: string;
    pressedNodeStatus = "normal";
    previouslySwitchedNodeWeight = 0;
    currentAlgorithm: string;
    buttonsOn: boolean;
    currentNodesToAnimate: any[];
    mazeType: string;
    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'top';

    algosType: any[] = [
        { value: 'unweighted', viewValue: 'Un Weighted' },
        { value: 'weighted', viewValue: 'Weighted' },
    ];

    weighted: any[] = [
        { value: 'bfs', viewValue: 'Breath First Search' },
        { value: 'dfs', viewValue: 'Depth First Search' },
    ];

    unweighted: any[] = [
        { value: 'bfs', viewValue: 'Breath First Search' },
        { value: 'dfs', viewValue: 'Depth First Search' },
    ];

    algos:any[];

    speedc: any[] = [
        { value: 'slow', viewValue: 'Slow' },
        { value: 'average', viewValue: 'Average' },
        { value: 'fast', viewValue: 'fast' }
    ];

    maze: any[] = [
        { value: 'Rec1', viewValue: 'Recursive Division' },
        { value: 'Rec2', viewValue: 'Recursive Division (vertical skew)' },
        { value: 'Rec3', viewValue: 'Recursive Division (horizontal skew)' },
        { value: 'brm', viewValue: 'Basic Random Maze' },
        { value: 'bwm', viewValue: 'Basic Weight Maze' },
        { value: 'ssp', viewValue: 'Simple Stair Pattern' }
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

    @HostListener('click', ['$event']) onClick(event) {
        let board = this.board;
        for (let r = 0; r < board.height; r++) {
            for (let c = 0; c < board.width; c++) {
                let currentId = `${r}-${c}`;
                let currentNode = this.getNode(currentId);
                let currentElement = document.getElementById(currentId);
                currentElement.onmousedown = (e) => {
                    e.preventDefault();
                    if (this.buttonsOn) {
                        board.mouseDown = true;
                        if (currentNode.status === "start" || currentNode.status === "target" || currentNode.status === "object") {
                            board.pressedNodeStatus = currentNode.status;
                        } else {
                            board.pressedNodeStatus = "normal";
                            this.changeNormalNode(currentNode);
                        }
                    }
                }
                currentElement.onmouseup = () => {
                    if (this.buttonsOn) {
                        board.mouseDown = false;
                        if (board.pressedNodeStatus === "target") {
                            board.target = currentId;
                        } else if (board.pressedNodeStatus === "start") {
                            board.start = currentId;
                        } else if (board.pressedNodeStatus === "object") {
                            board.object = currentId;
                        }
                        board.pressedNodeStatus = "normal";
                    }
                }
                currentElement.onmouseenter = () => {
                    if (this.buttonsOn) {
                        if (board.mouseDown && board.pressedNodeStatus !== "normal") {
                            this.changeSpecialNode(currentNode);
                            if (board.pressedNodeStatus === "target") {
                                board.target = currentId;
                                if (board.algoDone) {
                                    //board.redoAlgorithm();
                                }
                            } else if (board.pressedNodeStatus === "start") {
                                board.start = currentId;
                                if (board.algoDone) {
                                    //board.redoAlgorithm();
                                }
                            } else if (board.pressedNodeStatus === "object") {
                                board.object = currentId;
                                if (board.algoDone) {
                                    //board.redoAlgorithm();
                                }
                            }
                        } else if (board.mouseDown) {
                            this.changeNormalNode(currentNode);
                        }
                    }
                }
                currentElement.onmouseleave = () => {
                    if (this.buttonsOn) {
                        if (board.mouseDown && board.pressedNodeStatus !== "normal") {
                            this.changeSpecialNode(currentNode);
                        }
                    }
                }
            }
        }
    };

    /*GRID RELATED FUNCTIONS*/

    createGrid() {
        let boardData = {} as Board;
        this.board = boardData;
        let tableHTML = "";
        this.currAlgo = "";
        this.speedV = "";
        this.algoDone = false;
        this.buttonsOn = true;
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
        this.board.nodes = this.nodes;
    };

    getNode(id) {
        let coordinates = id.split("-");
        let r = parseInt(coordinates[0]);
        let c = parseInt(coordinates[1]);
        return this.boardArray[r][c];
    };

    changeSpecialNode(currentNode) {
        let element = document.getElementById(currentNode.id),
            previousElement;
        if (this.previouslySwitchedNode) previousElement = document.getElementById(this.previouslySwitchedNode.id);
        if (currentNode.status !== "target" && currentNode.status !== "start" && currentNode.status !== "object") {
            if (this.previouslySwitchedNode) {
                this.previouslySwitchedNode.status = this.previouslyPressedNodeStatus;
                previousElement.className = this.previouslySwitchedNodeWeight === 15 ?
                    "unvisited weight" : this.previouslyPressedNodeStatus;
                this.previouslySwitchedNode.weight = this.previouslySwitchedNodeWeight === 15 ?
                    15 : 0;
                this.previouslySwitchedNode = null;
                this.previouslySwitchedNodeWeight = currentNode.weight;

                this.previouslyPressedNodeStatus = currentNode.status;
                element.className = this.pressedNodeStatus;
                currentNode.status = this.pressedNodeStatus;

                currentNode.weight = 0;
            }
        } else if (currentNode.status !== this.pressedNodeStatus && !this.algoDone) {
            this.previouslySwitchedNode.status = this.pressedNodeStatus;
            previousElement.className = this.pressedNodeStatus;
        } else if (currentNode.status === this.pressedNodeStatus) {
            this.previouslySwitchedNode = currentNode;
            element.className = this.previouslyPressedNodeStatus;
            currentNode.status = this.previouslyPressedNodeStatus;
        }
    };

    changeNormalNode(currentNode) {
        let element = document.getElementById(currentNode.id);
        let relevantStatuses = ["start", "target", "object"];
        let unweightedAlgorithms = ["dfs", "bfs"]
        if (!this.keyDown) {
            if (!relevantStatuses.includes(currentNode.status)) {
                element.className = currentNode.status !== "wall" ?
                    "wall" : "unvisited";
                currentNode.status = element.className !== "wall" ?
                    "unvisited" : "wall";
                currentNode.weight = 0;
            }
        } else if (this.keyDown === 87 && !unweightedAlgorithms.includes(this.currentAlgorithm)) {
            if (!relevantStatuses.includes(currentNode.status)) {
                element.className = currentNode.weight !== 15 ?
                    "unvisited weight" : "unvisited";
                currentNode.weight = element.className !== "unvisited weight" ?
                    0 : 15;
                currentNode.status = "unvisited";
            }
        }
    };
    /**COMMON ALGORITHM FUNCTIONS */
    RunAlgorithm() {
        console.log("Test the call");
        if (this.currAlgo == "") {
            console.log("Please Select an algorithm");
            this.ShowUserMessage("Please Select an algorithm");
        } else if (this.speedV == "") {
            console.log("Please Select a Speed Level");
            this.ShowUserMessage("Please Select a Speed Level");
        } else {
            let name = this.currAlgo;
            this.board.speed = this.speedV;
            this.type = "unweighted";
            this.ClearPath();
            this.UnweightedSearchAlgorithm(this.nodes, this.start, this.target, this.nodesToAnimate, this.boardArray, name);
            this.AnimateTheNodes();
        }

    }

    ClearPath() {
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

    ClearWalls() {
        this.ClearPath();
        Object.keys(this.nodes).forEach(id => {
            let currentNode = this.nodes[id];
            let currentHTMLNode = document.getElementById(id);
            if (currentNode.status === "wall" || currentNode.weight === 15) {
                currentNode.status = "unvisited";
                currentNode.weight = 0;
                currentHTMLNode.className = "unvisited";
            }
        });
    }

    /*UNWEIGHTED SEARCH ALGORITHM*/
    SetAlgoType(value:string)
    {
        if(value == "weighted"){
            this.algos = this.weighted;
        }else if(value == "unweighted"){
            this.algos = this.unweighted;
        }
    }

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
                this.board.nodes = this.nodes;
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

    AnimateTheNodes() {
        let nodes = this.board.nodesToAnimate.slice(0);
        this.speed = this.board.speed === "fast" ?
            5 : this.board.speed === "average" ?
                20 : 70;
        console.log(nodes);
        console.log("speed:", this.speed);
        for (let i = 0; i < nodes.length; i++) {
            setTimeout(() => {
                this.change(nodes[i], nodes[i - 1]);
                if (i == nodes.length - 1) {
                    this.drawShortestPathTimeout(this.target, this.start, this.type, this.object);
                    this.DrawShortestPath(0);
                }

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

    /*Shortets Path Finding*/
    drawShortestPathTimeout(targetNodeId, startNodeId, type, object) {
        let board = this.board;
        let currentNode;
        let secondCurrentNode;

        if (board.currentAlgorithm !== "bidirectional") {
            currentNode = board.nodes[board.nodes[targetNodeId].previousNode];
            if (object) {
                board.objectShortestPathNodesToAnimate.push("object");
                this.currentNodesToAnimate = board.objectShortestPathNodesToAnimate.concat(board.shortestPathNodesToAnimate);
            } else {
                this.currentNodesToAnimate = [];
                while (currentNode.id !== startNodeId) {
                    this.currentNodesToAnimate.unshift(currentNode);
                    currentNode = board.nodes[currentNode.previousNode];
                }
            }
        } else {
            if (board.middleNode !== board.target && board.middleNode !== board.start) {
                currentNode = board.nodes[board.nodes[board.middleNode].previousNode];
                secondCurrentNode = board.nodes[board.nodes[board.middleNode].otherpreviousNode];
                if (secondCurrentNode.id === board.target) {
                    board.nodes[board.target].direction = this.GetDistance(board.nodes[board.middleNode], board.nodes[board.target])[2];
                }
                if (object) {

                } else {
                    this.currentNodesToAnimate = [];
                    board.nodes[board.middleNode].direction = this.GetDistance(currentNode, board.nodes[board.middleNode])[2];
                    while (currentNode.id !== startNodeId) {
                        this.currentNodesToAnimate.unshift(currentNode);
                        currentNode = board.nodes[currentNode.previousNode];
                    }
                    this.currentNodesToAnimate.push(board.nodes[board.middleNode]);
                    while (secondCurrentNode.id !== targetNodeId) {
                        if (secondCurrentNode.otherdirection === "left") {
                            secondCurrentNode.direction = "right";
                        } else if (secondCurrentNode.otherdirection === "right") {
                            secondCurrentNode.direction = "left";
                        } else if (secondCurrentNode.otherdirection === "up") {
                            secondCurrentNode.direction = "down";
                        } else if (secondCurrentNode.otherdirection === "down") {
                            secondCurrentNode.direction = "up";
                        }
                        this.currentNodesToAnimate.push(secondCurrentNode);
                        if (secondCurrentNode.otherpreviousNode === targetNodeId) {
                            board.nodes[board.target].direction = this.GetDistance(secondCurrentNode, board.nodes[board.target])[2];
                        }
                        secondCurrentNode = board.nodes[secondCurrentNode.otherpreviousNode]
                    }
                }
            } else {
                this.currentNodesToAnimate = [];
                let target = board.nodes[board.target];
                this.currentNodesToAnimate.push(board.nodes[target.previousNode], target);
            }

        }
    }

    GetDistance(nodeOne, nodeTwo) {
        let currentCoordinates = nodeOne.id.split("-");
        let targetCoordinates = nodeTwo.id.split("-");
        let x1 = parseInt(currentCoordinates[0]);
        let y1 = parseInt(currentCoordinates[1]);
        let x2 = parseInt(targetCoordinates[0]);
        let y2 = parseInt(targetCoordinates[1]);
        if (x2 < x1) {
            if (nodeOne.direction === "up") {
                return [1, ["f"], "up"];
            } else if (nodeOne.direction === "right") {
                return [2, ["l", "f"], "up"];
            } else if (nodeOne.direction === "left") {
                return [2, ["r", "f"], "up"];
            } else if (nodeOne.direction === "down") {
                return [3, ["r", "r", "f"], "up"];
            }
        } else if (x2 > x1) {
            if (nodeOne.direction === "up") {
                return [3, ["r", "r", "f"], "down"];
            } else if (nodeOne.direction === "right") {
                return [2, ["r", "f"], "down"];
            } else if (nodeOne.direction === "left") {
                return [2, ["l", "f"], "down"];
            } else if (nodeOne.direction === "down") {
                return [1, ["f"], "down"];
            }
        }
        if (y2 < y1) {
            if (nodeOne.direction === "up") {
                return [2, ["l", "f"], "left"];
            } else if (nodeOne.direction === "right") {
                return [3, ["l", "l", "f"], "left"];
            } else if (nodeOne.direction === "left") {
                return [1, ["f"], "left"];
            } else if (nodeOne.direction === "down") {
                return [2, ["r", "f"], "left"];
            }
        } else if (y2 > y1) {
            if (nodeOne.direction === "up") {
                return [2, ["r", "f"], "right"];
            } else if (nodeOne.direction === "right") {
                return [1, ["f"], "right"];
            } else if (nodeOne.direction === "left") {
                return [3, ["r", "r", "f"], "right"];
            } else if (nodeOne.direction === "down") {
                return [2, ["l", "f"], "right"];
            }
        }
    }
    /**SHORTEST PATH ALGORITHM */

    DrawShortestPath(index: number) {
        if (!this.currentNodesToAnimate.length) {
            this.currentNodesToAnimate.push(this.board.nodes[this.board.start]);
        }
        setTimeout(() => {
            if (index === 0) {
                this.ShortestPathChange(this.currentNodesToAnimate[index]);
            } else if (index < this.currentNodesToAnimate.length) {
                this.ShortestPathChange(this.currentNodesToAnimate[index], this.currentNodesToAnimate[index - 1]);
            } else if (index === this.currentNodesToAnimate.length) {
                this.ShortestPathChange(this.board.nodes[this.board.target], this.currentNodesToAnimate[index - 1], "isActualTarget");
            }
            if (index > this.currentNodesToAnimate.length) {
                //this.board.toggleButtons();
                return;
            }
            this.DrawShortestPath(index + 1);
        }, this.speed)
    }

    ShortestPathChange(currentNode, previousNode = null, isActualTarget = null) {
        if (currentNode === "object") {
            let element = document.getElementById(this.board.object);
            element.className = "objectTransparent";
        } else if (currentNode.id !== this.board.start) {
            if (currentNode.id !== this.board.target || currentNode.id === this.board.target && isActualTarget) {
                let currentHTMLNode = document.getElementById(currentNode.id);
                if (this.type === "unweighted") {
                    currentHTMLNode.className = "shortest-path-unweighted";
                } else {
                    let direction;
                    if (currentNode.relatesToObject && !currentNode.overwriteObjectRelation && currentNode.id !== this.board.target) {
                        direction = "storedDirection";
                        currentNode.overwriteObjectRelation = true;
                    } else {
                        direction = "direction";
                    }
                    if (currentNode[direction] === "up") {
                        currentHTMLNode.className = "shortest-path-up";
                    } else if (currentNode[direction] === "down") {
                        currentHTMLNode.className = "shortest-path-down";
                    } else if (currentNode[direction] === "right") {
                        currentHTMLNode.className = "shortest-path-right";
                    } else if (currentNode[direction] === "left") {
                        currentHTMLNode.className = "shortest-path-left";
                    } else {
                        currentHTMLNode.className = "shortest-path";
                    }
                }
            }
        }
        if (previousNode) {
            if (previousNode !== "object" && previousNode.id !== this.board.target && previousNode.id !== this.board.start) {
                let previousHTMLNode = document.getElementById(previousNode.id);
                previousHTMLNode.className = previousNode.weight === 15 ? "shortest-path weight" : "shortest-path";
            }
        } else {
            let element = document.getElementById(this.board.start);
            element.className = "startTransparent";
        }
    }

    /**MAZE CREATION CODE */
    GenerateMaze(mazeType: string) {
        console.log(mazeType);
        this.ClearWalls();
        this.ClearPath();
        this.board.wallsToAnimate = [];
        if (mazeType == "Rec1") {
            this.RecursiveDivisionMaze(this.board, 2, this.height - 3, 2, this.width - 3, "horizontal", false, "wall");
        }else if (mazeType == "Rec2") {
            this.RecursiveDivisionMazeVS(this.board, 2, this.height - 3, 2, this.width - 3, "vertical", false);
        }else if (this.mazeType == "Rec3") {
            this.RecursiveDivisionMazeHS(this.board, 2, this.height - 3, 2, this.width - 3, "horizontal", false);
        }else if (this.mazeType == "brm"){
            this.BasicRandomMaze("wall");
        }else if (this.mazeType == "bwm"){
            this.BasicWeightMaze("weight");
        }else if (this.mazeType == "ssp"){
            this.SimpleStairPattern(this.board);
        }

        this.MazeGenerationAnimations(this.board);
    }

    RecursiveDivisionMaze(board, rowStart, rowEnd, colStart, colEnd, orientation, surroundingWalls, type) {
        if (rowEnd < rowStart || colEnd < colStart) {
            return;
        }
        if (!surroundingWalls) {
            let relevantIds = [board.start, board.target];
            if (board.object) relevantIds.push(board.object);
            Object.keys(this.nodes).forEach(node => {
                if (!relevantIds.includes(node)) {
                    let r = parseInt(node.split("-")[0]);
                    let c = parseInt(node.split("-")[1]);
                    if (r === 0 || c === 0 || r === board.height - 1 || c === board.width - 1) {
                        let currentHTMLNode = document.getElementById(node);
                        board.wallsToAnimate.push(currentHTMLNode);
                        if (type === "wall") {
                            board.nodes[node].status = "wall";
                            board.nodes[node].weight = 0;
                        } else if (type === "weight") {
                            board.nodes[node].status = "unvisited";
                            board.nodes[node].weight = 15;
                        }
                    }
                }
            });
            surroundingWalls = true;
        }
        if (orientation === "horizontal") {
            let possibleRows = [];
            for (let number = rowStart; number <= rowEnd; number += 2) {
                possibleRows.push(number);
            }
            let possibleCols = [];
            for (let number = colStart - 1; number <= colEnd + 1; number += 2) {
                possibleCols.push(number);
            }
            let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
            let randomColIndex = Math.floor(Math.random() * possibleCols.length);
            let currentRow = possibleRows[randomRowIndex];
            let colRandom = possibleCols[randomColIndex];
            Object.keys(board.nodes).forEach(node => {
                let r = parseInt(node.split("-")[0]);
                let c = parseInt(node.split("-")[1]);
                if (r === currentRow && c !== colRandom && c >= colStart - 1 && c <= colEnd + 1) {
                    let currentHTMLNode = document.getElementById(node);
                    if (currentHTMLNode.className !== "start" && currentHTMLNode.className !== "target" && currentHTMLNode.className !== "object") {
                        board.wallsToAnimate.push(currentHTMLNode);
                        if (type === "wall") {
                            board.nodes[node].status = "wall";
                            board.nodes[node].weight = 0;
                        } else if (type === "weight") {
                            board.nodes[node].status = "unvisited";
                            board.nodes[node].weight = 15;
                        }
                    }
                }
            });
            if (currentRow - 2 - rowStart > colEnd - colStart) {
                this.RecursiveDivisionMaze(board, rowStart, currentRow - 2, colStart, colEnd, orientation, surroundingWalls, type);
            } else {
                this.RecursiveDivisionMaze(board, rowStart, currentRow - 2, colStart, colEnd, "vertical", surroundingWalls, type);
            }
            if (rowEnd - (currentRow + 2) > colEnd - colStart) {
                this.RecursiveDivisionMaze(board, currentRow + 2, rowEnd, colStart, colEnd, orientation, surroundingWalls, type);
            } else {
                this.RecursiveDivisionMaze(board, currentRow + 2, rowEnd, colStart, colEnd, "vertical", surroundingWalls, type);
            }
        } else {
            let possibleCols = [];
            for (let number = colStart; number <= colEnd; number += 2) {
                possibleCols.push(number);
            }
            let possibleRows = [];
            for (let number = rowStart - 1; number <= rowEnd + 1; number += 2) {
                possibleRows.push(number);
            }
            let randomColIndex = Math.floor(Math.random() * possibleCols.length);
            let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
            let currentCol = possibleCols[randomColIndex];
            let rowRandom = possibleRows[randomRowIndex];
            Object.keys(board.nodes).forEach(node => {
                let r = parseInt(node.split("-")[0]);
                let c = parseInt(node.split("-")[1]);
                if (c === currentCol && r !== rowRandom && r >= rowStart - 1 && r <= rowEnd + 1) {
                    let currentHTMLNode = document.getElementById(node);
                    if (currentHTMLNode.className !== "start" && currentHTMLNode.className !== "target" && currentHTMLNode.className !== "object") {
                        board.wallsToAnimate.push(currentHTMLNode);
                        if (type === "wall") {
                            board.nodes[node].status = "wall";
                            board.nodes[node].weight = 0;
                        } else if (type === "weight") {
                            board.nodes[node].status = "unvisited";
                            board.nodes[node].weight = 15;
                        }
                    }
                }
            });
            if (rowEnd - rowStart > currentCol - 2 - colStart) {
                this.RecursiveDivisionMaze(board, rowStart, rowEnd, colStart, currentCol - 2, "horizontal", surroundingWalls, type);
            } else {
                this.RecursiveDivisionMaze(board, rowStart, rowEnd, colStart, currentCol - 2, orientation, surroundingWalls, type);
            }
            if (rowEnd - rowStart > colEnd - (currentCol + 2)) {
                this.RecursiveDivisionMaze(board, rowStart, rowEnd, currentCol + 2, colEnd, "horizontal", surroundingWalls, type);
            } else {
                this.RecursiveDivisionMaze(board, rowStart, rowEnd, currentCol + 2, colEnd, orientation, surroundingWalls, type);
            }
        }
    };

    RecursiveDivisionMazeVS(board, rowStart, rowEnd, colStart, colEnd, orientation, surroundingWalls) {
        if (rowEnd < rowStart || colEnd < colStart) {
            return;
        }
        if (!surroundingWalls) {
            let relevantIds = [board.start, board.target];
            if (board.object) relevantIds.push(board.object);
            Object.keys(board.nodes).forEach(node => {
                if (!relevantIds.includes(node)) {
                    let r = parseInt(node.split("-")[0]);
                    let c = parseInt(node.split("-")[1]);
                    if (r === 0 || c === 0 || r === board.height - 1 || c === board.width - 1) {
                        let currentHTMLNode = document.getElementById(node);
                        board.wallsToAnimate.push(currentHTMLNode);
                        board.nodes[node].status = "wall";
                    }
                }
            });
            surroundingWalls = true;
        }
        if (orientation === "horizontal") {
            let possibleRows = [];
            for (let number = rowStart; number <= rowEnd; number += 2) {
                possibleRows.push(number);
            }
            let possibleCols = [];
            for (let number = colStart - 1; number <= colEnd + 1; number += 2) {
                possibleCols.push(number);
            }
            let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
            let randomColIndex = Math.floor(Math.random() * possibleCols.length);
            let currentRow = possibleRows[randomRowIndex];
            let colRandom = possibleCols[randomColIndex];
            Object.keys(board.nodes).forEach(node => {
                let r = parseInt(node.split("-")[0]);
                let c = parseInt(node.split("-")[1]);
                if (r === currentRow && c !== colRandom && c >= colStart - 1 && c <= colEnd + 1) {
                    let currentHTMLNode = document.getElementById(node);
                    if (currentHTMLNode.className !== "start" && currentHTMLNode.className !== "target" && currentHTMLNode.className !== "object") {
                        board.wallsToAnimate.push(currentHTMLNode);
                        board.nodes[node].status = "wall";
                    }
                }
            });
            if (currentRow - 2 - rowStart > colEnd - colStart) {
                this.RecursiveDivisionMazeVS(board, rowStart, currentRow - 2, colStart, colEnd, orientation, surroundingWalls);
            } else {
                this.RecursiveDivisionMazeVS(board, rowStart, currentRow - 2, colStart, colEnd, "vertical", surroundingWalls);
            }
            if (rowEnd - (currentRow + 2) > colEnd - colStart) {
                this.RecursiveDivisionMazeVS(board, currentRow + 2, rowEnd, colStart, colEnd, "vertical", surroundingWalls);
            } else {
                this.RecursiveDivisionMazeVS(board, currentRow + 2, rowEnd, colStart, colEnd, "vertical", surroundingWalls);
            }
        } else {
            let possibleCols = [];
            for (let number = colStart; number <= colEnd; number += 2) {
                possibleCols.push(number);
            }
            let possibleRows = [];
            for (let number = rowStart - 1; number <= rowEnd + 1; number += 2) {
                possibleRows.push(number);
            }
            let randomColIndex = Math.floor(Math.random() * possibleCols.length);
            let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
            let currentCol = possibleCols[randomColIndex];
            let rowRandom = possibleRows[randomRowIndex];
            Object.keys(board.nodes).forEach(node => {
                let r = parseInt(node.split("-")[0]);
                let c = parseInt(node.split("-")[1]);
                if (c === currentCol && r !== rowRandom && r >= rowStart - 1 && r <= rowEnd + 1) {
                    let currentHTMLNode = document.getElementById(node);
                    if (currentHTMLNode.className !== "start" && currentHTMLNode.className !== "target" && currentHTMLNode.className !== "object") {
                        board.wallsToAnimate.push(currentHTMLNode);
                        board.nodes[node].status = "wall";
                    }
                }
            });
            if (rowEnd - rowStart > currentCol - 2 - colStart) {
                this.RecursiveDivisionMazeVS(board, rowStart, rowEnd, colStart, currentCol - 2, "vertical", surroundingWalls);
            } else {
                this.RecursiveDivisionMazeVS(board, rowStart, rowEnd, colStart, currentCol - 2, orientation, surroundingWalls);
            }
            if (rowEnd - rowStart > colEnd - (currentCol + 2)) {
                this.RecursiveDivisionMazeVS(board, rowStart, rowEnd, currentCol + 2, colEnd, "horizontal", surroundingWalls);
            } else {
                this.RecursiveDivisionMazeVS(board, rowStart, rowEnd, currentCol + 2, colEnd, orientation, surroundingWalls);
            }
        }
    };

    RecursiveDivisionMazeHS(board, rowStart, rowEnd, colStart, colEnd, orientation, surroundingWalls) {
        if (rowEnd < rowStart || colEnd < colStart) {
            return;
        }
        if (!surroundingWalls) {
            let relevantIds = [board.start, board.target];
            if (board.object) relevantIds.push(board.object);
            Object.keys(board.nodes).forEach(node => {
                if (!relevantIds.includes(node)) {
                    let r = parseInt(node.split("-")[0]);
                    let c = parseInt(node.split("-")[1]);
                    if (r === 0 || c === 0 || r === board.height - 1 || c === board.width - 1) {
                        let currentHTMLNode = document.getElementById(node);
                        board.wallsToAnimate.push(currentHTMLNode);
                        board.nodes[node].status = "wall";
                    }
                }
            });
            surroundingWalls = true;
        }
        if (orientation === "horizontal") {
            let possibleRows = [];
            for (let number = rowStart; number <= rowEnd; number += 2) {
                possibleRows.push(number);
            }
            let possibleCols = [];
            for (let number = colStart - 1; number <= colEnd + 1; number += 2) {
                possibleCols.push(number);
            }
            let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
            let randomColIndex = Math.floor(Math.random() * possibleCols.length);
            let currentRow = possibleRows[randomRowIndex];
            let colRandom = possibleCols[randomColIndex];
            Object.keys(board.nodes).forEach(node => {
                let r = parseInt(node.split("-")[0]);
                let c = parseInt(node.split("-")[1]);
                if (r === currentRow && c !== colRandom && c >= colStart - 1 && c <= colEnd + 1) {
                    let currentHTMLNode = document.getElementById(node);
                    if (currentHTMLNode.className !== "start" && currentHTMLNode.className !== "target" && currentHTMLNode.className !== "object") {
                        board.wallsToAnimate.push(currentHTMLNode);
                        board.nodes[node].status = "wall";
                    }
                }
            });
            if (currentRow - 2 - rowStart > colEnd - colStart) {
                this.RecursiveDivisionMazeHS(board, rowStart, currentRow - 2, colStart, colEnd, orientation, surroundingWalls);
            } else {
                this.RecursiveDivisionMazeHS(board, rowStart, currentRow - 2, colStart, colEnd, "horizontal", surroundingWalls);
            }
            if (rowEnd - (currentRow + 2) > colEnd - colStart) {
                this.RecursiveDivisionMazeHS(board, currentRow + 2, rowEnd, colStart, colEnd, orientation, surroundingWalls);
            } else {
                this.RecursiveDivisionMazeHS(board, currentRow + 2, rowEnd, colStart, colEnd, "vertical", surroundingWalls);
            }
        } else {
            let possibleCols = [];
            for (let number = colStart; number <= colEnd; number += 2) {
                possibleCols.push(number);
            }
            let possibleRows = [];
            for (let number = rowStart - 1; number <= rowEnd + 1; number += 2) {
                possibleRows.push(number);
            }
            let randomColIndex = Math.floor(Math.random() * possibleCols.length);
            let randomRowIndex = Math.floor(Math.random() * possibleRows.length);
            let currentCol = possibleCols[randomColIndex];
            let rowRandom = possibleRows[randomRowIndex];
            Object.keys(board.nodes).forEach(node => {
                let r = parseInt(node.split("-")[0]);
                let c = parseInt(node.split("-")[1]);
                if (c === currentCol && r !== rowRandom && r >= rowStart - 1 && r <= rowEnd + 1) {
                    let currentHTMLNode = document.getElementById(node);
                    if (currentHTMLNode.className !== "start" && currentHTMLNode.className !== "target" && currentHTMLNode.className !== "object") {
                        board.wallsToAnimate.push(currentHTMLNode);
                        board.nodes[node].status = "wall";
                    }
                }
            });
            if (rowEnd - rowStart > currentCol - 2 - colStart) {
                this.RecursiveDivisionMazeHS(board, rowStart, rowEnd, colStart, currentCol - 2, "horizontal", surroundingWalls);
            } else {
                this.RecursiveDivisionMazeHS(board, rowStart, rowEnd, colStart, currentCol - 2, "horizontal", surroundingWalls);
            }
            if (rowEnd - rowStart > colEnd - (currentCol + 2)) {
                this.RecursiveDivisionMazeHS(board, rowStart, rowEnd, currentCol + 2, colEnd, "horizontal", surroundingWalls);
            } else {
                this.RecursiveDivisionMazeHS(board, rowStart, rowEnd, currentCol + 2, colEnd, orientation, surroundingWalls);
            }
        }
    };

    BasicRandomMaze(type)
    {
        Object.keys(this.nodes).forEach(node => {
            let random = Math.random();
            let currentHTMLNode = document.getElementById(node);
            let relevantClassNames = ["start", "target", "object"]
            let randomTwo = type === "wall" ? 0.25 : 0.35;
            if (random < randomTwo && !relevantClassNames.includes(currentHTMLNode.className)) {
                if (type === "wall") {
                    currentHTMLNode.className = "wall";
                    this.nodes[node].status = "wall";
                    this.nodes[node].weight = 0;
                } else if (type === "weight") {
                    currentHTMLNode.className = "unvisited weight";
                    this.nodes[node].status = "unvisited";
                    this.nodes[node].weight = 15;
                }
            }
        });
    };

    BasicWeightMaze(type){
        Object.keys(this.nodes).forEach(node => {
            let random = Math.random();
            let currentHTMLNode = document.getElementById(node);
            let relevantClassNames = ["start", "target", "object"]
            let randomTwo = type === "wall" ? 0.25 : 0.35;
            if (random < randomTwo && !relevantClassNames.includes(currentHTMLNode.className)) {
                if (type === "wall") {
                    currentHTMLNode.className = "wall";
                    this.nodes[node].status = "wall";
                    this.nodes[node].weight = 0;
                } else if (type === "weight") {
                    currentHTMLNode.className = "unvisited weight";
                    this.nodes[node].status = "unvisited";
                    this.nodes[node].weight = 15;
                }
            }
        });
    };

    SimpleStairPattern(board) {
        let currentIdX = board.height - 1;
        let currentIdY = 0;
        let relevantStatuses = ["start", "target", "object"];
        while (currentIdX > 0 && currentIdY < board.width) {
            let currentId = `${currentIdX}-${currentIdY}`;
            let currentNode = board.nodes[currentId];
            let currentHTMLNode = document.getElementById(currentId);
            if (!relevantStatuses.includes(currentNode.status)) {
                currentNode.status = "wall";
                board.wallsToAnimate.push(currentHTMLNode);
            }
            currentIdX--;
            currentIdY++;
        }
        while (currentIdX < board.height - 2 && currentIdY < board.width) {
            let currentId = `${currentIdX}-${currentIdY}`;
            let currentNode = board.nodes[currentId];
            let currentHTMLNode = document.getElementById(currentId);
            if (!relevantStatuses.includes(currentNode.status)) {
                currentNode.status = "wall";
                board.wallsToAnimate.push(currentHTMLNode);
            }
            currentIdX++;
            currentIdY++;
        }
        while (currentIdX > 0 && currentIdY < board.width - 1) {
            let currentId = `${currentIdX}-${currentIdY}`;
            let currentNode = board.nodes[currentId];
            let currentHTMLNode = document.getElementById(currentId);
            if (!relevantStatuses.includes(currentNode.status)) {
                currentNode.status = "wall";
                board.wallsToAnimate.push(currentHTMLNode);
            }
            currentIdX--;
            currentIdY++;
        }
    }

    MazeGenerationAnimations(board) {
        let nodes = board.wallsToAnimate.slice(0);
        let speed = board.speed === "fast" ?
            5 : board.speed === "average" ?
                25 : 75;

        function timeout(index) {
            setTimeout(function () {
                if (index === nodes.length) {
                    board.wallsToAnimate = [];
                    //board.toggleButtons();
                    return;
                }
                nodes[index].className = board.nodes[nodes[index].id].weight === 15 ? "unvisited weight" : "wall";
                timeout(index + 1);
            }, 5);
        }
        timeout(0);
    };

    /**UTILITY */
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
    objectShortestPathNodesToAnimate?: string[];
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
    middleNode?: string;
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