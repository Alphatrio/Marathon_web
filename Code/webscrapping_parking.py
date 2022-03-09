# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""

import xmltodict
import requests
from elasticsearch import Elasticsearch
import time;



ts = int(time.time())

geo_loc_parking = {
    'ANTI' : [3.888819,43.608716,'MTP'],
    'COME' : [3.879762,43.608561,'MTP'],
    'CORU' : [3.882258,43.613888,'MTP'],
    'EURO' : [3.892531,43.607850,'MTP'],
    'FOCH' : [3.876571,43.610749,'MTP'],
    'GAMB' : [3.871374,43.606951,'MTP'],
    'GARE' : [3.878551,43.603291,'MTP'],
    'TRIA' : [3.881844,43.609234,'MTP'],
    'ARCT' : [3.873201,43.611003,'MTP'],
    'PITO' : [3.870191,43.612245,'MTP'],
    'CIRC' : [3.917849,43.604954,'MTP'],
    'SABI' : [3.860225,43.583833,'MTP'],
    'GARC' : [3.890716,43.590985,'MTP'],
    'SABL' : [3.922295,43.634192,'MTP'],
    'MOSS' : [3.819666,43.616237,'MTP'],
    'SJLC' : [3.837931,43.570822,'STJ'],
    'MEDC' : [3.827724,43.638954,'MTP'],
    'OCCI' : [3.848598,43.634562,'MTP'],
    'VICA' : [3.898426,43.632771,'CAS'],
    'GA250' : [3.914415,43.605344,'MTP'],
    'CDGA' : [3.897762,43.628542,'CAS'],
    'ARCE' : [3.867491,43.611716,'MTP'],
    'POLY' : [3.884765,43.608371,'MTP']}

dic_park = {'dateTime' : ts, 'Parkings':[]}
for nom_parking in geo_loc_parking:
    dict_data = xmltodict.parse(requests.get('https://data.montpellier3m.fr/sites/default/files/ressources/FR_'+geo_loc_parking[nom_parking][2]+'_'+nom_parking+'.xml').content)
    
    temp_park_dic = {'Name' : nom_parking, 'Status':dict_data['park']['Status'],
                    'Free':dict_data['park']['Free'], 'Total': dict_data['park']['Total'],
                    'x_pos': geo_loc_parking[nom_parking][0], 'y_pos':geo_loc_parking[nom_parking][1]}
    
    dic_park['Parkings'].append(temp_park_dic)
    
es = Elasticsearch(
    cloud_id='MarathonDuWeb:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvJGZhMzJkNzYyNzFjYzQ4OTRhNjk2ZWQ4NTVhYjkwMDgyJGZjOTk1YzA0ZmYyYjQ5ZmM4OTliYjAwODNkYzA5N2U0',
    basic_auth=('elastic', 'QjTCAIOmAkkqqTIGjeEeD63q')
)

es.index(
 index='car_parking_index',
 document=dic_park)