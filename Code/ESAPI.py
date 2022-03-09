# -*- coding: utf-8 -*-
from flask import Flask
from elasticsearch import Elasticsearch


app = Flask(__name__)

@app.route("/getAllParking")
def get_all_parking():
    es = Elasticsearch(
    cloud_id='MarathonDuWeb:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGZhMzJkNzYyNzFjYzQ4OTRhNjk2ZWQ4NTVhYjkwMDgyJGZjOTk1YzA0ZmYyYjQ5ZmM4OTliYjAwODNkYzA5N2U0',
    basic_auth=('elastic', 'QjTCAIOmAkkqqTIGjeEeD63q')
    )
    
    result = es.search(
     index='car_parking_index',
      sort='dateTime:desc',
        size=1
     )
    
    return(result['hits']['hits'][0]['_source'])

@app.route("/getAllVelo")
def get_all_velo():
    es = Elasticsearch(
    cloud_id='MarathonDuWeb:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGZhMzJkNzYyNzFjYzQ4OTRhNjk2ZWQ4NTVhYjkwMDgyJGZjOTk1YzA0ZmYyYjQ5ZmM4OTliYjAwODNkYzA5N2U0',
    basic_auth=('elastic', 'QjTCAIOmAkkqqTIGjeEeD63q')
    )
    
    result = es.search(
     index='velo_index',
      sort='dateTime:desc',
        size=1
     )
    
    return(result['hits']['hits'][0]['_source'])


if __name__ == "__main__":
    app.run(debug=True)