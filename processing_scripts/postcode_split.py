import csv
import json

postcodeFile = 'data/ONSPD_FEB_2021_UK.csv'
imdFile = 'data/IoD2019_Domains_of_Deprivation.csv'

imd = {}
processedData = {}

#build a look of the IMD based on LSOA value
print('Building IMD lookup')
with open(imdFile, newline='') as csvfile:
    csvreader = csv.reader(csvfile, delimiter=',', quotechar='"')
    for row in csvreader:
    	imd[row[0]] = [row[2],row[3],row[4],row[6]]

#process each postcode in csv and join IMD data
print('Processing Postcodes')
with open(postcodeFile, newline='') as csvfile:
    csvreader = csv.reader(csvfile, delimiter=',', quotechar='"')
    for row in csvreader:

    		#get the start of the postcode (3 or 4 character before space) and lsoa value for join
    		postcodeStart = row[2].split(' ')[0]
    		lsoa = row[34]

    		#check if in England or not
    		if(row[49] not in ['N99999999','S99999999','W99999999','stp','','L99999999','M99999999']):

    			#retrieve IMD data for the lsoa
	    		imdData = imd[lsoa]

	    		#add postcodestart to processed data if not already there
	    		if postcodeStart not in processedData:
	    			processedData[postcodeStart] = {}

	    		#clean postcodes by removing spaces
	    		fullCode = row[0].replace(' ','')

	    		#add full postcode with data
	    		processedData[postcodeStart][fullCode] = [row[42],row[43],imdData[0],imdData[1],imdData[2],imdData[3]]

print('Saving New Files')
#save one files for each postcode start value
for key in processedData:
	file = key+'.json'
	print(file)
	with open('../processed_data/'+file, 'w') as outfile:
		json.dump(processedData[key], outfile)

