"use strict";

var canvas;
var gl;

var points = [];
var bufferId;
var slider, slider2;

var numTimesToSubdivide = 1;
var theta = 0;


function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );

    /// gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 6), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // this attaches to the onchange event of the slider element
    // causing the content of this function to be called when the value of slider
    // changes
    slider = document.getElementById('slider');
    slider2 = document.getElementById('slider2');

    slider.onchange = function() {
        numTimesToSubdivide = event.srcElement.value;
        render();
    };

    slider2.onchange = function() {
        theta = event.srcElement.value;
        render();
    };


    render();

};

function triangle( a, b, c ) { 
    points.push( a, b, c ); 
}

function divideTriangle( a, b, c, count ) {

    function get_displaced(coordinate) {
        var x = coordinate[0]
        var y = coordinate[1]
        var d = Math.sqrt((x*x) + (y*y));
        var gamma = d * theta / 10;
        var x_ = (x * Math.cos(gamma)) - (y * Math.sin(gamma));
        var y_ = (x * Math.sin(gamma)) + (y * Math.cos(gamma));
        return [x_, y_] 
    }

    var primes_a = get_displaced(a);
    var primes_b = get_displaced(b);
    var primes_c = get_displaced(c);

    a = vec2(primes_a[0], primes_a[1]);
    b = vec2(primes_b[0], primes_b[1]);
    c = vec2(primes_c[0], primes_c[1]);

    // check for end of recursion
    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {
        //bisect the sides
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangles
        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

window.onload = init;

function render()
{
    points = [];
    var vertices = [vec2(-1, -1 ), vec2(0,  1 ), vec2(1, -1 )];

    // "divideTriangle" operates on points *in place*
    // if numTimesToSubdivide is 0 
    //     the points making up the raw trangle is pushed, 
    // else 
    //     the recursion of triangle divisions is performed and pushed onto points
    if (numTimesToSubdivide === 0){ 
        triangle( vertices[0], vertices[1], vertices[2] );
    }
    else {
        divideTriangle( vertices[0], vertices[1], vertices[2], numTimesToSubdivide);
    }

    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    points = [];
}

