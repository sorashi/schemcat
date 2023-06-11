#! /usr/bin/python3
import xml.etree.ElementTree as ET
import os
import copy
import sys

tree = ET.parse(sys.argv[1])
root = tree.getroot()
layers = {}
for g in root.findall('{http://www.w3.org/2000/svg}g'):
	name = g.get('{http://www.inkscape.org/namespaces/inkscape}label')
	layers[name] = g.get('id')

query = sys.argv[2]

if query in layers:
  print(layers[query])
else:
  print("No layer found", file=sys.stderr)
  exit(1)

