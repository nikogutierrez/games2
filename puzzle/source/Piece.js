import Metrics      from "./Metrics.js";

// Utils
import Utils        from "../../utils/Utils.js";



/**
 * Puzzle Piece
 */
export default class Piece {

    /** @type {Metrics} */
    #metrics;
    /** @type {HTMLImageElement} */
    #image;
    /** @type {HTMLCanvasElement} */
    #canvas;
    /** @type {CanvasRenderingContext2D} */
    #ctx;


    /**
     * Puzzle Piece constructor
     * @param {Metrics}          metrics
     * @param {HTMLImageElement} image
     * @param {String}           id
     * @param {Number}           col
     * @param {Number}           row
     * @param {{top: Number, right: Number, bottom: Number, left: Number}} borders
     */
    constructor(metrics, image, id, col, row, borders) {
        this.#metrics = metrics;
        this.#image   = image;

        this.id       = id;
        this.col      = col;
        this.row      = row;
        this.top      = 0;
        this.left     = 0;
        this.borders  = borders;
        this.isBorder = !this.borders.top || !this.borders.right || !this.borders.bottom || !this.borders.left;
        this.inDrawer = "primary";

        this.#canvas                = document.createElement("canvas");
        this.#ctx                   = this.#canvas.getContext("2d");
        this.#canvas.width          = this.#metrics.fullSize;
        this.#canvas.height         = this.#metrics.fullSize;
        this.#canvas.className      = "piece" + (this.isBorder ? " border" : "");
        this.#canvas.dataset.action = "piece";
        this.#canvas.dataset.id     = String(this.id);

        this.draw();
    }

    /**
     * Initializes the Piece in the Table
     * @param {Number} top
     * @param {Number} left
     * @returns {Void}
     */
    initInTable(top, left) {
        this.inDrawer = "";
        this.top      = Math.max(top, 100);
        this.left     = Math.max(left, 100);
        this.#canvas.style.transform = Utils.translate(this.left, this.top);
    }

    /**
     * Returns the Element
     * @returns {HTMLCanvasElement}
     */
    get element() {
        return this.#canvas;
    }

    /**
     * Returns the Position
     * @returns {{top: Number, left: Number}}
     */
    get pos() {
        return { top : this.top, left : this.left };
    }



    /**
     * Return the Element bounds
     * @returns {DOMRect}
     */
    get bounds() {
        return this.#canvas.getBoundingClientRect();
    }

    /**
     * Sets the Action and ID
     * @param {String} action
     * @param {String} id
     * @returns {Void}
     */
    setActionID(action = "", id = "") {
        this.#canvas.dataset.action = action;
        this.#canvas.dataset.id     = id;
    }

    /**
     * Appends the Element to the given Container
     * @param {HTMLElement} container
     * @returns {Void}
     */
    appendTo(container) {
        container.appendChild(this.#canvas);
    }

    /**
     * Removes the Element from the Container
     * @returns {Void}
     */
    removeElement() {
        Utils.removeElement(this.#canvas);
    }



    /**
     * Draws the Piece
     * @returns {Void}
     */
    draw() {
        const size    = this.#metrics.size;
        const padding = this.#metrics.padding;

        this.#ctx.scale(this.#metrics.scale, this.#metrics.scale);

        this.#ctx.moveTo(padding, padding);
        if (this.borders.top === 0) {
            this.#ctx.lineTo(padding + size, padding);
        } else {
            this.drawSide(padding, padding, 0, this.borders.top);
        }
        if (this.borders.right === 0) {
            this.#ctx.lineTo(padding + size, padding + size);
        } else {
            this.drawSide(padding + size, padding, 0.5, this.borders.right);
        }
        if (this.borders.bottom === 0) {
            this.#ctx.lineTo(padding, padding + size);
        } else {
            this.drawSide(padding + size, padding + size, 1, this.borders.bottom);
        }
        if (this.borders.left === 0) {
            this.#ctx.closePath();
        } else {
            this.drawSide(padding, padding + size, 1.5, this.borders.left);
        }
        this.#ctx.strokeStyle = "rgba(240, 240, 240, 0.3)";
        this.#ctx.lineWidth   = 1;
        this.#ctx.stroke();
        this.#ctx.clip();

        const sourcePad  = padding * this.#metrics.imgSize / size;
        const sourceSize = this.#metrics.imgSize + sourcePad * 2;
        const sourceX    = this.col * this.#metrics.imgSize - sourcePad;
        const sourceY    = this.row * this.#metrics.imgSize - sourcePad;
        const destSize   = size + padding * 2;
        this.#ctx.drawImage(this.#image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, destSize, destSize);
    }

    /**
     * Draws a side of a Piece
     * @param {Number} x
     * @param {Number} y
     * @param {Number} rotation
     * @param {Number} border
     * @returns {Void}
     */
    drawSide(x, y, rotation, border) {
        const curves = [
            { cx1 : 0,  cy1 :   0, cx2 : 35, cy2 :  15, ex :  37, ey :   5 }, // left shoulder
            { cx1 : 37, cy1 :   5, cx2 : 40, cy2 :   0, ex :  38, ey :  -5 }, // left neck
            { cx1 : 38, cy1 :  -5, cx2 : 20, cy2 : -20, ex :  50, ey : -20 }, // left head
            { cx1 : 50, cy1 : -20, cx2 : 80, cy2 : -20, ex :  62, ey :  -5 }, // right head
            { cx1 : 62, cy1 :  -5, cx2 : 60, cy2 :   0, ex :  63, ey :   5 }, // right neck
            { cx1 : 63, cy1 :   5, cx2 : 65, cy2 :  15, ex : 100, ey :   0 }, // right shoulder
        ];

        this.#ctx.save();
        this.#ctx.translate(x, y);
        this.#ctx.rotate(Math.PI * rotation);
        for (const curve of curves) {
            if (border === -1) {
                curve.cy1 = curve.cy1 * -1;
                curve.cy2 = curve.cy2 * -1;
                curve.ey  = curve.ey  * -1;
            }
            this.#ctx.bezierCurveTo(curve.cx1, curve.cy1, curve.cx2, curve.cy2, curve.ex, curve.ey);
        }
        this.#ctx.restore();
    }

    /**
     * Positions the Piece at the given Top and Left
     * @param {Number} top
     * @param {Number} left
     */
    position(top, left) {
        this.top  = top;
        this.left = left;

        this.#canvas.style.top       = Utils.toPX(top);
        this.#canvas.style.left      = Utils.toPX(left);
        this.#canvas.style.transform = "";
    }



    /**
     * Returns true if the given Piece is neighbor of this one
     * @param {Piece} piece
     * @returns {Boolean}
     */
    isNeighbor(piece) {
        return (
            (this.row === piece.row && Math.abs(this.col - piece.col) === 1) ||
            (this.col === piece.col && Math.abs(this.row - piece.row) === 1)
        );
    }

    /**
     * Returns true if the position of the given Piece is close enough to fit
     * @param {Piece} piece
     * @returns {Boolean}
     */
    canFit(piece) {
        const fitPos = this.#metrics.calcPiecePos(piece, this.top, this.left, this.row, this.col);
        const dist   = Utils.dist(fitPos, piece.pos);
        return dist < this.#metrics.delta;
    }



    /**
     * Translates the Piece
     * @param {{top: Number, left: Number}} pos
     * @returns {Void}
     */
    translate(pos) {
        this.top  = pos.top  - this.startPos.top;
        this.left = pos.left - this.startPos.left;
        this.#canvas.style.transform = Utils.translate(this.left, this.top);
    }

    /**
     * Picks the Piece
     * @param {MouseEvent} event
     * @returns {Void}
     */
    pick(event) {
        const pos     = Utils.getMousePos(event);
        const bounds  = this.#canvas.getBoundingClientRect();
        this.startPos = { top : pos.top - bounds.top, left : pos.left - bounds.left };

        document.body.appendChild(this.#canvas);
        this.translate(pos);
    }

    /**
     * Drags the Piece
     * @param {MouseEvent} event
     * @returns {Void}
     */
    drag(event) {
        const pos = Utils.getMousePos(event);
        this.translate(pos);
    }

    /**
     * Drops the Piece in the Drawer
     * @param {String} drawer
     * @returns {Void}
     */
    dropInDrawer(drawer) {
        this.inDrawer = drawer;
        this.#canvas.style.transform = "";
    }

    /**
     * Drops the Piece in the Board
     * @param {{top: Number, left: Number}} pos
     * @returns {Void}
     */
    dropInTable(pos) {
        this.inDrawer = "";
        this.translate(pos);
    }
}
