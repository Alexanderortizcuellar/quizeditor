from typing import Any, List
import pygsheets
from utils import books_of_the_bible


def get_ws():
    file = (
        "/data/data/com.termux/files/home/bin/data/disco-sky-323017-a6c78dad7fb7.json"
    )
    client = pygsheets.authorize(service_account_file=file)
    sheet = client.open("all-questions")
    ws: pygsheets.Worksheet = sheet.worksheet_by_title("questions")
    return ws


class Quoter:
    def __init__(self, quote):
        self.quote = quote
        self.book = None
        self.book_index = None
        self.chapter = None
        self.verse_from = None
        self.verse_to = None

    def _get_book(self):
        for index, b in enumerate(books_of_the_bible):
            if b.lower() in self.quote.lower():
                self.quote = self.quote.replace(b, "").strip()
                self.book_index = index + 1
                return b
        parts = self.quote.split(" ")
        if len(parts) > 1:
            book = parts[0].lower().strip()
            for index, b in enumerate(books_of_the_bible):
                if book in b.lower():
                    self.book_index = index + 1
                    return b
            return None
        return None

    def _get_chapter(self):
        chp_vers = self.quote.split(":")
        if len(chp_vers) > 1:
            return int(chp_vers[0].strip())
        return None

    def _get_verse(self):
        chp_vers = self.quote.split(":")
        if len(chp_vers) > 1:
            verses = chp_vers[1].split("-")
            if len(verses) > 1:
                verses = int(verses[0].strip()), int(verses[1].strip())
                return verses
            else:
                return int(verses[0].strip()), None
        return None

    def get_quote(self):
        try:
            book = self._get_book()
            chapter = self._get_chapter()
            verse = self._get_verse()
            if book is not None and chapter is not None and verse is not None:
                self.book = book
                self.chapter = chapter
                self.verse_from = verse[0]
                self.verse_to = verse[1]
                if verse[1] is None:
                    return f"{book} {chapter}:{verse[0]}"
                return f"{book} {chapter}:{verse[0]}-{verse[1]}"
            return None
        except Exception as e:
            print(e)
            return None


class Question:
    def __init__(
        self, row: int, text: str, answer: str, options: str, quote: str, ws=None
    ) -> None:
        self.row = row
        self.text = text
        self.answer = answer
        self.options = options
        self.quote = quote
        self.ws = get_ws() if ws is None else ws

    def get_values(self):
        values = [self.text, self.answer, self.options, self.quote]
        return values

    def set_text(self, text: str):
        self.text = text

    def set_answer(self, answer: str):
        self.answer = answer

    def set_options(self, options: str):
        self.options = options

    def set_quote(self, quote):
        self.quote = quote

    def update(self):
        self.ws.update_row(index=self.row, values=self.get_values(), col_offset=0)
        print(f"Updated row {self.row} successfully")

    def delete(self):
        self.ws.delete_rows(index=self.row, number=1)
        print(f"deleted row {self.row}")

    def to_json(self) -> dict[str, Any]:
        question_json = {
            "row": self.row,
            "text": self.text,
            "answer": self.answer,
            "options": self.options,
            "quote": self.quote,
        }
        # data = json.dumps(question_json)
        return question_json

    @classmethod
    def from_json(cls, data: dict):
        return cls(**data)

    def __str__(self) -> str:
        return f"text: {self.text}\nanswer: {self.answer}\noptions: {self.options}\nquote: {self.quote}"

    def __repr__(self) -> str:
        return f"text: {self.text}\nanswer: {self.answer}\noptions: {self.options}\nquote: {self.quote}"


class Updater:
    def __init__(self):
        self.ws: pygsheets.Worksheet = get_ws()

    def get_question(self, index: int):
        row = self.ws.get_row(index)
        question = Question(
            index, text=row[0], answer=row[1], options=row[2], quote=row[3], ws=self.ws
        )
        return question

    def update_row(self, values: List[str], row: int):
        """
        A list of values to update
        in the order:
            1. text: str
            2. answer: str
            3. options: str
            4. quote: str.
        """
        try:
            self.ws.update_row(index=row, values=values, col_offset=0)
            return True, None
        except Exception as e:
            print(e)
            return False, str(e)

    def delete_row(self, index: int):
        try:
            self.ws.delete_rows(index)
            return True
        except Exception as e:
            return e

    def get_all(self):
        rows = self.ws.get_all_values()
        return rows
