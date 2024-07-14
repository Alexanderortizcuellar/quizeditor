from flask import Flask, jsonify, render_template, request
from http import HTTPStatus
from updater import Updater
import random

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
updater = Updater()


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/fetch")
def get_question():
    try:
        rand = random.randint(1, 10000)
        question = updater.get_question(rand)
    except Exception as err:
        return jsonify({"error": True, "msg": str(err)}), 500

    return jsonify(question.to_json() | {"error": False})


@app.route("/edit", methods=["GET", "POST"])
def edit():
    if request.method == "POST":
        row = request.get_json().get("row")
        text = request.get_json().get("text")
        answer = request.get_json().get("answer")
        options = request.get_json().get("options")
        quote = request.get_json().get("quote")
        print(row, text, answer, options, quote)
    return render_template("edit.html")


@app.route("/details/<int:id>")
def details(id):
    return render_template("index.html")
