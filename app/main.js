//board colors
let C1;
let C2;
let CM1;
let CM2;

let spriteSheet;
let wsprites = [];
let bsprites = [];

let scl;
let rows = 8, cols = 8;
let WHITE = 0;
let BLACK = 1;
let Orientation = WHITE; //i.e playing as who

let board = Array(8).fill().map(() => Array(8).fill(0));

class Piece{
    constructor(bx,by,side){
        this.x = bx;
        this.y = by;
        this.side = side;
        this.sprite = new Image(); //placeholder to define parent classs
        this.possibleMoves = [];
        this.movemaskRendered = false;
        board[this.x][this.y] = this;
    }

    render(){
        image(
            this.sprite,
            this.x*scl,
            scl*(7*Orientation-this.y*(-1+2*Orientation))
        );
    }

    getPossibleMoves(){
        //define this in inherited classes
    }   

    //displays possible moves of a piece
    showMoveMask(){
        renderAll();
        this.possibleMoves = [];
        this.getPossibleMoves();
        var colors = []
        if(this.movemaskRendered == false){
            colors = [CM1,CM2];
            this.movemaskRendered = true;
        }else{
            colors = [C1,C2];
            this.movemaskRendered = false;
        }
        for (i = 0; i < this.possibleMoves.length; i ++){
            var x = this.possibleMoves[i][0];
            var y = this.possibleMoves[i][1];
            if((x+y)%2 == 0){
                fill(colors[0]);
            } else{
                fill(colors[1]);
            }
            square(
                x*scl,
                scl*(7*Orientation-y*(-1+2*Orientation)),
                scl
            )
            if(board[x][y] != 0){
                board[x][y].render()
            }
        }
    }

    move(bx,by){
        if(bx == this.x && by == this.y){
            return;
        }
        if(this.showMoveMask == true){
            this.showMoveMask()
        }
        board[this.x][this.y] = 0;
        this.x = bx;
        this.y = by;
        board[this.x][this.y] = this;
        renderAll()
    }

    internal_bfs(initial_queue){
        var queue = initial_queue;
        while(queue.length > 0){
            var item = queue.shift();
            var vector = [item[0]-this.x,item[1]-this.y];
            if(vector[0] != 0){
                vector[0] = (vector[0]/Math.abs(vector[0]));
            }
            if(vector[1] != 0){
                vector[1] = (vector[1]/Math.abs(vector[1]));
            }
            if(0 <= item[0] && item[0] < 8 && 0 <= item[1] && item[1] < 8){//if move is still in the board
                if(board[item[0]][item[1]] == 0){
                    this.possibleMoves.push(item);
                    queue.push([vector[0]+item[0],vector[1]+item[1]]);
                }else if(board[item[0]][item[1]].side != this.side){ //there is a piece in the way & its not on the same side
                    if(board[item[0]][item[1]] instanceof King){
                        board[item[0]][item[1]].check = true;
                    }
                    this.possibleMoves.push(item);
                }
            }
        }
    }
}

class Pawn extends Piece{
    constructor(bx,by,side){
        super(bx,by,side);
        if(this.side == WHITE){
            this.sprite = wsprites[5];
        }else{
            this.sprite = bsprites[5];
        }
    }

    getPossibleMoves(){
        var forwards = this.y-(1-2*this.side) //if white -> increments by 1, if black -> 1-2*1 = -1, thus decrements by 1
        console.log(forwards);
        if(board[this.x][forwards] == 0){
            this.possibleMoves.push([this.x,forwards]) //can move forward
        }
        var sides = [this.x+1,this.x-1];
        for (i =0;i<2;i++){
            if(0 <= sides[i] && sides[i] < 8){
                var sqr = board[sides[i]][forwards];
                if(sqr != 0 && sqr.side != this.side){
                    if(sqr instanceof King){
                        sqr.check = true;
                    }else{
                        this.possibleMoves.push([sides[i],forwards]); //can capture
                    }
                }
            }
        }
    }
}

class Rook extends Piece{
    constructor(bx,by,side){
        super(bx,by,side);
        if(this.side == WHITE){
            this.sprite = wsprites[4];
        }else{
            this.sprite = bsprites[4];
        }
    }

    getPossibleMoves(){
        var queue = [
            [this.x+1,this.y],
            [this.x-1,this.y],
            [this.x,this.y+1],
            [this.x,this.y-1]
        ]
        this.internal_bfs(queue);
    }
}

class Knight extends Piece{
    constructor(bx,by,side){
        super(bx,by,side);
        if(this.side == WHITE){
            this.sprite = wsprites[3];
        }else{
            this.sprite = bsprites[3];
        }
    }

    getPossibleMoves(){
        var queue = [
            [this.x+1,this.y+2],
            [this.x-1,this.y+2],
            [this.x+1,this.y-2],
            [this.x-1,this.y-2],
            [this.x+2,this.y+1],
            [this.x+2,this.y-1],
            [this.x-2,this.y+1],
            [this.x-2,this.y-1]]

        for(var i = 0;i < 8; i++){
            var vector = queue[i];
            var sqr = board[vector[0]][vector[1]];
            if(sqr == 0 || sqr.side != this.side){
                if(sqr instanceof King){
                    sqr.check = true;
                }
                this.possibleMoves.push(vector);
            }
        }
    }
}

class Bishop extends Piece{
    constructor(bx,by,side){
        super(bx,by,side);
        if(this.side == WHITE){
            this.sprite = wsprites[2];
        }else{
            this.sprite = bsprites[2];
        }
    }

    getPossibleMoves(){
        var queue = [
            [this.x+1,this.y+1],
            [this.x-1,this.y-1],
            [this.x+1,this.y-1],
            [this.x-1,this.y+1]
        ]
        this.internal_bfs(queue);
    }
}

class Queen extends Piece{
    constructor(bx,by,side){
        super(bx,by,side);
        if(this.side == WHITE){
            this.sprite = wsprites[1];
        }else{
            this.sprite = bsprites[1];
        }
    }
    getPossibleMoves(){
        var queue = [
            [this.x+1,this.y],
            [this.x-1,this.y],
            [this.x,this.y+1],
            [this.x,this.y-1],
            [this.x+1,this.y+1],
            [this.x-1,this.y-1],
            [this.x+1,this.y-1],
            [this.x-1,this.y+1]
        ]
        this.internal_bfs(queue);
    }
}

class King extends Piece{
    constructor(bx,by,side){
        super(bx,by,side);
        this.check = false;
        this.possibleMoves = [];
        this.possibleMoves_initial = [
            [this.x+1,this.y],
            [this.x-1,this.y],
            [this.x,this.y+1],
            [this.x,this.y-1],
            [this.x+1,this.y+1],
            [this.x-1,this.y-1],
            [this.x+1,this.y-1],
            [this.x-1,this.y+1]
        ];
        if(this.side == WHITE){
            this.sprite = wsprites[0];
        }else{
            this.sprite = bsprites[0];
        }
    }

    getInitialPossibleMoves(){
        this.possibleMoves_initial = [
            [this.x+1,this.y],
            [this.x-1,this.y],
            [this.x,this.y+1],
            [this.x,this.y-1],
            [this.x+1,this.y+1],
            [this.x-1,this.y-1],
            [this.x+1,this.y-1],
            [this.x-1,this.y+1]
        ];
    }

    hash(x,y){
        return 8*y + x
    }
    
    getPossibleMoves(){
        var queue = [
            [this.x,this.y]
        ]
        var visited = Array(8).fill().map(() => Array(8).fill(0));
        var unavailable_moves = Array(8).fill().map(() => Array(8).fill(0));
        while(queue.length > 0){
            var item = queue.shift()
            var neighbors = this.find_neighbors(item)
            for(i = 0; i < neighbors.length; i++){
                var position = neighbors[i];
                var sqr = board[position[0]][position[1]]
                if(visited[position[0]][position[1]] == 0){ //if position has not been visited before
                    visited[position[0]][position[1]] = 1
                    if(sqr == 0){   
                        queue.push(position);
                    }else if(sqr.side != this.side){
                        queue.push(position);
                        if(sqr instanceof King){
                            sqr.getInitialPossibleMoves();
                            for (let i = 0; i < 8; i++) {
                                const Move = sqr.possibleMoves_initial[i];
                                unavailable_moves[Move[0]][Move[1]] = 1
                            }
                        }else{
                            sqr.possibleMoves = [];
                            sqr.getPossibleMoves();
                            for(i = 0;i < sqr.possibleMoves.length;i ++){
                                var Move = sqr.possibleMoves[i];
                                unavailable_moves[Move[0]][Move[1]] = 1
                            }
                        }
                    }
                }
            }
        }
        
        for (let i = 0; i < 8; i++) {
            var vec = this.possibleMoves_initial[i];
            if(0 <= vec[0] && vec[0] < 8 && 0 <= vec[1] && vec[1] < 8 && unavailable_moves[vec[0]][vec[1]] == 0){
                this.possibleMoves.push(vec);
            }
        }
        console.log(unavailable_moves)
    }

    find_neighbors(pos){
        var x = pos[0]
        var y = pos[1]
        var possible  = [
            [x+1,y],
            [x-1,y],
            [x,y+1],
            [x,y-1]
        ]
        var neighbors = []
        for(i = 0; i < 4;i++){
            var vec = possible[i];
            if(0 <= vec[0] && vec[0] < 8 && 0 <= vec[1] && vec[1] < 8){
                neighbors.push(vec);
            }
        }
        return neighbors;
    }
}

function preload() {
    spriteSheet = loadImage("sprites.png");
}

function generateSprites() {
    for(i = 0; i < 6; i++){
        const sprite = spriteSheet.get(i*213, 0, 213, 213);
        sprite.resize(scl, scl);
        wsprites.push(sprite);
    }
    for(i = 0; i < 6; i++){
        const sprite = spriteSheet.get(i*213, 213, 213, 213);
        sprite.resize(scl, scl);
        bsprites.push(sprite);
    }
}

function generateBoard(){
    noStroke();
    for(i = 0; i < 8;i++){
        for(j = 0; j < 8;j++){
            if((i+j+Orientation)%2 == 0){
                fill(C1);
            } else{
                fill(C2);
            }
            square(i*scl,j*scl,scl)
        }        
    }
}

function setup() {
    C1 = color("#a3a3a3");
    C2 = color("#4e4f4e");
    CM1 = color("#639470");
    CM2 = color("#35523d");
    createCanvas(600, 600);
    scl = 600 / rows;
    generateSprites();
    generateBoard();
}

function renderAll(){
    generateBoard();
    for(i = 0; i < 8; i++){
        for(j = 0;j < 8;j++){
            if(board[i][j] != 0){
                board[i][j].render()
            }
        }
    }
}

function flipOrientation(){
    if(Orientation == WHITE){
        Orientation = BLACK
    }else{
        Orientation = WHITE
    }
    renderAll()
}