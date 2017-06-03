# mlb-batted-balls
A plot of where every ball was hit in the MLB, grouped by stadium (2016). To collect the data, we used a modified version of the mlb-game python library. The data can be found on MLB GameDay's website, from pages like this one:

http://gd2.mlb.com/components/game/mlb/year_2016/month_11/day_02/gid_2016_11_02_chnmlb_clemlb_1/inning/inning_hit.xml

In order to run the visualization, just launch a server from within the working directory (python3 -m http.server) and then visit this site:

http://127.0.0.1:8000/mlb_plot.html

The mlb_gd.py file is what we used to scrape MLB GameDay data, and the bbs-2016.json file is the result. Because the GameDay data identified players by their player ID, we needed the player_ids.csv file to map those IDs to player names. The CSS and HTML are contained in mlb_plot.html, and all JS is in mlb_plot.js.