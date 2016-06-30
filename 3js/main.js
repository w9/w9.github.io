var COLOR_PALETTE = ['#db2d20','#01a0e4','#01a252','#a16a94','#222222','#b5e4f4'];
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var VIEW_ANGLE = 45;
var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
var NEAR = 0.1;
var FAR = 20000;
var SPRITE_SIZE = 128;

var overlay = document.getElementById('overlay');

var inputTextarea = document.getElementById('input-textarea');
var plotButton = document.getElementById('plot-button');
    plotButton.addEventListener('click', function(){
      POINT_DATA = JSON.parse(inputTextarea.value);
      overlay.hidden = true;
      init();
      animate();
    });

var container, scene, camera, renderer, controls, stats;

var keyboard = new THREEx.KeyboardState();

function mkDisc(color) {
  var disc = document.createElement('canvas');
      disc.width = 128;
      disc.height = 128;
  var discCtx = disc.getContext('2d');
      discCtx.beginPath();
      discCtx.arc(SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE * 0.45, 0, 2 * Math.PI, false);
      discCtx.fillStyle = color;
      discCtx.fill();
  return disc;
}

var square = document.createElement('canvas');
    square.width = 128;
    square.height = 128;
var squareCtx = square.getContext('2d');
    squareCtx.beginPath();
    squareCtx.rect(SPRITE_SIZE / 2 - SPRITE_SIZE * 0.45, SPRITE_SIZE / 2 - SPRITE_SIZE * 0.45,
                   SPRITE_SIZE * 0.9, SPRITE_SIZE * 0.9);
    squareCtx.fillStyle = 'green';
    squareCtx.fill();
    squareCtx.lineWidth = 5;
    squareCtx.strokeStyle = '#003300';
    squareCtx.stroke();

document.body.addEventListener('keypress', function(e) {
  switch (e.key) {
    case 'o':
      overlay.hidden = !overlay.hidden;
      break;
    case 'p':
      stats.domElement.hidden = !stats.domElement.hidden;
      break;
    default:
      break;
  }
});

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
  camera.position.set(0,100,500);
  scene.add( camera );

  renderer = new THREE.WebGLRenderer( { antialias:true } );
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  renderer.setClearColor(0xffffff, 1);

  container = document.getElementById( 'plot-container' );
  container.appendChild( renderer.domElement );

  THREEx.WindowResize(renderer, camera);

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.target = new THREE.Vector3(0,100,0);
  controls.update();

  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.bottom = '0px';
  stats.domElement.style.zIndex = 100;
  stats.domElement.hidden = true;
  container.appendChild( stats.domElement );

  // FLOOR
  //var floorTexture = new THREE.Texture( square );
  //    floorTexture.needsUpdate = true;
  //var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, alphaMap: floorTexture, side: THREE.DoubleSide, transparent: true } );
  //var floorGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
  //var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  //floor.position.y = -0.5;
  //floor.rotation.x = Math.PI / 2;
  //scene.add(floor);

  var floorMtrl = new THREE.LineBasicMaterial( { color: 0x000000 });
  var floorGtry = new THREE.Geometry();
      floorGtry.vertices.push(new THREE.Vector3( -100, 0, -100));
      floorGtry.vertices.push(new THREE.Vector3(  100, 0, -100));
      floorGtry.vertices.push(new THREE.Vector3(  100, 0,  100));
      floorGtry.vertices.push(new THREE.Vector3( -100, 0,  100));
      floorGtry.vertices.push(new THREE.Vector3( -100, 0, -100));
  var floorLine = new THREE.Line(floorGtry, floorMtrl);
  scene.add(floorLine);

  // Sprites
  
  for (var i in POINT_DATA) {
    var x = POINT_DATA[i][0];
    var y = POINT_DATA[i][1];
    var z = POINT_DATA[i][2] + 50;
    var c = COLOR_PALETTE[POINT_DATA[i][3]-1];

    console.log(c);

    var geometry = new THREE.CircleGeometry( 5, 32 );
    var material = new THREE.MeshBasicMaterial( { color: new THREE.Color(c) } );
    var circle = new THREE.Mesh( geometry, material );
    circle.position.set( x, z, y );
    scene.add( circle );

    //var discTxtr = new THREE.Texture(mkDisc(c));
    //    discTxtr.needsUpdate = true;
    //var discMtrl = new THREE.SpriteMaterial( { map: discTxtr } );
    //var discSprt = new THREE.Sprite( discMtrl );
    //discSprt.position.set( x, z, y );
    //discSprt.scale.set( 5, 5, 1 );
    //scene.add( discSprt );
  }

  scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
}

function animate() 
{
  requestAnimationFrame( animate );
  render();   
  update();
}

function update()
{
  if ( keyboard.pressed("z") ) 
  { 
    //...
  }
  
  stats.update();
}

function render() 
{
  renderer.render( scene, camera );
}
