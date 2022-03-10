var featureList, boroughSearch = [], parkingSearch = [], velomaggSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

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

//Revenir au zoom initial
$("#full-extent-btn").click(function() {
  map.fitBounds(markerClusters.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

//menu de la navbar se rétrécie si format téléphone
$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

//fonctions liées à l'affichage de la sidebar (liste des parkings et stations Velomagg')
$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});


if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

//
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
  /* Boucle à travers la couche des parkings pour ajouter seulement ceux qui sont dans les limites de la carte. */
  parkings.eachLayer(function (layer) {
    if (map.hasLayer(parkingLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="15" height="15" src="assets/img/Parking.png"></td><td class="feature-name">' + layer.feature.properties.nom + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Boucle à travers la couche des stations Velomagg' pour ajouter seulement celles qui sont dans les limites de la carte. */
  velomaggs.eachLayer(function (layer) {
    if (map.hasLayer(velomaggLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="assets/img/velo.png"></td><td class="feature-name">' + layer.feature.properties.name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Mise à jour de la featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Couche principale de la carte */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});

//Couches secondaires de la map
//Couche sur laquelle on positionne les points d'intérêts
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};


/* Couches de clusters selon le niveau de zoom */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 13
});



//Création des layers vides parking et stations Velomagg' puis récupération des data
//parkingLayer
var parkingLayer = L.geoJson(null);
var parkings = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/Parking.png",
        iconSize: [20, 20],
        iconAnchor: [12, 28], //déplacement léger de l'icône par rapport aux coordonnées
        popupAnchor: [0, -25]
      }),
      title: feature.properties.nom,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.nom + "</a></td></tr>" + "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.nom);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
          parkingSearch.push({
            name: layer.feature.properties.nom,
            source: "Parkings",
            id: L.stamp(layer),
            lat: layer.feature.geometry.coordinates[1],
            lng: layer.feature.geometry.coordinates[0]
          });
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="16" height="16" src="assets/img/Parking.png"></td><td class="feature-name">' + layer.feature.properties.nom + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

    }
  }
});
$.getJSON("data/parkings.geojson", function (data) {
  parkings.addData(data);
  map.addLayer(parkingLayer);
});


//velomaggLayer
var velomaggLayer = L.geoJson(null);
var velomaggs = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/velo.png",
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
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="20" height="20" src="assets/img/velo.png"></td><td class="feature-name">' + layer.feature.properties.name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
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
$.getJSON("data/velomagg.geojson", function (data) {
  velomaggs.addData(data);
  map.addLayer(velomaggLayer);
});




map = L.map("map", {
  zoom: 13,
  center: [43.6, 3.8833],
  layers: [cartoLight, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});



//Ajout/suppression sur la même couches des parkings et stations Velomagg'
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

/* Filtre la liste des points d'intérêts de la barre latérale pour n'afficher que ceux situées dans les limites de la carte actuelle. */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Mise en évidence des caractéristiques lorsque l'on clique sur la carte */
map.on("click", function(e) {
  highlight.clearLayers();
});


/* Contrôle des attributions en bas de page*/
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
  div.innerHTML = "<span class='hidden-xs'>Équipe 3 - Marathon du web | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);


var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);


/* Géolocalisation */
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

/* Les écrans plus grands bénéficient d'un contrôle étendu des couches et d'une barre latérale visible. */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

//Filtre en haut à droite
var baseLayers = {
  "Montpellier": cartoLight
};

var groupedOverlays = {
  "Points d'intérêts": {
    "<img src='assets/img/Parking.png' width='16' height='16'>&nbsp;Parkings": parkingLayer,
    "<img src='assets/img/velo.png' width='22' height='22'>&nbsp;Stations Velomagg'": velomaggLayer
  },
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);



$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});



// Patch Leaflet permettant de faire défiler la map (et donc les couches) sur un écran tactile
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
