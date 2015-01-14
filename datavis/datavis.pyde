import json

games_data = {}
roguelike_data = {}
relational_map_data = {}

def setup():
    size(1024, 1024, P2D)
    
    games_data = get_games_data()
    roguelike_data = get_roguelike_data()
    relational_map_data = get_relational_map_data()
    
    print games_data.iteritems().next()
    

def draw():
    background(0)
    pass

def get_games_data():
    with open('games-years.json') as f:
        return json.loads(f.read())
    
def get_roguelike_data():
    with open('roguelike-games.json') as f:
        return json.loads(f.read())
    
def get_relational_map_data():
    with open('roguelike-relational-maps.json') as f:
        return json.loads(f.read())
    

