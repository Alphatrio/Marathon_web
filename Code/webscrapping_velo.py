# -*- coding: utf-8 -*-
#! /usr/bin/python3
"""
Created on Tue Mar  8 15:31:32 2022

@author: Corentin
"""
import xmltodict
import requests
from elasticsearch import Elasticsearch
import time;



ts = int(time.time())

result_velo = xmltodict.parse(requests.get('https://data.montpellier3m.fr/sites/default/files/ressources/TAM_MMM_VELOMAG.xml').content)

dic_velo = {'dateTime':ts,'Stations_velo': []}
for station in result_velo['vcs']['sl']['si']:
    temp_park_dic = {'Name' : station['@na'], 'Free':station['@fr'], 'Total': station['@to'],
                    'Occupied':station['@av'],'x_pos': station['@lg'], 'y_pos':station['@la']}
    dic_velo['Stations_velo'].append(temp_park_dic)
    
es = Elasticsearch(
    cloud_id='MarathonDuWeb:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGZhMzJkNzYyNzFjYzQ4OTRhNjk2ZWQ4NTVhYjkwMDgyJGZjOTk1YzA0ZmYyYjQ5ZmM4OTliYjAwODNkYzA5N2U0',
    basic_auth=('elastic', 'QjTCAIOmAkkqqTIGjeEeD63q')
)

es.index(
 index='velo_index',
 document=dic_velo)    