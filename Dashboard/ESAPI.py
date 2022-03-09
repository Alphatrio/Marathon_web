# -*- coding: utf-8 -*-
from flask import Flask, render_template
from geojson import Point, Feature, FeatureCollection, dump
from elasticsearch import Elasticsearch



es = Elasticsearch(cloud_id='MarathonDuWeb:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGZhMzJkNzYyNzFjYzQ4OTRhNjk2ZWQ4NTVhYjkwMDgyJGZjOTk1YzA0ZmYyYjQ5ZmM4OTliYjAwODNkYzA5N2U0'
,api_key=('JrOwbn8Bu-QUkx0oK2Ec','jk5xE6kET6q1kH8v7ytQmA'))

app = Flask(__name__)

@app.route("/getAllParking")
def get_all_parking():
    
    features = []    
    resp = es.search(
        index='car_parking_index',
        body={"sort": [
        { "dateTime" : {"order" : "desc"} },
      ]},
        size=1
    )
    for parking in resp['hits']['hits'][0]['_source']['Parkings']:
        point = Point((parking['x_pos'], parking['y_pos']))
        features.append(Feature(geometry=point, properties={'ID_name':parking['Name'], 'Status':parking['Status'], 'Free':parking['Free'], 'Total':parking['Total']}))
    feature_collection = FeatureCollection(features)
    
    with open('static/data/parkings.geojson', 'w') as f:
        dump(feature_collection, f)
        
    return ('', 204)

@app.route("/getAllVelo")
def get_all_velo():
    
    features = []    
    resp = es.search(
        index='velo_index',
        body={"sort": [
        { "dateTime" : {"order" : "desc"} },
      ]},
        size=1
    )
    for station in resp['hits']['hits'][0]['_source']['Stations_velo']:
        point = Point((float(station['x_pos']), float(station['y_pos'])))
        features.append(Feature(geometry=point, properties={'name':station['Name'],'Free':station['Free'], 'Total':station['Total'], 'Occupied':station['Occupied']}))
    feature_collection = FeatureCollection(features)
    
    with open('static/data/velomagg.geojson', 'w') as f:
        dump(feature_collection, f)
        
    return ('', 204)

@app.route('/')
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
    
    
    