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

screen_width = 1000
screen_height = 850
draw_width = screen_width - 100.0
draw_height = screen_height - 100.0

text_number = createFont("LucidaSans", 8)
text_normal = createFont("Georgia", 10)
text_bold = createFont("Georgia-Bold", 10)

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
    
    begin_time = min(min(all_games_by_year), min(roguelikes_by_year))
    end_time = max(max(all_games_by_year), max(roguelikes_by_year))
    line_length = draw_width / (end_time - begin_time + 1)
    

def draw():
    colorMode(HSB, 1, 1, 1, 1)
    background(1)
    ellipseMode(CORNERS)

    pushMatrix()
    translate(75, 50)
    
    draw_roguelike_links()
    draw_timeline()
    
    popMatrix()


def draw_timeline():
    pushMatrix()
    pushStyle()

    noStroke()
    textSize(8)
#     textFont(text_number)
    
    for _year, games in all_games_by_year.iteritems():
        fill(map(_year, begin_time, end_time, 0, 1),
             0.9, 
             0.5, 
             map(len(games), 1, 250, 0.5, 0.7))
        x = (_year - begin_time) * line_length
        y = draw_height/2
        rect(x, y, line_length*0.9, 2)
        text(_year, x, y+12)
    fill(0, 0.9, 0.5, 1)
    text('ALL GAMES', (screen_width - draw_width) / 2 - 100, draw_height/2+12)
    
    for _year, games in roguelikes_by_year.iteritems():
        fill(map(_year, begin_time, end_time, 0, 1), 
             0.9, 
             0.5, 
             map(len(games), 1, 5, 0.5, 0.8))
        x = (_year - begin_time) * line_length
        y = draw_height/2
        rect(x, y, line_length*0.9, 2)
        text(_year, x, y-4)
    fill(0, 0.9, 0.5, 1)
    text('ROGUELIKE', (screen_width - draw_width) / 2 - 100, draw_height/2-4)
    
    popStyle()
    popMatrix()
   
     
def draw_roguelike_links():
    pushMatrix()
    pushStyle()
    
    noFill()
    strokeWeight(1)
    stroke(0, 0.2)

    for source, targets in relational_map_data.iteritems():
        _year = int(roguelike_data[source]['First'])
        source_x = (_year - begin_time) * line_length
        source_index = float(roguelikes_by_year[_year][source]['index'])
        source_year_count = len(roguelikes_by_year[_year])
        
        for target in set(targets):
            if target in roguelike_data:
                target_year = int(roguelike_data[target]['First'])
                target_x = (target_year -  begin_time) * line_length
                target_index = float(roguelikes_by_year[target_year][target]['index'])
                target_year_count = len(roguelikes_by_year[target_year])
                
                if source == selection_name:
                    stroke(map(_year, begin_time, end_time, 0, 1), 0.9, 0.8, 0.75)
                    strokeWeight(2)
                else:
                    stroke(map(_year, begin_time, end_time, 0, 1), 0.9, 0.8, 0.5)
                    strokeWeight(1)
                
                xs = sorted([source_x + 0.9 * line_length * (source_index / source_year_count), 
                             target_x + 0.9 * line_length * (target_index / target_year_count)])
                arc(xs[0], 
                    draw_height/2 - abs(xs[1] - xs[0])/2.0 - 15,
                    xs[1],
                    draw_height/2 + abs(xs[1] - xs[0])/2.0 - 15,
                    PI, PI*2)
                
            elif target in games_data:                    
                target_year = int(games_data[target]['year'])
                target_x = (target_year -  begin_time) * line_length
                target_index = float(all_games_by_year[target_year][target]['index'])
                target_year_count = len(all_games_by_year[target_year])
                
                if source == selection_name:
                    stroke(map(_year, begin_time, end_time, 0, 1), 0.9, 0.7, 0.5)
                    strokeWeight(2)
                else:
                    stroke(map(_year, begin_time, end_time, 0, 1), 0.9, 0.7, 0.2)
                    strokeWeight(1)
                
                xs = sorted([source_x + 0.9 * line_length * (source_index / source_year_count), 
                             target_x + 0.9 * line_length * (target_index / target_year_count)])
                arc(xs[0], 
                    draw_height/2 - abs(xs[1] - xs[0])/2.0 + 16,
                    xs[1],
                    draw_height/2 + abs(xs[1] - xs[0])/2.0 + 16,
                    0, PI)
        
    # Draw labels
    if selection_name:
        label_boundaries = []
        _year = int(roguelike_data[selection_name]['First'])
        source_x = (_year - begin_time) * line_length
        source_index = float(roguelikes_by_year[_year][selection_name]['index'])
        source_year_count = len(roguelikes_by_year[_year])
        
        label_x = source_x + 0.9 * line_length * (source_index / source_year_count)
#         label_boundaries, label_x = adjust_label(label_boundaries, label_x)
        label_y = draw_height/2 - 15
        draw_label(selection_name, 
                label_x, 
                label_y, 
                (map(_year, begin_time, end_time, 0, 1), 0.9, 0.8, 1),
                -PI/2,
                10,
                x_offset=0,
                bold=True)
        
        for target in set(relational_map_data[selection_name]):
            if target in roguelike_data:
                target_year = int(roguelike_data[target]['First'])
                target_x = (target_year -  begin_time) * line_length
                target_index = float(roguelikes_by_year[target_year][target]['index'])
                target_year_count = len(roguelikes_by_year[target_year])
                
                label_x = target_x + 0.9 * line_length * (target_index / target_year_count)
#                 label_boundaries, label_x = adjust_label(label_boundaries, label_x)
                label_y = draw_height/2 - 15
                
                draw_label(target, 
                        label_x, 
                        label_y, 
                        (map(_year, begin_time, end_time, 0, 1), 0.9, 0.8, 0.75),
                        direction=-PI/2,
                        size=10,
                        x_offset=0)
                
            elif target in games_data:                    
                target_year = int(games_data[target]['year'])
                target_x = (target_year -  begin_time) * line_length
                target_index = float(all_games_by_year[target_year][target]['index'])
                target_year_count = len(all_games_by_year[target_year])
                
                label_x = target_x + 0.9 * line_length * (target_index / target_year_count)
#                 label_boundaries, label_x = adjust_label(label_boundaries, label_x)
                label_y = draw_height/2 + 16
                
                draw_label(target, 
                        label_x, 
                        label_y, 
                        (map(_year, begin_time, end_time, 0, 1), 0.9, 0.8, 0.5),
                        direction=PI/2,
                        size=10,
                        x_offset=0)
                
#         # Debugging label shifting
#         for left, right in label_boundaries:
#             stroke(0, 1, 1, 1)
#             line(left - line_length * 0.9 / 2, 0, left - line_length * 0.9 / 2, draw_height)
#             line(right - line_length * 0.9 / 2, 0, right - line_length * 0.9 / 2, draw_height)
        
    popStyle()
    popMatrix()
    

def mouseMoved():
    global selection_name
    i = int(min(mouseX / float(screen_width), 0.9999) * len(roguelikes_list))
    name = roguelikes_list[i]
    selection_name = name
    
    
def draw_label(t, x, y, colour, direction=-PI/2, size=12, x_offset=20, bold=False):
    pushMatrix()
    pushStyle()
    
    noStroke()
    fill(*colour)
    if bold:
        textFont(text_bold)
    else:
        textFont(text_normal)
    textSize(size)
    label_length = textWidth(t)
    translate(x, y)
    rotate(direction)
    rect(x_offset,
        -line_length*0.9 / 2, 
        label_length + 10, 
        line_length * 0.9, 
        2, 2, 2, 2)
    fill(1)
    text(t, x_offset + 5, -line_length*0.9 / 2 + 14)
    
    popStyle()
    popMatrix()     
    
    
def adjust_label(label_boundaries, x):
    x_right = x + line_length * 0.9
    for i in range(6):
        offset = 0
        for left, right in label_boundaries:
            if left <= x <= right:
                offset = line_length * 0.9
            elif left <= x_right <= right:
                offset = -line_length * 0.9
        x += offset
        x_right += offset    
    output = (x, x_right)
    label_boundaries.append(output)
    return label_boundaries, output[0]
    
            
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
    with open('games-years-small.json') as f:
        return json.loads(f.read())
    
def get_roguelike_data():
    with open('game-sources.json') as f:
        games = json.loads(f.read())
        for game in games:
            y = games[game]['Year']
        return games
            
def get_relational_map_data():
    with open('relations.json') as f:
        return json.loads(f.read())


