from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import matplotlib.pyplot as plt
import base64
from io import BytesIO

app = Flask(__name__)
CORS(app)

conn = sqlite3.connect("covid.db")
cur = conn.cursor()
cur.execute("""
CREATE TABLE IF NOT EXISTS covid_items
(id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
price REAL,
img_url TEXT,
purchases INTEGER);
""")
conn.commit()
conn.close()

data = {
    "USA":	{"total": 34406001, "for_date": 4422},
    "India": {"total": 29934361, "for_date": 53009},
    "Brazil":	{"total": 17927928, "for_date": 44178},
    "France":	{"total": 5757311, "for_date": 1815},
    "Turkey":	{"total": 5370299, "for_date": 5091},
    "Russia":	{"total": 5316826, "for_date": 17611},
    "UK":	{"total": 4629874, "for_date": 9284},
    "Argentina":	{"total": 4268789, "for_date": 10395},
    "Italy":	{"total": 4252965, "for_date": 870},
    "Colombia":	{"total": 3945166, "for_date": 27818}
}

@app.route("/string_data", methods=["GET"])
def get_string_search():
    return jsonify({"data": data})

@app.route("/string_search", methods=["POST"])
def post_string_search():
    json_req = request.get_json()
    search = json_req["search"].lower()
    
    searched_values = None
    for country, values in data.items():
        if search in country.lower():
            searched_values = {country: values}
            break
    if searched_values == None:
        return jsonify({"error": "Sorry, we did not found country by your request"})
    else:
        return jsonify({"data": searched_values})

@app.route("/file_data", methods=["GET"])
def get_file_data():
    notes = []
    with open("file.txt", "r") as f:
        for string in f:
            notes.append(string)
    return jsonify({"data": notes})

@app.route("/add_file_data", methods=["POST"])
def add_file_data():
    json_req = request.get_json()
    new_string = str(json_req["new_string"]) + "\n"

    with open("file.txt", "a") as f:
        f.write(new_string)
    return jsonify({"success": True})

@app.route("/remove_last_line", methods=["GET"])
def remove_last_line():
    with open("file.txt", "r+") as f:
        old = f.readlines()
        f.seek(0)
        for i in range(len(old) - 1):
            f.write(old[i])
        f.truncate()
    return jsonify({"success": True})

@app.route("/remove_all_data", methods=["GET"])
def remove_all_data():
    with open("file.txt", "w") as f:
        f.seek(0)
        f.truncate()
    return jsonify({"success": True})

@app.route("/get_db_data", methods=["GET"])
def get_db_data():
    conn = sqlite3.connect("covid.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM covid_items")
    items = cur.fetchall()
    for i in range(len(items)):
        items[i] = dict(items[i])
    conn.close()
    return jsonify({"data": items})

@app.route("/add_item_in_db", methods=["POST"])
def add_item_in_db():
    json_req = request.get_json()
    item = json_req["item"]
    conn = sqlite3.connect("covid.db")
    cur = conn.cursor()
    cur.execute(f"""INSERT INTO covid_items 
                VALUES (null, '{item['name']}', {item['price']}, '{item['img_url']}', {0})""")
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/purchase", methods=["POST"])
def purchase():
    json_req = request.get_json()
    item_id = json_req["item_id"]
    number = json_req["number"]
    conn = sqlite3.connect("covid.db")
    cur = conn.cursor()
    cur.execute(f"UPDATE covid_items SET purchases={number} WHERE id={item_id}")
    conn.commit()
    conn.close()
    return jsonify({"success": True})


@app.route("/get_diagrams", methods=["GET"])
def get_diagrams():
    conn = sqlite3.connect("covid.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    cur.execute("SELECT * FROM covid_items")
    items = cur.fetchall()
    conn.close()

    all_puchaces = 0
    # all_money = 0
    for i in range(len(items)):
        items[i] = dict(items[i])
        all_puchaces += items[i]["purchases"]
        # all_money += items[i]["purchases"] * items[i]["price"]

    labels = []
    purchases_distribution = []
    money = []
    for i in range(len(items)):
        labels.append(items[i]["name"])
        purchases_distribution.append(items[i]["purchases"]/all_puchaces)
        money.append((items[i]["purchases"] * items[i]["price"]))

    fig1 = plt.Figure()
    ax1 = fig1.subplots()
    ax1.pie(purchases_distribution, labels=labels, autopct='%1.1f%%',
            shadow=True, startangle=90)
    ax1.set_title("Распределение покупок по товарам")
    ax1.axis('equal')

    fig2 = plt.Figure()
    ax2 = fig2.subplots()
    ax2.bar(labels, money)
    ax2.set_title("Доход с товаров в рублях")

    buf1 = BytesIO()
    fig1.savefig(buf1, format="png")
    img1 = base64.b64encode(buf1.getbuffer()).decode("ascii")
    img1 = f"<img src='data:image/png;base64,{img1}'/>"

    buf2 = BytesIO()
    fig2.savefig(buf2, format="png")
    img2 = base64.b64encode(buf2.getbuffer()).decode("ascii")
    img2 = f"<img src='data:image/png;base64,{img2}'/>"

    return jsonify({"data": {"img1": img1, "img2": img2}})

if __name__ == "__main__":
    app.run(debug=True)
