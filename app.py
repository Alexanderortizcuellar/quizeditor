from typing import List
from flask import Flask, abort, jsonify, render_template, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from deep_translator import GoogleTranslator
from updater import Updater, Quoter
import random


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)
app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
db.init_app(app)
updater = Updater()


class Bible(db.Model, SerializerMixin):
    # serialize_rules = ("-book",)
    id: Mapped[int] = mapped_column(primary_key=True)
    book_id: Mapped[int] = mapped_column(ForeignKey("book.id"), name="book")
    chapter: Mapped[int]
    verse: Mapped[int]
    text: Mapped[str]
    book: Mapped["Book"] = relationship(back_populates="verses")


class Book(db.Model, SerializerMixin):
    serialize_rules = ("-verses",)
    id: Mapped[int] = mapped_column(primary_key=True)
    short_name: Mapped[str]
    long_name: Mapped[str]
    color: Mapped[str]
    verses: Mapped[List["Bible"]] = relationship(back_populates="book")


with app.app_context():
    db.create_all()


@app.route("/")
def home():
    return render_template("home.html")


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


@app.route("/update", methods=["POST"])
def update():
    if request.method == "POST":
        row = request.get_json().get("row")
        text = request.get_json().get("text")
        answer = request.get_json().get("answer")
        options = request.get_json().get("options")
        quote = request.get_json().get("quote")
        values = [text, answer, options, quote]
        success, msg = updater.update_row(values=values, row=int(row))
        # success, msg = False, str("")
        if not success:
            return jsonify({"error": True, "msg": str(msg)})
        return jsonify({"result": "success", "error": False, "msg": ""})
    return abort(405)


@app.route("/delete/<int:id>", methods=["POST"])
def delete_question(id: int):
    if request.method == "POST":
        success, err = updater.delete_row(id)
        if not success:
            return jsonify({"success": False, "error": True, "msg": str(err)}), 200
        return jsonify({"success": True})
    return abort(405)


@app.route("/bible", methods=["POST"])
def bible():
    if request.method == "POST":
        quote = request.get_json().get("quote", "")
        quoter = Quoter(quote)
        success = quoter.get_quote()
        if success is None:
            return jsonify({"err": "error parsing quote"}), 500
        if quoter.verse_to:
            bible_text = (
                Bible.query.filter_by(book_id=quoter.book_index)
                .filter_by(chapter=quoter.chapter)
                .filter(Bible.verse.between(quoter.verse_from, quoter.verse_to))
                .all()
            )
        else:
            bible_text = (
                Bible.query.filter_by(book_id=quoter.book_index)
                .filter_by(chapter=quoter.chapter)
                .filter_by(verse=quoter.verse_from)
                .all()
            )
        bible_text = [verse.to_dict() for verse in bible_text]
        return jsonify(bible_text)
    return abort(405)


@app.route("/bible/search", methods=["GET"])
def search():
    query = request.args.get("query")
    page = request.args.get("page", 1)
    page_items = request.args.get("perPage", 10)
    results = Bible.query.filter(Bible.text.contains(query)).paginate(
        page=int(page), per_page=int(page_items)
    )
    pages = []
    for pagenum in results.iter_pages(
        left_edge=1, right_edge=1, left_current=1, right_current=1
    ):
        pages.append(pagenum)
    results_list = [text.to_dict() for text in results]
    return jsonify(
        {
            "query": query,
            "results": results_list,
            "page": page,
            "next": results.next_num,
            "previous": results.prev_num,
            "totalPages": results.pages,
            "totalMatches": results.total,
            "pages": pages,
        }
    )


@app.route("/translate")
def translate():
    try:
        source = request.args.get("source", "en")
        target = request.args.get("target", "en")
        text = request.args.get("text", "")
        translator = GoogleTranslator(source, target)
        translated_text = translator.translate(text)
    except Exception as e:
        return jsonify({"error": True, "msg": str(e)})
    return jsonify({"error": False, "translation": translated_text})


@app.route("/details/<int:id>")
def details():
    return render_template("index.html")
