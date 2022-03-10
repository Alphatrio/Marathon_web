var featureList, boroughSearch = [], parkingSearch = [], velomaggSearch = [];

$.ajax({
    url: "/getAllParking"
});

$.ajax({
    url: "/getAllVelo"
});

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

//fonctions liées à l'affichage de la sidebar (liste des parkings et stations Velomagg')
$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

//Cacher la sidebar
$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

//Afficher la side bar si cachée
$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

//Afficher la section 'À propos' au click
$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

//Afficher la légende - mais elle est supprimée
$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});


//Liste des points d'intérêts
function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through theaters layer and add only features which are in the map bounds */
  parkings.eachLayer(function (layer) {
    if (map.hasLayer(parkingLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="/static/assets/img/Parking.png"></td><td class="feature-name">' + layer.feature.properties.ID_name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Loop through museums layer and add only features which are in the map bounds */
  velomaggs.eachLayer(function (layer) {
    if (map.hasLayer(velomaggLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="18" src="/static/assets/img/velo.png"></td><td class="feature-name">' + layer.feature.properties.name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});

//overlay layer
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};


/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});




//récupération des data parkings et vélos
/* Empty layer placeholder to add to layer control for listening when to add/remove theaters to markerClusters layer */
var parkingLayer = L.geoJson(null);
var parkings = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "/static/assets/img/Parking.png",
        iconSize: [24, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.ID_name,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    // console.log(feature)
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.ID_name + "</a></td></tr><tr><th>Free</th><td>" + feature.properties.Free + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.ID_name);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
          parkingSearch.push({
            name: layer.feature.properties.ID_name,
            source: "Parkings",
            id: L.stamp(layer),
            lat: layer.feature.geometry.coordinates[1],
            lng: layer.feature.geometry.coordinates[0]
          });
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="16" src="/static/assets/img/Parking.png"></td><td class="feature-name">' + layer.feature.properties.ID_name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

    }
  }
});

console.log('heloo')
console.log(parkings)
console.log('heloo')

$.getJSON("/static/data/parkings.geojson", function (data) {
  console.log(parkingLayer);
  console.log(data)
  parkings.addData(data);
  map.addLayer(parkingLayer);
});

console.log('heloo')
console.log(parkings)
console.log('heloo')

/* Empty layer placeholder to add to layer control for listening when to add/remove museums to markerClusters layer */

var velomaggLayer = L.geoJson(null);
var velomaggs = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "/static/assets/img/velo.png",
        iconSize: [24, 24],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.name,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.name + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.name);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="/static/assets/img/velo.png"></td><td class="feature-name">' + layer.feature.properties.name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      velomaggSearch.push({
        name: layer.feature.properties.name,
        source: "Velomagg'",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("/static/data/velomagg.geojson", function (data) {
  console.log(velomaggLayer);
  velomaggs.addData(data);
  map.addLayer(velomaggLayer); //ligne ajoutée
});


// function display_news(result){
//     console.log("Nous allons afficher les articles de presse");
//     console.log(result)
// }

// function show_error(result){
//   console.log(result)
// }


map = L.map("map", {
  zoom: 13,
  center: [43.6, 3.8833],
  layers: [cartoLight, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});



/*
var map = L.map('map');
map.setView([43.6, 3.8833], 13);
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
  maxZoom: 17, minZoom: 9}).addTo(map);

L.tileLayer( 'http://tiles.mapc.org/trailmap-onroad/{z}/{x}/{y}.png',
  {
    maxZoom: 17,          PISTES CYCLABLES
    minZoom: 9
  }
).addTo(map);
*/

//SynSidebar appel
/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === parkingLayer) {
    markerClusters.addLayer(parkings);
    syncSidebar();
  }
  if (e.layer === velomaggLayer) {
    markerClusters.addLayer(velomaggs);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === parkingLayer) {
    markerClusters.removeLayer(parkings);
    syncSidebar();
  }
  if (e.layer === velomaggLayer) {
    markerClusters.removeLayer(velomaggs);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}

map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);


/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": cartoLight
};

var groupedOverlays = {
  "Points d'intérêts": {
    "<img src='/static/assets/img/Parking.png' width='19' height='19'>&nbsp;Parkings": parkingLayer,
    "<img src='/static/assets/img/velo.png' width='24' height='24'>&nbsp;Stations Velomagg'": velomaggLayer
  },
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});










var parkIcon = L.icon({
  iconUrl: '/static/assets/img/parking.png',
  iconSize: [20,20]
});

var veloIcon = L.icon({
  iconUrl: '/static/assets/img/velo.png',
  iconSize: [25,25]
});
/*
$.ajax({
  url: "data/parkings.geojson",
  dataType: "json",
  success: function(parking){
    var parkLayer = L.geoJson(parking, { pointToLayer: function(feature,latlng){
      var marker = L.marker(latlng,{icon: parkIcon});
      marker.bindPopup(feature.properties.nom + " " + feature.properties.adresse);
      return marker;
    }})
    .addTo(map);
    //var clusters = L.markerClusterGroup();
    //clusters.addLayer(parkLayer);
    //map.addLayer(clusters);
  }
});

$.ajax({
  url: "data/Velomagg.geojson",
  dataType: "json",
  success: function(velo){

    var veloLayer = L.geoJson(velo, { pointToLayer: function(feature,latlng){
      var marker = L.marker(latlng,{icon: veloIcon});
      marker.bindPopup(feature.properties.name);
      return marker;
    }})
    .addTo(map);
    console.log(velomaggLayer);
  }
});

*/
