import json
import pprint
import collections

games_data = {}
roguelike_data = {}
relational_map_data = {}
all_games_by_year = {}
roguelikes_by_year = {}
roguelikes_list = []
begin_time = 0
end_time = 0
line_length = 0

selection_name = ''

screen_width = 1280
screen_height = 800
draw_width = screen_width - 100.0
draw_height = screen_height - 100.0

roguelike_y = draw_height / 2 + 200
all_games_y = draw_height / 2 + 250

def setup():
    size(screen_width, screen_height, "processing.core.PGraphicsRetina2D")
#     size(screen_width, screen_height, P2D)
    global games_data, roguelike_data, relational_map_data, all_games_by_year, roguelikes_by_year, \
           roguelikes_list, begin_time, end_time, line_length
    
    games_data = get_games_data()
    roguelike_data = get_roguelike_data()
    relational_map_data = get_relational_map_data()
    
    all_games_by_year = compile_games_by_year(games_data)
    roguelikes_by_year = compile_games_by_year(roguelike_data)
    for y in sorted(roguelikes_by_year.keys()):
        roguelikes_list += roguelikes_by_year[y]
    
    begin_time = min(all_games_by_year)
    end_time = max(all_games_by_year)
    line_length = draw_width / (end_time - begin_time + 1)
#     pprint.pprint(all_games_by_year, indent=2)
    

def draw():
    background(0)
    colorMode(1, 1, 1, 1, HSB)
    ellipseMode(CORNERS)

    pushMatrix()
    translate(50, 50)
          
    draw_roguelike_links()
    draw_timeline()
    draw_game_title()
    
    popMatrix()


def draw_timeline():
    pushMatrix()
    pushStyle()

    noStroke()
    textSize(8)
    
    for _year, games in roguelikes_by_year.iteritems():
        fill(min(map(len(games), 1, 5, 0.5, 1), 1))
        x = (_year - begin_time) * line_length
        y = roguelike_y
        rect(x, y, line_length*0.9, 4)
        text(_year, x, y-4)
        
    for _year, games in all_games_by_year.iteritems():
        fill(min(map(len(games), 1, 250, 0.5, 1), 1))
        x = (_year - begin_time) * line_length
        y = all_games_y
        rect(x, y, line_length*0.9, 4)
        text(_year, x, y+14)
    
    popStyle()
    popMatrix()
   
     
def draw_roguelike_links():
    pushMatrix()
    pushStyle()
    
    noFill()
    strokeWeight(1)
    stroke(1, 0.2)

    for source, targets in relational_map_data.iteritems():
        _year = int(roguelike_data[source]['First'])
        source_x = (_year - begin_time) * line_length
        source_index = float(roguelikes_by_year[_year][source]['index'])
        source_year_count = len(roguelikes_by_year[_year])
        
        if source == selection_name:
            stroke(1, 0.5, 0.2, 1)
            strokeWeight(2)
        else:
            continue
            stroke(1, 0.2)
            strokeWeight(1)
        
        for target in targets:
            if target in roguelike_data:
                target_year = int(roguelike_data[target]['First'])
                target_x = (target_year -  begin_time) * line_length
                target_index = float(roguelikes_by_year[target_year][target]['index'])
                target_year_count = len(roguelikes_by_year[target_year])
                
                xs = sorted([source_x + 0.9 * line_length * (source_index / source_year_count), 
                             target_x + 0.9 * line_length * (target_index / target_year_count)])
                arc(xs[0], 
                    roguelike_y - abs(target_x - source_x)/2.0,
                    xs[1],
                    roguelike_y + abs(target_x - source_x)/2.0,
                    PI, PI*2)
        
    popStyle()
    popMatrix()
    

def draw_game_title():
    global selection_name
    pushStyle()
    
    mX = map(mouseX, 0, screen_width, (screen_width - draw_width) / 2, (screen_width - draw_width) / 2 + draw_width)
    i = int(min(mX / draw_width, 0.9999) * len(roguelikes_list))
    name = roguelikes_list[i]
    selection_name = name
    textSize(14)
    textAlign(CENTER)
    text('{} ({})'.format(name, roguelike_data[name]['First']), draw_width/2, 25)
    
    popStyle()
    
def compile_games_by_year(games):
    output = {}
    for game, data in games.iteritems():
        try:
            y = data['year']
        except:
            y = data['First']
        if len(y) > 4:
            y = y[:4]
        y = int(y)
        if y not in output:
            output[y] = collections.OrderedDict()
        data.update({'index': len(output[y])})
        output[y].update({game: data})
    return output

def get_games_data():
    with open('games-small.json') as f:
        return json.loads(f.read())
    
def get_roguelike_data():
    with open('roguelike-games.json') as f:
        games = json.loads(f.read())
        for game in games:
            y = games[game]['First']
            if len(y) > 4:
                y = y[:4]
            games[game]['First'] = y
        return games
            
def get_relational_map_data():
    with open('roguelike-relational-maps.json') as f:
        return json.loads(f.read())


