/**
 * @class A scene node that defines a sixteen-element matrix to transform the nodes within its subgraph.
 * @extends SceneJS.Node
 * <p><b>Example</b></p><p>A cube translated along the X, Y and Z axis.</b></p><pre><code>
 * var mat = new SceneJS.Matrix({
 *       elements : [
 *              1, 0, 0, 10,
 *              0, 1, 0, 5,
 *              0, 0, 1, 3,
 *              0, 0, 0, 1
 *          ]
 *   },
 *
 *      new SceneJS.objects.Cube()
 * )
 * </pre></code>
 * @constructor
 * Create a new SceneJS.Matrix
 * @param {Object} config  Config object or function, followed by zero or more child nodes
 */
SceneJS.Matrix = function() {
    SceneJS.Node.apply(this, arguments);
    this._nodeType = "matrix";
    this._mat = SceneJS_math_identityMat4();
    this._xform = null;
    if (this._fixedParams) {
        this._init(this._getParams());
    }
};

SceneJS._inherit(SceneJS.Matrix, SceneJS.Node);

/**
 * Sets the matrix elements
 * @param {Array} elements One-dimensional array of matrix elements
 * @returns {SceneJS.Matrix} this
 */
SceneJS.Matrix.prototype.setElements = function(elements) {
    if (!elements) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.Matrix elements undefined"));
    }
    if (elements.length != 16) {
        SceneJS_errorModule.fatalError(new SceneJS.InvalidNodeConfigException("SceneJS.Matrix elements should number 16"));
    }
    for (var i = 0; i < 16; i++) {
        this._mat[i] = elements[i];
    }
    this._memoLevel = 0;
    return this;
};

/** Returns the matrix elements
 * @returns {Object} One-dimensional array of matrix elements
 */
SceneJS.Matrix.prototype.getElements = function() {
    var elements = new Array(16);
    for (var i = 0; i < 16; i++) {
        elements[i] = this._mat[i];
    }
    return elements;
};

SceneJS.Matrix.prototype._init = function(params) {
    if (params.elements) {
        this.setElements(params.elements);
    }
};

SceneJS.Matrix.prototype._render = function(traversalContext, data) {
    if (this._memoLevel == 0) {
        if (!this._fixedParams) {
           this._init( this._getParams(data));
        } else {
            this._memoLevel = 1;
        }
    }
    var superXform = SceneJS_modelViewTransformModule.getTransform();
    if (this._memoLevel < 2) {
        var instancing = SceneJS_instancingModule.instancing();
        var tempMat = SceneJS_math_mulMat4(superXform.matrix, this._mat);
        this._xform = {
            localMatrix: this._mat,
            matrix: tempMat,
            fixed: superXform.fixed && this._fixedParams && !instancing
        };
        if (this._memoLevel == 1 && superXform.fixed && !instancing) {   // Bump up memoization level if model-space fixed
            this._memoLevel = 2;
        }
    }
    SceneJS_modelViewTransformModule.setTransform(this._xform);
    this._renderNodes(traversalContext, data);
    SceneJS_modelViewTransformModule.setTransform(superXform);
};

/** Function wrapper to support functional scene definition
 */
SceneJS.Matrix = function() {
    var n = new SceneJS.Matrix();
    SceneJS.Matrix.prototype.constructor.apply(n, arguments);
    return n;
};