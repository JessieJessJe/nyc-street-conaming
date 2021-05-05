import { TrackballControls } from './TrackballControls.js';


        var scene, renderer, camera, controls,loader, canvas;
        var angle = 0; 
        var geonyc, geomap, nodes;
        var everything;


const termlist = [['detective','nypd','9/11','police','recovery','september 11, 2001'],
                    ['woman','polish','association','she'],                 
                    ['staten island','business','career','board','jazz','council','league'],
                    ['baptist','pastor','church', 'america','rabbi'],
                    ['911 heroes'],
                    ['september 11, 2001', 'fdny','firefighter'],
                    ['gun','marine','9/11', 'combat','violence','police','september 11, 2001'],
                    ['district','attorney','health',' hiv ',' human rights','hiv/aids'],
                    ['school',' art ','civic','children','museum','award']]


//"0":0x8029a6,  "5":0xffcf0a,  "6":0x2deb36,

        const groupColor ={
            "-1":0xcccccc,
            "0":0x3440eb,
            "1":0x9ca2ff,
            "2":0xfc53bc,
            "3":0xb20061,
            "4":0x3440eb,
            "5":0xffcf0a, 
            "6":0x3440eb,
            "7":0x34ebeb,
            "8":0xe67a00};
        
        function normLat(lat){

            const min = 40.5409949
            const max = 40.86892

            var norm = ((lat-min) / (max - min) * 50 -25)*3.5
            return norm
            }

        function normLong(long){

            const min = -73.72609609999999
            const max = -74.2297827

            var norm = ((long-min) / (max - min) * 50 -25)*3.5
            return norm
            }
        
        function normZ(year){

            var norm = (year - 2000 + 3)* 1.5
            return norm
            }
            
               


$.getJSON( "nyc.json", function( geo ) {
    geonyc = geo;

    everything = new THREE.Group();

        // Converts a GeoJSON MultiLineString [in spherical coordinates] to a THREE.LineSegments.
        function wireframe(multilinestring, material) {

        var linelist = []
        var geometry = new THREE.BufferGeometry();
        var i = 0;
        // for (let i=0; i<multilinestring.length; i++){   
            for (let key in multilinestring[0]){  
                i += 1;
             
                var px = normLong(multilinestring[0][key][0])
                var py = normLat(multilinestring[0][key][1])

                linelist.push(new THREE.Vector3(px, py, 1)) 
                
    
        }
            geometry.setFromPoints( linelist );
            var mapMesh = new THREE.Line(geometry,material)         
            geomap.add(mapMesh);
        }

        $.getJSON( "mydata.json", function( data ) {
                
        
            init()

            function init(){

                
                //basic set up---------------------------------
                canvas = document.querySelector('#c');

                scene = new THREE.Scene();
                scene.background = new THREE.Color(0x000000);

			    camera = new THREE.PerspectiveCamera( 80, canvas.clientWidth / canvas.clientHeight, 1, 800 );
                
                camera.position.x = 0;
                camera.position.y = 0;
                camera.position.z = 120;
         

                renderer = new THREE.WebGLRenderer({canvas});
			    renderer.setSize(canvas.clientWidth,canvas.clientHeight);

                //orbit controls
                // controls = new THREE.OrbitControls( camera, renderer.domElement );
                //     controls.rotateSpeed = 0.4;
                //     controls.enableDamping = true;
                //     controls.dampingFactor = .25;
                //     controls.minDistance = 1;
                //     controls.maxDistance = 180;
                

                //trackball camera----------------

                    controls = new TrackballControls( camera, renderer.domElement );
    
                    controls.rotateSpeed = 0.9;
                    controls.zoomSpeed = 1.2;
                    controls.panSpeed = 1;
    
                    controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
    
                function controlsReset(){ controls.reset()}

                $('#reset').bind('click', controlsReset)

                //----------------

                const light = new THREE.AmbientLight( 0x404040, 6); // soft white light
                scene.add( light );

                //add nyc GEOJSON map -----------------------
                geomap = new THREE.Group();

                var mapM = new THREE.LineBasicMaterial({color: 0xd3d3d3,linewidth:1})
                
                for (let key in geonyc.features){
                    geonyc.features[key].geometry.coordinates.forEach( function(shape){

                        wireframe(shape, mapM)
                     
                    })

                }
                geomap.rotation.y = Math.PI
                everything.add(geomap)

                scene.add(everything);

                // scene.add(geomap);
                //----------------------------------------------
                

                
                // check when the browser size has changed and adjust the camera accordingly
                window.addEventListener( 'resize', function( )
                {
                    canvas = document.querySelector('#container'); // keep canvas size ~ the wrapper div
                    var WIDTH = canvas.clientWidth;
                    var HEIGHT = canvas.clientHeight;
                    renderer.setSize( WIDTH, HEIGHT );
                    camera.aspect = WIDTH / HEIGHT;
                    camera.updateProjectionMatrix( );

                }, false );
                

                nodes = new THREE.Group()
                nodes.name = "nodes"
                newNodes();
                everything.add(nodes);
                // scene.add(nodes);
                
                update();
                
                window.addEventListener( 'mousemove', onMouseMove, false );
                document.getElementById("container").addEventListener( 'click', onClick, false );

            }
          			
		function update( )
			{
				var radius = 0.1; 

                requestAnimationFrame( update );
                controls.update(); 
				renderer.render( scene, camera );

                if (prevball != undefined && rotateball){
                    prevball.rotation.y += 0.01;
                }

                if (prevball == undefined){
                    everything.rotation.x = radius - angle;  
                    //everything.rotation.x = radius * Math.cos( angle );  
            
                    angle += 0.001;      
                }
			};
        
        // onclick event --------------------------------
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function onMouseMove( event ) {
            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components
            mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
            onHover();
        }

        function onHover(){
            raycaster.setFromCamera( mouse, camera );
            // calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects( [scene.getObjectByName("nodes")], true);

            if (intersects[0] != undefined){
                $('#container').css('cursor','pointer');
            }
            else {
                $('#container').css('cursor','default');
            }
                
        }
        var rotateball = true;
        var prevpoint = undefined;

        function onClick(){

            raycaster.setFromCamera( mouse, camera );
            // calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects( [scene.getObjectByName("nodes")], true);

            if (intersects[0] != undefined){

                if (prevpoint != undefined){
                    prevpoint.visible = true;
                }
                intersects[0].object.visible = false;
                prevpoint = intersects[0].object;             
                returnClick(intersects[0].object.name)
               
            } else { rotateball = !rotateball }
        }    

        
        var prevball = undefined;
        var prevlightball = undefined;
        var lightball;

        function returnClick(id){

            $.each(data, function(i, v) {
                if (v.id == id) {
              
                    $('#info').fadeOut(300, function() {
                        $(this).html(`<h1 id="infotitle">${v.coname}</h1>`).show()

                    });

                    $('#info2').fadeOut(300, function() {
                        var top = $('#info').position().top + $('#info').outerHeight(true)
                        var text = highlightWord(v.reason,v.group)
                        $(this).css({ top: top+'px' }).html(`<h2>${v.location}</h2><p class="infopara">${v.year}</p><p class="infopara">${text}</p>`).show()
                        
                    });
                 
                    if ($('#header').is(':empty')){$('#header').append(' <h1 id="headertitle">NYC Street Co-Naming</h1>').fadeIn('slow');}

                    //add marker effect
                    var pX = - normLong(v.long),
                        pY = normLat(v.lat),
                        pZ = normZ(v.year),
                        pColor = groupColor[v.group];
                    
                    //pZ = (v.group +2) * 2, highest by group

                    var nodeG = new THREE.ConeGeometry(1,2,6);
                    var nodeM = new THREE.MeshPhongMaterial( { color: pColor, opacity:0.8}); //{ color: 0xffffff, wireframe: true } 
                    var node2 = new THREE.Mesh( nodeG, nodeM);
                    node2.position.set(pX,pY,pZ);
                    node2.rotation.x = - Math.PI /2 ;
                             
                    const boxG = new THREE.ConeGeometry( 4, 8, 6 );
                    const edges = new THREE.EdgesGeometry( boxG);
                    const lb = new THREE.LineSegments( edges,new THREE.LineDashedMaterial( { color: 0xffffff, dashSize: 1, gapSize: 1 } ) );
                    lb.computeLineDistances();

                    node2.add(lb);

                    everything.add(node2);
                    // scene.add( node2 );

                    if (prevball != undefined){
                        scene.remove(prevball)
                        rotateball = true;
                    } 
                    prevball = node2;

                    return;
                }   
            });
        }

        //add nodes to the scene
        function newNodes(){
    

            for (let key in data){
             
                var pX = - normLong(data[key].long),
                    pY = normLat(data[key].lat),
                    pZ = normZ(data[key].year),
                    pColor = groupColor[data[key].group];


                var nodeG = new THREE.BoxGeometry(1,1,1);
                var nodeM = new THREE.MeshBasicMaterial( {color: new THREE.Color(pColor)}); //{ color: 0xffffff, wireframe: true } 
                let node = new THREE.Mesh( nodeG, nodeM);
                node.position.set(pX,pY,pZ);
                // node.rotation.x = Math.PI / 2;
                node.name = data[key].id;
                node.coname = data[key].coname;
                nodes.add( node );


                var dot = new THREE.Vector3(pX,pY,pZ);

                //adding line -----------------------
                const lineM = new THREE.LineDashedMaterial({
                        color: 0xefefef,
                        opacity: 0.5,
                        transparent: true,
                        linewidth: 1,
                        scale: 2,
                        dashSize: 0.5,
                        gapSize: 0.5
                    });

                    const points = [];
                    points.push( new THREE.Vector3( pX,pY,pZ ) );
                    points.push( new THREE.Vector3( pX,pY,0 ) );
                 
                    const lineG = new THREE.BufferGeometry().setFromPoints( points );

                    const line = new THREE.Line( lineG, lineM );
                    line.computeLineDistances();

                    everything.add(line)
                    // scene.add( line );
                //end line -------------------

            }

        }
			
        });
        
    });//end of jQuery GEO JSON

    function highlightWord(k,g){
        var color = groupColor[g].toString(16);
        var b = `<span style="background-color:${color}">`
        var d = '</span>'
        var term = termlist[g]
        var klc = k.toLowerCase()

        for (let t in term){
            var indexT = klc.indexOf(term[t]);
            var lengthT = term[t].length
            
            if (indexT > -1){
                k = [k.slice(0, indexT), b, k.slice(indexT,indexT+lengthT),d, k.slice(indexT+lengthT)].join('')
                klc = k.toLowerCase()
                console.log(k)
                console.log(term[t])
            }
        }

        return k
    }



