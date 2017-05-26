import mlbgame
import time
import json # may remove this in favor of csv
import csv
from datetime import datetime, timedelta
from collections import defaultdict
from lxml import etree
import os
import sys

try:
	from urllib.request import urlopen
	from urllib.error import HTTPError
except ImportError:
	from urllib2 import urlopen, HTTPError

def get_bip(game_id):
	year, month, day, rest = game_id.split('_', 3)
	# file
	filename = "gameday-data/year_%s/month_%s/day_%s/gid_%s/inning/inning_hit.xml" % (year, month, day, game_id)
	file = os.path.join(os.path.dirname(__file__), filename)
	# check if file exits
	if os.path.isfile(file):
		data = file
	else:
		# get data if file does not exist
		try:
			data = urlopen("http://gd2.mlb.com/components/game/mlb/year_%s/month_%s/day_%s/gid_%s/inning/inning_hit.xml" % (year, month, day, game_id))
			return data
		except HTTPError:
			pass
			# raise ValueError("Could not find a game with that id.")
	return ""

def player_info(player_id):
	"""Return dictionary of information about a player with matching id."""

	output = {}
	with open('player_ids.csv') as csvfile:
		reader = csv.reader(csvfile, delimiter=',', quotechar='|')
		for row in reader:
			if row[0] == player_id:
				output['name'] = row[1]
				output['pos'] = row[2]
				output['bats'] = row[5]
				output['throws'] = row[6]
				output['birth_year'] = row[7]
	return output

def get_jason_kipnis_events(game_id):
	# get XML from data module, if valid game ID
	data = get_bip(game_id)
	if data:
		# parse XML
		parsed = etree.parse(data)
		root = parsed.getroot()
		# empty output file
		output = []
		hits = root.findall('hip')
		for hit in hits:
			if player_info(hit.attrib['batter']) and player_info(hit.attrib['pitcher']):
				batterData = player_info(hit.attrib['batter'])
				if batterData['name'] == 'Jason Kipnis':
					pitcherData = player_info(hit.attrib['pitcher'])
					hitData = {'x':float(hit.attrib['x']),
								'y':float(hit.attrib['y']),
								'type':hit.attrib['type'],
								'pitcher_throws':pitcherData['throws']}
					output.append(hitData)
		return output
	return ""

def bip_events(game_id):
	"""Return dictionary of batted balls put in play for a game with matching id."""

	# get XML from data module, if valid game ID
	data = get_bip(game_id)
	if data:
		# parse XML
		parsed = etree.parse(data)
		root = parsed.getroot()
		# empty output file
		output = []
		hits = root.findall('hip')
		for hit in hits:
			if player_info(hit.attrib['batter']) and player_info(hit.attrib['pitcher']):
				batterData = player_info(hit.attrib['batter'])
				pitcherData = player_info(hit.attrib['pitcher'])
				hitData = {'x':float(hit.attrib['x']),
							'y':float(hit.attrib['y']),
							'des':hit.attrib['des'],
							'type':hit.attrib['type'],
							'batter_name':batterData['name'],
							'batter_pos':batterData['pos'],
							'batter_bats':batterData['bats'],
							'batter_age':2016 - int(batterData['birth_year']),
							'pitcher_name':pitcherData['name'],
							'pitcher_throws':pitcherData['throws'],
							'pitcher_age':2016 - int(pitcherData['birth_year'])}
				output.append(hitData)
		return output
	return ""

def write_output():
	"""Write data to a JSON/CSV file."""

	print "gathering data..."

	# jsonData = defaultdict(list)

	# April 3rd was opening day
	# d = datetime(2016,4,3)

	# October 2nd was the end of the regular season
	# while not (d.month == 10 and d.day == 2):
	# 	for game in mlbgame.day(d.year, d.month, d.day):
	# 		print game.game_id
	# 		balls_in_play = bip_events(game.game_id)
	# 		if balls_in_play:
	# 			jsonData[game.home_team].extend(balls_in_play)
	# 	d += timedelta(days=1)

	# with open('bbs-2016.json', 'w') as outfile:
	# 	json.dump(jsonData, outfile)



	""" CSV output for applied regression """

	csvData = defaultdict(list)

	varList = ['x','y', 'type', 'pitcher_throws']

	opening_days = {2012:(3,28),2013:(3,31),2014:(3,22),2015:(4,5),2016:(4,3),2017:(4,2)}
	closing_days = {2012:(10,3),2013:(9,30),2014:(9,28),2015:(10,4),2016:(10,2),2017:(5,22)}

	with open('bbs-jason_kipnis.csv', 'wb') as csv_file:
		header = ['year', 'month']
		header.extend(varList)
		writer = csv.writer(csv_file)
		writer.writerow(header)
		for year in range(2012,2018):
			d = datetime(year, opening_days[year][0], opening_days[year][1])
			while not (d.month == closing_days[year][0] and d.day == closing_days[year][1]):
				for game in mlbgame.day(d.year, d.month, d.day):
					if game.home_team == "Indians" or game.away_team == "Indians":
						print game.away_team, "at", game.home_team
						balls_in_play = get_jason_kipnis_events(game.game_id)
						if balls_in_play:
							for ball in balls_in_play:
								row = [d.year,d.month]
								row.extend([ball[var] for var in varList])
								writer.writerow(row)
				d += timedelta(days=1)

		# for month in csvData:
		# 	for hit in csvData[month]:
		# 		if hit['batter_name'] == 'Jason Kipnis':
		# 			row = [month]
		# 			row.extend([hit[var] for var in varList])
		# 			writer.writerow(row)

if __name__=='__main__':
	# write_output()
	with open('bbs-2016.json') as fileData:
		d = json.load(fileData)
		# print {k:len(d[k]) for k in d.keys()}
		count = 0
		for park in d:
			for hit in d[park]:
				print hit
				break
			break
		print count

# e = mlbgame.events.game_events('2016_11_02_chnmlb_clemlb_1')

# count = 0

# start = time.time()
# for inning in e:
# 	for half in e[inning]:
# 		for atbat in e[inning][half]:
# 			if atbat['pitches'][-1]['type'] == 'X':
# 				count += 1
# end = time.time()

# print "{} number of balls put in play (only counting last pitch of AB, took {} seconds)".format(count, end-start)

# count = 0

# start = time.time()
# for inning in e:
# 	for half in e[inning]:
# 		for atbat in e[inning][half]:
# 			for pitch in atbat['pitches']:
# 				if pitch['type'] == 'X':
# 					count += 1
# end = time.time()

# gd = data.get_game_events('2016_11_02_chnmlb_clemlb_1')