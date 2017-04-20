var cors = require( 'cors' )
var express = require( 'express' );
var compress = require('compression');

var app = express( );
var fs = require( 'fs' );
var pg = require( 'pg' );
var sets = {
	// sensors_pk: { file: 'sql_ahn3/sensors_pk.sql',sql: ''},
	// geodan_pk: { file: 'sql_ahn3/geodan_pk.sql',sql: ''},
	// rwspoints: { file: 'sql_ahn3/rws_points.sql',sql: ''},
	kade: { file: 'sql_ahn3/bgt_kade.sql',sql: ''},
	steiger: { file: 'sql_ahn3/bgt_steiger.sql',sql: ''},
	water: { file: 'sql_ahn3/bgt_water.sql',sql: ''},
	bridge: { file: 'sql_ahn3/bgt_bridge.sql',sql: ''},
	bridgepilons: { file: 'sql_ahn3/bgt_bridgepilons.sql',sql: ''},
	scheiding: { file : 'sql_ahn3/bgt_scheiding.sql',sql: ''},
	terrain: { file : 'sql_ahn3/bgt_terrain.sql',sql: ''},
	roads: { file : 'sql_ahn3/bgt_road.sql',sql: ''},
	buildings: { file : 'sql_ahn3/bgt_buildings.sql', sql : '' },
	// roofskeleton: { file : 'sql_ahn3/bgt_roofskeleton.sql', sql : '' },
	// treepoints: { file : 'sql_ahn3/bgt_treepoints.sql', sql : '' },
	// treepoints: { file : 'sql_ahn3/ahn3_treepoints.sql', sql : '' },
	treepoints: { file : 'sql_ahn3/bgt_ahn3_treepoints.sql', sql : '' },
	// treepoints_ahn2: { file : 'sql_ahn3/bgt_ahn2_treepoints.sql', sql : '' },
	// groundpoints: { file: 'sql_ahn3/bgt_groundpoints.sql', sql: '' },
	// lights: { file : 'sql_ahn3/bgt_lights.sql', sql : '' },
	// adam3dfied_BuildingPart: { file : 'sql_ahn3/adam3dfied_BuildingPart.sql', sql : '' },
	// adam3dfied_Waterdeel: { file : 'sql_ahn3/adam3dfied_Waterdeel.sql', sql : '' },
	// adam3dfied_OnbegroeidTerreindeel: { file : 'sql_ahn3/adam3dfied_OnbegroeidTerreindeel.sql', sql : '' },
	// adam3dfied_TrafficArea: { file : 'sql_ahn3/adam3dfied_TrafficArea.sql', sql : '' },
	// adam3dfied_PlantCover: { file : 'sql_ahn3/adam3dfied_PlantCover.sql', sql : '' },
	// adam3dfied_Scheiding: { file : 'sql_ahn3/adam3dfied_Scheiding.sql', sql : '' },
	// adam3dfied_BridgeConstructionElement: { file : 'sql_ahn3/adam3dfied_BridgeConstructionElement.sql', sql : '' }
};
for( var s in sets ) {
	sets [ s ].sql = fs.readFileSync( sets [ s ].file ).toString( );
};
app.use( cors( ));
app.use(compress());
app.get( '/bgt3d', function( req, res ) {
	var north = req.query [ 'north' ];
	var south = req.query [ 'south' ];
	var west = req.query [ 'west' ];
	var east = req.query [ 'east' ];
	var set = req.query [ 'set' ];
	var eps = req.query [ 'eps' ] || 3;
	var minpoints = req.query [ 'minpoints' ] || 350;

	if (!north || !south || !west || !east || !set){
		res.send('Missing parameter');
		console.log('Missing parameter');
	}
	else if (!sets[set]){
		res.send('Not such set found: ' + set);
		console.log('Not such set found: ' + set);
	}
	else {
		var client = new pg.Client( {
			user : 'postgres',
			password : ' ',
			database : 'ahn3',
			host : 'database',
			port : 5432
		} );

		var querystring = fs.readFileSync( sets [ set ].file ).toString( );
		client.connect( function( err ) {
			if( err ) {
				res.send(err)
			}
			console.log('Set: ',set);
			//var querystring = sets [ set ].sql;
			querystring = querystring
					.replace( /_west/g, west )
					.replace( /_east/g, east )
					.replace( /_south/g, south )
					.replace( /_north/g, north )
					.replace( /_eps/g ,eps)
					.replace( /_minpoints/g ,minpoints)
					.replace( /_zoom/g ,1)
					.replace( /_segmentlength/g,10);
			client.query( querystring, function( err, result ) {
				if( err ) {
					console.warn( err, querystring );
				}
				//console.log(querystring);
				var resultstring = '';
				for (var key in result.rows[0]){
					resultstring += key + ','
				}
				resultstring += "\n";
				result.rows.forEach( function( row ) {
					for (var key in row){
						resultstring += row[key] + ','
					}
					resultstring += '\n';
				} );
				res.set( "Content-Type", 'text/plain' );
				res.send(resultstring);
				console.log( 'Sending results', result.rows.length );
				client.end( );
			} );
		} );
	}
} );
app.get( '/', function( req, res ) {
	res.send( 'Nothing to see here, move on!' );
} );
app.listen( 8081, function( ) {
	console.log( 'BGT X3D service listening on port 8081' );
} );
