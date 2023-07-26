import os
from flask import Flask, Response
app = Flask(__name__)

files = {
    "index":"app/index.html",
    "main":"app/main.js",
    "sprite":"app/sprites.png",
}


cached_times = {k:os.stat(v).st_mtime for k,v in files.items()}

@app.route("/")
def index():
    return open(files["index"],"r").read()

@app.route("/main.js")
def tile():
    return open(files["main"],"r").read()

@app.route("/sprites.png")
def sprite():
    return open(files["sprite"],"rb").read()

@app.route("/reload", methods=["GET"])
def sse():
    def sse_events():
        while True:
            for k in files:
                current_modtime = os.stat(files[k]).st_mtime
                if current_modtime != cached_times[k]:
                    cached_times[k] = current_modtime
                    yield "data: reloading\n\n"

    # Send back response
    return Response(sse_events(), mimetype="text/event-stream")

if __name__ == "__main__":
    app.run(host="localhost",port=8081,debug=True)